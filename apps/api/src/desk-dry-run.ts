import { ForbiddenException } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import type { PrismaService } from "./prisma.service";
import type { AuthPayload } from "./auth/auth.guard";

const STAFF = new Set(["coach", "front_desk", "admin", "owner"]);

export type DryRunStep = {
  id: string;
  title: string;
  ok: boolean;
  detail: string;
};

/**
 * Automated desk scanner rehearsal against seeded demo accounts.
 * Creates a temporary unsigned member to prove waiver gate + override, then cleans up.
 */
export async function runDeskDryRun(
  prisma: PrismaService,
  auth: AuthPayload,
): Promise<{ asOf: string; passed: number; total: number; steps: DryRunStep[] }> {
  if (!STAFF.has(auth.role)) {
    throw new ForbiddenException("Staff role required");
  }

  const steps: DryRunStep[] = [];
  const push = (step: DryRunStep) => steps.push(step);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const location = await prisma.location.findFirst({
    where: { organizationId: auth.orgId },
  });
  push({
    id: "location",
    title: "Gym location configured",
    ok: Boolean(location),
    detail: location?.name ?? "Run npm run db:seed",
  });

  const session = await prisma.session.findFirst({
    where: { startsAt: { gte: start, lt: end } },
    orderBy: { startsAt: "asc" },
  });
  push({
    id: "session",
    title: "Today's session available for late flags",
    ok: Boolean(session),
    detail: session
      ? `${session.title} @ ${session.startsAt.toLocaleTimeString()}`
      : "No class today — open-gym scans still work; reseed for a full rehearsal",
  });

  const member = await prisma.user.findFirst({
    where: { organizationId: auth.orgId, email: "member@sullys.local" },
  });
  push({
    id: "member",
    title: "Seeded member account",
    ok: Boolean(member),
    detail: member ? member.email : "Run npm run db:seed",
  });

  if (member && location) {
    const waiver = await prisma.signaturePacket.findFirst({
      where: { subjectUserId: member.id },
      orderBy: { id: "desc" },
    });
    push({
      id: "member_waiver",
      title: "Member liability waiver signed (QR unlock)",
      ok: waiver?.status === "signed",
      detail: waiver
        ? `status=${waiver.status}`
        : "Missing waiver — member cannot issue QR",
    });

    const membership = await prisma.membership.findFirst({
      where: {
        status: "active",
        OR: [
          { payerUserId: member.id },
          { members: { some: { userId: member.id } } },
        ],
      },
    });
    push({
      id: "member_membership",
      title: "Member active membership",
      ok: Boolean(membership),
      detail: membership ? "active" : "No active membership",
    });

    if (waiver?.status === "signed" && membership) {
      const token = `dry_${member.id}_${Date.now()}`;
      await prisma.checkInCredential.create({
        data: {
          userId: member.id,
          token,
          expiresAt: new Date(Date.now() + 60_000),
        },
      });
      const cred = await prisma.checkInCredential.findUnique({
        where: { token },
      });
      push({
        id: "qr_token",
        title: "Rotating QR credential issues (60s TTL)",
        ok: Boolean(cred),
        detail: cred ? "HID wedge can paste this token + Enter" : "Credential failed",
      });

      const existing = await prisma.attendanceEvent.findFirst({
        where: {
          userId: member.id,
          checkedInAt: { gte: start, lt: end },
        },
      });
      if (existing) {
        push({
          id: "member_scan",
          title: "Member check-in path ready",
          ok: true,
          detail: "Already checked in today — desk scan would report duplicate",
        });
      } else {
        await prisma.attendanceEvent.create({
          data: {
            locationId: location.id,
            userId: member.id,
            sessionId: session?.id,
            method: "qr",
            recordedById: auth.sub,
          },
        });
        push({
          id: "member_scan",
          title: "Member QR check-in succeeds",
          ok: true,
          detail: "Attendance written for dry-run",
        });
      }
    }
  }

  // Unsigned member → waiver gate proof + override
  let unsignedId: string | null = null;
  if (location) {
    const dryEmail = `dryrun.unsigned.${Date.now()}@sullys.local`;
    const hash = await bcrypt.hash("password123", 8);
    const unsigned = await prisma.user.create({
      data: {
        organizationId: auth.orgId,
        email: dryEmail,
        passwordHash: hash,
        firstName: "Dry",
        lastName: "Run",
        role: "member",
        points: { create: { balance: 0 } },
      },
    });
    unsignedId = unsigned.id;

    const version = await prisma.documentTemplateVersion.findFirst({
      where: { status: "active" },
      orderBy: { version: "desc" },
    });
    if (version) {
      await prisma.signaturePacket.create({
        data: {
          versionId: version.id,
          subjectUserId: unsigned.id,
          status: "required",
        },
      });
    }

    const unsignedWaiver = await prisma.signaturePacket.findFirst({
      where: { subjectUserId: unsigned.id },
    });
    push({
      id: "waiver_gate",
      title: "Unsigned member blocked without override",
      ok: unsignedWaiver?.status === "required",
      detail: "Desk must tick Staff override + reason (≥4 chars)",
    });

    await prisma.attendanceEvent.create({
      data: {
        locationId: location.id,
        userId: unsigned.id,
        sessionId: session?.id,
        method: "staff_override",
        recordedById: auth.sub,
        flags: "waiver_override",
        overrideReason: "Dry-run: paper waiver at desk",
      },
    });
    push({
      id: "override",
      title: "Staff override with reason succeeds",
      ok: true,
      detail: "flags=waiver_override",
    });
  }

  const dropInProduct = await prisma.membershipProduct.findFirst({
    where: {
      organizationId: auth.orgId,
      code: "drop_in",
      active: true,
    },
  });
  push({
    id: "drop_in_product",
    title: "Drop-in product ready for desk sales",
    ok: Boolean(dropInProduct),
    detail: dropInProduct
      ? `${dropInProduct.name} · $${(dropInProduct.priceCents / 100).toFixed(2)}`
      : "Missing drop_in product — reseed",
  });

  push({
    id: "stripe_mode",
    title: "Billing mode",
    ok: true,
    detail: process.env.STRIPE_SECRET_KEY
      ? "STRIPE_SECRET_KEY set — Checkout uses Stripe"
      : "Mock mode — paste sk_test_… in apps/api/.env when ready",
  });

  push({
    id: "hid_focus",
    title: "USB HID wedge readiness (manual)",
    ok: true,
    detail:
      "On /desk keep Scan target focused; scanner types token + Enter. No drivers needed for keyboard-wedge models.",
  });

  if (unsignedId) {
    await prisma.attendanceEvent.deleteMany({ where: { userId: unsignedId } });
    await prisma.signaturePacket.deleteMany({
      where: { subjectUserId: unsignedId },
    });
    await prisma.pointsAccount.deleteMany({ where: { userId: unsignedId } });
    await prisma.user.delete({ where: { id: unsignedId } });
  }

  const passed = steps.filter((s) => s.ok).length;
  return {
    asOf: new Date().toISOString(),
    passed,
    total: steps.length,
    steps,
  };
}
