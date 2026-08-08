import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { PrismaService } from "./prisma.service";
import {
  AuthGuard,
  CurrentUser,
  readToken,
  verifyToken,
  type AuthPayload,
} from "./auth/auth.guard";
import { resolveSessionForMember } from "./check-in-session";

const STAFF_ROLES = new Set([
  "coach",
  "front_desk",
  "admin",
  "owner",
]);

function requireStaff(auth: AuthPayload) {
  if (!STAFF_ROLES.has(auth.role)) {
    throw new ForbiddenException("Staff role required");
  }
}

@Controller("sessions")
export class SessionsController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query("from") from?: string, @Req() req?: Request) {
    let authSub: string | null = null;
    const token = req ? readToken(req) : null;
    if (token) {
      try {
        authSub = (await verifyToken(token)).sub;
      } catch {
        authSub = null;
      }
    }

    const start = from ? new Date(from) : new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 14);

    const sessions = await this.prisma.session.findMany({
      where: { startsAt: { gte: start, lt: end } },
      include: {
        program: true,
        bookings: true,
        room: true,
        coach: { select: { firstName: true, lastName: true } },
      },
      orderBy: { startsAt: "asc" },
    });

    return {
      sessions: sessions.map((s) => {
        const confirmed = s.bookings.filter((b) =>
          ["confirmed", "checked_in"].includes(b.status),
        ).length;
        const waitlisted = s.bookings.filter(
          (b) => b.status === "waitlisted",
        ).length;
        const mine = authSub
          ? s.bookings.find(
              (b) =>
                b.userId === authSub &&
                ["confirmed", "waitlisted", "checked_in"].includes(b.status),
            )
          : null;
        const spotsLeft = Math.max(0, s.capacity - confirmed);
        return {
          id: s.id,
          title: s.title,
          program: s.program.name,
          startsAt: s.startsAt.toISOString(),
          endsAt: s.endsAt.toISOString(),
          capacity: s.capacity,
          booked: confirmed,
          waitlisted,
          spotsLeft,
          status: spotsLeft <= 0 ? "full" : "open",
          coachName: s.coach
            ? `${s.coach.firstName} ${s.coach.lastName}`
            : s.coachName,
          coachUserId: s.coachUserId,
          room: s.room?.name,
          myBookingStatus: mine?.status ?? null,
        };
      }),
    };
  }

  @Get(":id/roster")
  @UseGuards(AuthGuard)
  async roster(@Param("id") id: string, @CurrentUser() auth: AuthPayload) {
    requireStaff(auth);
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        program: true,
        bookings: {
          where: { status: { not: "cancelled" } },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        attendance: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });
    if (!session) throw new BadRequestException("Session not found");

    const attendanceByUser = new Map(
      session.attendance.map((a) => [a.userId, a]),
    );

    const roster = session.bookings.map((b) => {
      const att = attendanceByUser.get(b.userId);
      const voided = att?.status === "voided";
      const late =
        !voided &&
        (att?.lateBySeconds != null && att.lateBySeconds > 600
          ? true
          : att?.status === "late");
      const checkedIn =
        !voided && (Boolean(att && att.status !== "voided") || b.status === "checked_in");
      return {
        userId: b.userId,
        name: `${b.user.firstName} ${b.user.lastName}`,
        email: b.user.email,
        bookingStatus: b.status,
        attendanceId: att?.id ?? null,
        checkedIn,
        late,
        noShow: b.status === "no_show",
        voided,
        lateBySeconds: att?.lateBySeconds ?? null,
        checkedInAt: att?.checkedInAt?.toISOString() ?? null,
      };
    });

    return {
      session: {
        id: session.id,
        title: session.title,
        program: session.program.name,
        startsAt: session.startsAt.toISOString(),
        endsAt: session.endsAt.toISOString(),
        capacity: session.capacity,
        coachName: session.coachName,
      },
      roster,
      counts: {
        booked: roster.length,
        checkedIn: roster.filter((r) => r.checkedIn).length,
        late: roster.filter((r) => r.late).length,
        noShow: roster.filter((r) => r.noShow).length,
      },
    };
  }

  @Post(":id/attendance/finalize")
  @UseGuards(AuthGuard)
  async finalizeAttendance(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    requireStaff(auth);
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        bookings: { where: { status: { not: "cancelled" } } },
        attendance: true,
      },
    });
    if (!session) throw new BadRequestException("Session not found");

    const checkedInUsers = new Set(
      session.attendance
        .filter((a) => a.status !== "voided")
        .map((a) => a.userId),
    );

    const toNoShow = session.bookings.filter(
      (b) =>
        b.status !== "checked_in" &&
        b.status !== "no_show" &&
        !checkedInUsers.has(b.userId),
    );

    if (toNoShow.length) {
      await this.prisma.booking.updateMany({
        where: { id: { in: toNoShow.map((b) => b.id) } },
        data: { status: "no_show" },
      });
    }

    return {
      sessionId: id,
      markedNoShow: toNoShow.length,
      alreadySettled:
        session.bookings.length - toNoShow.length,
    };
  }

  @Post(":id/bookings/cancel")
  @UseGuards(AuthGuard)
  async cancelBooking(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
    @Body() body: { forUserId?: string } = {},
  ) {
    let bookFor = auth.sub;
    if (body.forUserId && body.forUserId !== auth.sub) {
      const link = await this.prisma.guardianship.findFirst({
        where: { guardianUserId: auth.sub, childUserId: body.forUserId },
      });
      if (!link) {
        throw new ForbiddenException("Not authorized");
      }
      bookFor = body.forUserId;
    }

    const existing = await this.prisma.booking.findUnique({
      where: {
        sessionId_userId: { sessionId: id, userId: bookFor },
      },
    });
    if (!existing || existing.status === "cancelled") {
      throw new BadRequestException("No active booking");
    }

    await this.prisma.booking.update({
      where: { id: existing.id },
      data: { status: "cancelled" },
    });

    let promoted: { userId: string; bookingId: string } | null = null;
    if (["confirmed", "checked_in"].includes(existing.status)) {
      const next = await this.prisma.booking.findFirst({
        where: { sessionId: id, status: "waitlisted" },
        orderBy: { createdAt: "asc" },
      });
      if (next) {
        await this.prisma.booking.update({
          where: { id: next.id },
          data: { status: "confirmed" },
        });
        promoted = { userId: next.userId, bookingId: next.id };
      }
    }

    return { cancelled: true, promoted };
  }

  @Post(":id/bookings")
  @UseGuards(AuthGuard)
  async book(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
    @Body() body: { forUserId?: string; waitlist?: boolean },
  ) {
    let bookFor = auth.sub;
    if (body.forUserId && body.forUserId !== auth.sub) {
      const link = await this.prisma.guardianship.findFirst({
        where: { guardianUserId: auth.sub, childUserId: body.forUserId },
      });
      if (!link) {
        throw new ForbiddenException("Not authorized to book for this child");
      }
      bookFor = body.forUserId;
    }

    const session = await this.prisma.session.findUnique({
      where: { id },
      include: { bookings: true },
    });
    if (!session) throw new BadRequestException("Session not found");

    const confirmed = session.bookings.filter((b) =>
      ["confirmed", "checked_in"].includes(b.status),
    ).length;
    const full = confirmed >= session.capacity;
    const status = full ? "waitlisted" : "confirmed";
    if (full && body.waitlist === false) {
      throw new BadRequestException("Class is full");
    }

    const booking = await this.prisma.booking.upsert({
      where: {
        sessionId_userId: { sessionId: id, userId: bookFor },
      },
      create: {
        sessionId: id,
        userId: bookFor,
        status,
      },
      update: { status },
    });

    return {
      booking,
      forUserId: bookFor,
      waitlisted: status === "waitlisted",
      message:
        status === "waitlisted"
          ? "Class full — you're on the waitlist"
          : "Booked. See you on the floor.",
    };
  }
}

@Controller("bookings")
@UseGuards(AuthGuard)
export class BookingsController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("me")
  async mine(@CurrentUser() auth: AuthPayload) {
    const now = new Date();
    const bookings = await this.prisma.booking.findMany({
      where: {
        userId: auth.sub,
        status: { in: ["confirmed", "waitlisted", "checked_in"] },
        session: { startsAt: { gte: now } },
      },
      include: {
        session: {
          include: {
            coach: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { session: { startsAt: "asc" } },
    });
    return {
      bookings: bookings.map((b) => ({
        id: b.id,
        status: b.status,
        sessionId: b.sessionId,
        title: b.session.title,
        startsAt: b.session.startsAt.toISOString(),
        endsAt: b.session.endsAt.toISOString(),
        coach: b.session.coach
          ? `${b.session.coach.firstName} ${b.session.coach.lastName}`
          : b.session.coachName,
      })),
    };
  }
}

@Controller("calendar")
@UseGuards(AuthGuard)
export class CalendarController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("today")
  async today(@CurrentUser() auth: AuthPayload) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const sessions = await this.prisma.session.findMany({
      where: { startsAt: { gte: start, lt: end } },
      include: {
        bookings: { where: { userId: auth.sub, status: { not: "cancelled" } } },
        program: true,
      },
      orderBy: { startsAt: "asc" },
    });

    const announcements = await this.prisma.announcement.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    const xp = await this.prisma.xpLedger.aggregate({
      where: { userId: auth.sub },
      _sum: { delta: true },
    });

    const assignment = await this.prisma.mealPlanAssignment.findFirst({
      where: { userId: auth.sub, active: true },
      include: { mealPlan: true },
    });

    const kitchenReady = await this.prisma.kitchenOrder.findFirst({
      where: { userId: auth.sub, status: "ready" },
      orderBy: { updatedAt: "desc" },
    });

    const items: Array<Record<string, unknown>> = [
      ...sessions.map((s) => ({
        id: s.id,
        kind: "class_session",
        title: s.title,
        startsAt: s.startsAt.toISOString(),
        endsAt: s.endsAt.toISOString(),
        booked: s.bookings.length > 0,
        program: s.program.name,
      })),
      ...announcements.map((a) => ({
        id: a.id,
        kind: "gym_event",
        title: a.title,
        startsAt: a.createdAt.toISOString(),
        body: a.body,
      })),
      {
        id: "streak",
        kind: "achievement_nudge",
        title: `XP balance: ${xp._sum.delta ?? 0}`,
        startsAt: new Date().toISOString(),
      },
    ];

    if (assignment) {
      items.push({
        id: `nutrition-${assignment.id}`,
        kind: "nutrition_plan",
        title: assignment.mealPlan.name,
        startsAt: start.toISOString(),
        body: assignment.mealPlan.description,
      });
    }

    if (kitchenReady) {
      items.push({
        id: `kitchen-${kitchenReady.id}`,
        kind: "nutrition_pickup",
        title: "Kitchen order ready for pickup",
        startsAt: kitchenReady.updatedAt.toISOString(),
      });
    }

    return { items };
  }
}

export async function performCheckIn(
  prisma: PrismaService,
  opts: {
    memberUserId: string;
    orgId: string;
    sessionId?: string;
    method: string;
    recordedById?: string;
    override?: boolean;
    overrideReason?: string;
  },
) {
  const location = await prisma.location.findFirst({
    where: { organizationId: opts.orgId },
  });
  if (!location) throw new BadRequestException("No location");

  const membership = await prisma.membership.findFirst({
    where: {
      status: "active",
      OR: [
        { payerUserId: opts.memberUserId },
        { members: { some: { userId: opts.memberUserId } } },
      ],
    },
  });
  const waiver = await prisma.signaturePacket.findFirst({
    where: { subjectUserId: opts.memberUserId },
    orderBy: { id: "desc" },
  });
  const waiverOk = Boolean(waiver && waiver.status === "signed");
  const membershipOk = Boolean(membership);

  const flags: string[] = [];
  if (!membershipOk || !waiverOk) {
    if (!opts.override) {
      if (!membershipOk) {
        throw new BadRequestException("Active membership required");
      }
      throw new BadRequestException(
        "Signed liability waiver required before check-in",
      );
    }
    if (!opts.overrideReason?.trim() || opts.overrideReason.trim().length < 4) {
      throw new BadRequestException(
        "overrideReason required (min 4 chars) for staff override",
      );
    }
    if (!opts.recordedById) {
      throw new BadRequestException("Only staff can override check-in gates");
    }
    if (!membershipOk) flags.push("membership_override");
    if (!waiverOk) flags.push("waiver_override");
  }

  const since = new Date(Date.now() - 5 * 60 * 1000);
  const recent = await prisma.attendanceEvent.findFirst({
    where: {
      userId: opts.memberUserId,
      checkedInAt: { gte: since },
      ...(opts.sessionId
        ? { sessionId: opts.sessionId }
        : { sessionId: null }),
    },
  });
  if (recent) {
    const dupUser = await prisma.user.findUniqueOrThrow({
      where: { id: opts.memberUserId },
    });
    return {
      attendance: recent,
      xpAwarded: 0,
      duplicate: true,
      overridden: false,
      member: {
        id: dupUser.id,
        name: `${dupUser.firstName} ${dupUser.lastName}`,
        email: dupUser.email,
      },
    };
  }

  let lateBySeconds: number | undefined;
  if (opts.sessionId) {
    const session = await prisma.session.findUnique({
      where: { id: opts.sessionId },
    });
    if (session) {
      lateBySeconds = Math.max(
        0,
        Math.floor((Date.now() - session.startsAt.getTime()) / 1000),
      );
      await prisma.booking.updateMany({
        where: { sessionId: opts.sessionId, userId: opts.memberUserId },
        data: { status: "checked_in" },
      });
    }
  }

  const event = await prisma.attendanceEvent.create({
    data: {
      locationId: location.id,
      userId: opts.memberUserId,
      sessionId: opts.sessionId,
      recordedById: opts.recordedById,
      method: flags.length ? "staff_override" : opts.method,
      status: lateBySeconds && lateBySeconds > 600 ? "late" : "checked_in",
      lateBySeconds,
      overrideReason: flags.length ? opts.overrideReason?.trim() : null,
      flags: flags.join(","),
    },
  });

  await prisma.xpLedger.create({
    data: {
      userId: opts.memberUserId,
      delta: 10,
      reason: "attendance.checked_in",
    },
  });
  await prisma.pointsAccount.upsert({
    where: { userId: opts.memberUserId },
    create: { userId: opts.memberUserId, balance: 10 },
    update: { balance: { increment: 10 } },
  });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: opts.memberUserId },
  });

  return {
    attendance: event,
    xpAwarded: 10,
    overridden: flags.length > 0,
    flags,
    member: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    },
  };
}

@Controller("check-in")
@UseGuards(AuthGuard)
export class CheckInController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("token")
  async token(@CurrentUser() auth: AuthPayload) {
    const waiver = await this.prisma.signaturePacket.findFirst({
      where: { subjectUserId: auth.sub },
      orderBy: { id: "desc" },
    });
    if (!waiver || waiver.status !== "signed") {
      throw new BadRequestException(
        "Signed liability waiver required before check-in QR is issued",
      );
    }

    const token = `SUL-${auth.sub.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 60_000);
    await this.prisma.checkInCredential.create({
      data: { userId: auth.sub, token, expiresAt },
    });
    await this.prisma.checkInCredential.deleteMany({
      where: { userId: auth.sub, expiresAt: { lt: new Date() } },
    });
    return {
      token,
      expiresInSeconds: 60,
      expiresAt: expiresAt.toISOString(),
      userId: auth.sub,
    };
  }

  @Post()
  async checkIn(
    @CurrentUser() auth: AuthPayload,
    @Body() body: { sessionId?: string; token?: string },
  ) {
    // body.token ignored for self check-in — auth.sub is the member
    const sessionId =
      body.sessionId?.trim() ||
      (await resolveSessionForMember(this.prisma, auth.sub));
    const result = await performCheckIn(this.prisma, {
      memberUserId: auth.sub,
      orgId: auth.orgId,
      sessionId: sessionId ?? undefined,
      method: "self",
    });
    return this.withSessionLabel(result, sessionId);
  }

  @Post("scan")
  async scan(
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      token?: string;
      sessionId?: string;
      email?: string;
      override?: boolean;
      overrideReason?: string;
    },
  ) {
    requireStaff(auth);

    let memberUserId: string | undefined;

    if (body.token) {
      const cred = await this.prisma.checkInCredential.findUnique({
        where: { token: body.token },
      });
      if (!cred || cred.expiresAt.getTime() < Date.now()) {
        throw new BadRequestException("Invalid or expired check-in token");
      }
      memberUserId = cred.userId;
      await this.prisma.checkInCredential.delete({ where: { id: cred.id } });
    } else if (body.email) {
      const user = await this.prisma.user.findFirst({
        where: {
          organizationId: auth.orgId,
          email: body.email.trim().toLowerCase(),
        },
      });
      if (!user) throw new BadRequestException("Member not found");
      memberUserId = user.id;
    } else {
      throw new BadRequestException("token or email required");
    }

    const sessionId =
      body.sessionId?.trim() ||
      (await resolveSessionForMember(this.prisma, memberUserId));

    const result = await performCheckIn(this.prisma, {
      memberUserId,
      orgId: auth.orgId,
      sessionId: sessionId ?? undefined,
      method: body.token ? "qr_scan" : "manual",
      recordedById: auth.sub,
      override: body.override,
      overrideReason: body.overrideReason,
    });
    return this.withSessionLabel(result, sessionId);
  }

  private async withSessionLabel<T extends object>(
    result: T,
    sessionId: string | null | undefined,
  ) {
    if (!sessionId) {
      return { ...result, sessionId: null, sessionTitle: "Open gym" };
    }
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      select: { id: true, title: true },
    });
    return {
      ...result,
      sessionId: session?.id ?? sessionId,
      sessionTitle: session?.title ?? "Class",
    };
  }

  @Get("search")
  async search(
    @CurrentUser() auth: AuthPayload,
    @Query("q") q?: string,
  ) {
    requireStaff(auth);
    if (!q || q.trim().length < 2) return { members: [] };
    const term = q.trim().toLowerCase();
    const members = await this.prisma.user.findMany({
      where: {
        organizationId: auth.orgId,
        role: { in: ["member", "parent", "child"] },
        OR: [
          { email: { contains: term } },
          { firstName: { contains: term } },
          { lastName: { contains: term } },
        ],
      },
      take: 20,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      },
    });
    return {
      members: members.map((m) => ({
        id: m.id,
        email: m.email,
        name: `${m.firstName} ${m.lastName}`,
        role: m.role,
      })),
    };
  }
}

@Controller("attendance")
@UseGuards(AuthGuard)
export class AttendanceController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("me")
  async me(@CurrentUser() auth: AuthPayload) {
    const events = await this.prisma.attendanceEvent.findMany({
      where: { userId: auth.sub },
      include: { session: true },
      orderBy: { checkedInAt: "desc" },
      take: 50,
    });
    return { events };
  }

  @Post(":id/void")
  async voidAttendance(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
    @Body() body: { reason?: string },
  ) {
    requireStaff(auth);
    const reason = body.reason?.trim();
    if (!reason || reason.length < 4) {
      throw new BadRequestException("reason required (min 4 chars)");
    }

    const event = await this.prisma.attendanceEvent.findUnique({
      where: { id },
    });
    if (!event) throw new BadRequestException("Attendance not found");
    if (event.status === "voided") {
      return { attendance: event, alreadyVoided: true };
    }

    const updated = await this.prisma.attendanceEvent.update({
      where: { id },
      data: {
        status: "voided",
        overrideReason: reason,
        flags: [event.flags, "voided"].filter(Boolean).join(","),
        recordedById: auth.sub,
      },
    });

    if (event.sessionId) {
      await this.prisma.booking.updateMany({
        where: {
          sessionId: event.sessionId,
          userId: event.userId,
          status: "checked_in",
        },
        data: { status: "confirmed" },
      });
    }

    return { attendance: updated };
  }
}

@Controller("documents")
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("requirements")
  async requirements(@CurrentUser() auth: AuthPayload) {
    const packets = await this.prisma.signaturePacket.findMany({
      where: {
        OR: [
          { subjectUserId: auth.sub },
          {
            subjectUserId: {
              in: (
                await this.prisma.guardianship.findMany({
                  where: { guardianUserId: auth.sub },
                  select: { childUserId: true },
                })
              ).map((g) => g.childUserId),
            },
          },
        ],
      },
      include: {
        version: { include: { template: true } },
        signatures: { orderBy: { signedAt: "desc" }, take: 1 },
      },
    });
    return { packets };
  }

  @Get("packets/:id/pdf")
  async pdf(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
    @Res() res: Response,
  ) {
    const packet = await this.prisma.signaturePacket.findUnique({
      where: { id },
      include: {
        version: { include: { template: true } },
        signatures: { orderBy: { signedAt: "desc" }, take: 1 },
      },
    });
    if (!packet) throw new BadRequestException("Packet not found");

    const isSubject = packet.subjectUserId === auth.sub;
    let allowed = isSubject;
    if (!allowed) {
      const link = await this.prisma.guardianship.findFirst({
        where: {
          guardianUserId: auth.sub,
          childUserId: packet.subjectUserId,
        },
      });
      allowed = Boolean(link);
    }
    if (!allowed && STAFF_ROLES.has(auth.role)) {
      allowed = true;
    }
    if (!allowed) throw new ForbiddenException("Not allowed to download");

    const subject = await this.prisma.user.findUniqueOrThrow({
      where: { id: packet.subjectUserId },
    });
    const { buildWaiverPdf } = await import("./waiver-pdf");
    const pdf = await buildWaiverPdf({
      gymName: "Sully's Boxing Gym",
      templateName: packet.version.template.name,
      body: packet.version.body,
      subjectName: `${subject.firstName} ${subject.lastName}`,
      subjectEmail: subject.email,
      signerName: packet.signatures[0]?.typedName ?? "—",
      signedAt: packet.signedAt,
      packetId: packet.id,
      status: packet.status,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="sullys-waiver-${packet.id.slice(0, 8)}.pdf"`,
    );
    return res.send(pdf);
  }

  @Post("packets/:id/sign")
  async sign(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
    @Body() body: { typedName?: string },
  ) {
    const packet = await this.prisma.signaturePacket.findUnique({
      where: { id },
    });
    if (!packet) throw new BadRequestException("Packet not found");

    const isSubject = packet.subjectUserId === auth.sub;
    let isGuardian = false;
    if (!isSubject) {
      const link = await this.prisma.guardianship.findFirst({
        where: {
          guardianUserId: auth.sub,
          childUserId: packet.subjectUserId,
        },
      });
      isGuardian = Boolean(link);
    }
    if (!isSubject && !isGuardian) {
      throw new ForbiddenException("Not allowed to sign this packet");
    }

    const typedName = body.typedName?.trim();
    if (!typedName) throw new BadRequestException("typedName required");

    await this.prisma.signature.create({
      data: {
        packetId: id,
        signerId: auth.sub,
        typedName,
      },
    });
    const updated = await this.prisma.signaturePacket.update({
      where: { id },
      data: { status: "signed", signedAt: new Date() },
    });
    return { packet: updated, signedByGuardian: isGuardian };
  }
}

@Controller("announcements")
export class AnnouncementsController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    const announcements = await this.prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return { announcements };
  }
}

@Controller("messages")
@UseGuards(AuthGuard)
export class MessagesController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("threads")
  async threads(@CurrentUser() auth: AuthPayload) {
    const threads = await this.prisma.messageThread.findMany({
      where: {
        OR: [
          { participants: { some: { userId: auth.sub } } },
          { createdById: auth.sub },
          // Staff can see class broadcasts they created + gym-wide legacy threads
          ...(STAFF_ROLES.has(auth.role)
            ? [{ kind: "class_broadcast" as const }]
            : []),
        ],
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          include: {
            sender: { select: { firstName: true, lastName: true } },
          },
        },
        participants: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
    });
    return {
      threads: threads.map((t) => ({
        id: t.id,
        subject: t.subject,
        kind: t.kind,
        sessionId: t.sessionId,
        createdAt: t.createdAt.toISOString(),
        participants: t.participants.map((p) => ({
          id: p.user.id,
          name: `${p.user.firstName} ${p.user.lastName}`,
        })),
        messages: t.messages.map((m) => ({
          body: m.body,
          createdAt: m.createdAt.toISOString(),
          sender: `${m.sender.firstName} ${m.sender.lastName}`,
        })),
      })),
    };
  }

  @Get("threads/:id")
  async thread(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    const thread = await this.prisma.messageThread.findUnique({
      where: { id },
      include: {
        participants: { select: { userId: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: { select: { firstName: true, lastName: true, id: true } },
          },
        },
      },
    });
    if (!thread) throw new BadRequestException("Thread not found");
    const isParticipant = thread.participants.some((p) => p.userId === auth.sub);
    const isStaff = STAFF_ROLES.has(auth.role);
    if (!isParticipant && thread.createdById !== auth.sub && !isStaff) {
      throw new ForbiddenException("Not in this thread");
    }
    return {
      thread: {
        id: thread.id,
        subject: thread.subject,
        kind: thread.kind,
        sessionId: thread.sessionId,
        messages: thread.messages.map((m) => ({
          id: m.id,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
          senderId: m.sender.id,
          sender: `${m.sender.firstName} ${m.sender.lastName}`,
          mine: m.senderId === auth.sub,
        })),
      },
    };
  }

  @Post("threads")
  async createThread(
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      subject?: string;
      body?: string;
      athleteId?: string;
      sessionId?: string;
      kind?: "direct" | "class_broadcast";
    },
  ) {
    const text = body.body?.trim();
    if (!text) throw new BadRequestException("Message body required");
    const kind = body.kind === "class_broadcast" ? "class_broadcast" : "direct";

    if (kind === "class_broadcast") {
      if (!STAFF_ROLES.has(auth.role)) {
        throw new ForbiddenException("Staff only");
      }
      if (!body.sessionId) {
        throw new BadRequestException("sessionId required for class broadcast");
      }
      const session = await this.prisma.session.findUnique({
        where: { id: body.sessionId },
        include: {
          bookings: {
            where: { status: { not: "cancelled" } },
            select: { userId: true },
          },
        },
      });
      if (!session) throw new BadRequestException("Session not found");
      const participantIds = [
        ...new Set([auth.sub, ...session.bookings.map((b) => b.userId)]),
      ];
      const thread = await this.prisma.messageThread.create({
        data: {
          subject:
            body.subject?.trim() || `Class: ${session.title}`,
          kind,
          sessionId: session.id,
          createdById: auth.sub,
          participants: {
            create: participantIds.map((userId) => ({ userId })),
          },
          messages: {
            create: { senderId: auth.sub, body: text },
          },
        },
      });
      return { thread: { id: thread.id } };
    }

    const athleteId = body.athleteId?.trim();
    if (!athleteId) {
      throw new BadRequestException("athleteId required for direct thread");
    }
    if (!STAFF_ROLES.has(auth.role) && athleteId !== auth.sub) {
      throw new ForbiddenException("Cannot start this thread");
    }
    const athlete = await this.prisma.user.findUnique({
      where: { id: athleteId },
    });
    if (!athlete) throw new BadRequestException("Athlete not found");
    const thread = await this.prisma.messageThread.create({
      data: {
        subject:
          body.subject?.trim() ||
          `Coach note · ${athlete.firstName} ${athlete.lastName}`,
        kind: "direct",
        createdById: auth.sub,
        participants: {
          create: [
            { userId: auth.sub },
            ...(athleteId === auth.sub ? [] : [{ userId: athleteId }]),
          ],
        },
        messages: {
          create: { senderId: auth.sub, body: text },
        },
      },
    });
    return { thread: { id: thread.id } };
  }

  @Post("threads/:id/messages")
  async reply(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
    @Body() body: { body?: string },
  ) {
    const text = body.body?.trim();
    if (!text) throw new BadRequestException("Message body required");
    const thread = await this.prisma.messageThread.findUnique({
      where: { id },
      include: { participants: { select: { userId: true } } },
    });
    if (!thread) throw new BadRequestException("Thread not found");
    const isParticipant = thread.participants.some((p) => p.userId === auth.sub);
    if (!isParticipant && !STAFF_ROLES.has(auth.role)) {
      throw new ForbiddenException("Not in this thread");
    }
    if (!isParticipant) {
      await this.prisma.messageParticipant.create({
        data: { threadId: id, userId: auth.sub },
      });
    }
    const message = await this.prisma.message.create({
      data: { threadId: id, senderId: auth.sub, body: text },
    });
    return {
      message: {
        id: message.id,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
      },
    };
  }
}

@Controller("gamification")
@UseGuards(AuthGuard)
export class GamificationController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("me")
  async me(@CurrentUser() auth: AuthPayload) {
    const xp = await this.prisma.xpLedger.aggregate({
      where: { userId: auth.sub },
      _sum: { delta: true },
    });
    const points = await this.prisma.pointsAccount.findUnique({
      where: { userId: auth.sub },
    });
    const totalXp = xp._sum.delta ?? 0;
    const level = Math.floor(totalXp / 100) + 1;
    const ranks = [
      "Prospect",
      "Contender",
      "Amateur",
      "Pro Prospect",
      "Champion",
    ];
    const rank = ranks[Math.min(ranks.length - 1, level - 1)];
    const badges = await this.prisma.userBadge.findMany({
      where: { userId: auth.sub },
      include: { badge: true },
    });
    return {
      xp: totalXp,
      level,
      rank,
      points: points?.balance ?? 0,
      badges: badges.map((b) => ({
        code: b.badge.code,
        name: b.badge.name,
        earnedAt: b.earnedAt.toISOString(),
      })),
    };
  }
}

@Controller("passport")
@UseGuards(AuthGuard)
export class PassportController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("me")
  async me(@CurrentUser() auth: AuthPayload) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: auth.sub },
    });
    const attendance = await this.prisma.attendanceEvent.findMany({
      where: { userId: auth.sub },
      orderBy: { checkedInAt: "desc" },
      take: 365,
    });
    const xp = await this.prisma.xpLedger.aggregate({
      where: { userId: auth.sub },
      _sum: { delta: true },
    });
    const totalXp = xp._sum.delta ?? 0;
    const level = Math.floor(totalXp / 100) + 1;
    const ranks = [
      "Prospect",
      "Contender",
      "Amateur",
      "Pro Prospect",
      "Champion",
    ];
    const badges = await this.prisma.userBadge.findMany({
      where: { userId: auth.sub },
      include: { badge: true },
    });

    const dayKeys = new Set(
      attendance.map((a) => a.checkedInAt.toISOString().slice(0, 10)),
    );
    let streak = 0;
    const cursor = new Date();
    for (;;) {
      const key = cursor.toISOString().slice(0, 10);
      if (!dayKeys.has(key)) break;
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    const yearsAtGym = Math.max(
      0,
      (Date.now() - user.createdAt.getTime()) / (365.25 * 24 * 3600 * 1000),
    );

    return {
      member: {
        name: `${user.firstName} ${user.lastName}`,
        joinedAt: user.createdAt.toISOString(),
        yearsAtGym: Math.round(yearsAtGym * 10) / 10,
      },
      progression: {
        xp: totalXp,
        level,
        rank: ranks[Math.min(ranks.length - 1, level - 1)],
      },
      attendance: {
        total: attendance.length,
        uniqueDays: dayKeys.size,
        streak,
        recent: attendance.slice(0, 10).map((a) => ({
          at: a.checkedInAt.toISOString(),
          status: a.status,
          method: a.method,
        })),
      },
      achievements: badges.map((b) => ({
        code: b.badge.code,
        name: b.badge.name,
        description: b.badge.description,
        earnedAt: b.earnedAt.toISOString(),
      })),
    };
  }
}

@Controller("legacy")
export class LegacyController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("timeline")
  async timeline() {
    const entries = await this.prisma.legacyTimelineEntry.findMany({
      where: { published: true },
      orderBy: [{ decade: "asc" }, { sortOrder: "asc" }, { year: "asc" }],
    });
    return { entries };
  }
}

@Controller("nutrition")
@UseGuards(AuthGuard)
export class NutritionController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("me")
  async me(@CurrentUser() auth: AuthPayload) {
    const profile = await this.prisma.nutritionProfile.findUnique({
      where: { userId: auth.sub },
    });
    const assignment = await this.prisma.mealPlanAssignment.findFirst({
      where: { userId: auth.sub, active: true },
      include: { mealPlan: true },
    });
    let planDays: unknown = [];
    if (assignment) {
      try {
        planDays = JSON.parse(assignment.mealPlan.daysJson);
      } catch {
        planDays = [];
      }
    }
    return {
      profile: profile
        ? {
            goal: profile.goal,
            allergens: profile.allergens
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            notes: profile.notes,
          }
        : null,
      plan: assignment
        ? {
            id: assignment.mealPlan.id,
            name: assignment.mealPlan.name,
            description: assignment.mealPlan.description,
            days: planDays,
          }
        : null,
    };
  }

  @Patch("profile")
  async updateProfile(
    @CurrentUser() auth: AuthPayload,
    @Body() body: { goal?: string; allergens?: string[]; notes?: string },
  ) {
    const allergens = (body.allergens ?? []).join(", ");
    const profile = await this.prisma.nutritionProfile.upsert({
      where: { userId: auth.sub },
      create: {
        userId: auth.sub,
        goal: body.goal,
        allergens,
        notes: body.notes,
      },
      update: {
        goal: body.goal,
        allergens,
        notes: body.notes,
      },
    });
    return { profile };
  }
}

@Controller("kitchen")
@UseGuards(AuthGuard)
export class KitchenController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("menu")
  async menu(@CurrentUser() auth: AuthPayload) {
    const items = await this.prisma.menuItem.findMany({
      where: { organizationId: auth.orgId, available: true },
      orderBy: { name: "asc" },
    });
    return {
      items: items.map((i) => ({
        id: i.id,
        name: i.name,
        description: i.description,
        priceCents: i.priceCents,
        allergens: i.allergens
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      })),
    };
  }

  @Post("orders")
  async placeOrder(
    @CurrentUser() auth: AuthPayload,
    @Body() body: { items?: { menuItemId: string; quantity?: number }[]; notes?: string },
  ) {
    if (!body.items?.length) throw new BadRequestException("items required");
    const location = await this.prisma.location.findFirst({
      where: { organizationId: auth.orgId },
    });
    if (!location) throw new BadRequestException("No location");

    const menuItems = await this.prisma.menuItem.findMany({
      where: {
        id: { in: body.items.map((i) => i.menuItemId) },
        organizationId: auth.orgId,
      },
    });
    if (menuItems.length !== body.items.length) {
      throw new BadRequestException("Invalid menu items");
    }

    const profile = await this.prisma.nutritionProfile.findUnique({
      where: { userId: auth.sub },
    });
    const memberAllergens = new Set(
      (profile?.allergens ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    );
    const warnings: string[] = [];
    for (const item of menuItems) {
      for (const a of item.allergens.split(",").map((s) => s.trim().toLowerCase())) {
        if (a && memberAllergens.has(a)) {
          warnings.push(`${item.name} contains ${a}`);
        }
      }
    }

    const order = await this.prisma.kitchenOrder.create({
      data: {
        locationId: location.id,
        userId: auth.sub,
        status: "placed",
        notes: body.notes,
        allergenWarning: warnings.join("; "),
        items: {
          create: body.items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity ?? 1,
          })),
        },
      },
      include: { items: { include: { menuItem: true } } },
    });

    return { order, allergenWarnings: warnings };
  }

  @Get("orders/me")
  async myOrders(@CurrentUser() auth: AuthPayload) {
    const orders = await this.prisma.kitchenOrder.findMany({
      where: { userId: auth.sub },
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    return { orders };
  }

  @Get("kds/feed")
  async kdsFeed(@CurrentUser() auth: AuthPayload) {
    requireStaff(auth);
    const orders = await this.prisma.kitchenOrder.findMany({
      where: {
        status: { in: ["placed", "accepted", "preparing", "ready"] },
      },
      include: {
        user: { select: { firstName: true, lastName: true } },
        items: { include: { menuItem: true } },
      },
      orderBy: { createdAt: "asc" },
      take: 50,
    });
    return {
      tickets: orders.map((o) => ({
        id: o.id,
        status: o.status,
        memberName: `${o.user.firstName} ${o.user.lastName}`,
        allergenWarning: o.allergenWarning || null,
        notes: o.notes,
        createdAt: o.createdAt.toISOString(),
        items: o.items.map((i) => ({
          name: i.menuItem.name,
          quantity: i.quantity,
          allergens: i.menuItem.allergens,
        })),
      })),
    };
  }

  @Patch("orders/:id/status")
  async updateStatus(
    @Param("id") id: string,
    @CurrentUser() auth: AuthPayload,
    @Body() body: { status?: string },
  ) {
    requireStaff(auth);
    const allowed = [
      "placed",
      "accepted",
      "preparing",
      "ready",
      "completed",
      "cancelled",
    ];
    if (!body.status || !allowed.includes(body.status)) {
      throw new BadRequestException("Invalid status");
    }
    const order = await this.prisma.kitchenOrder.update({
      where: { id },
      data: { status: body.status },
    });
    return { order };
  }
}

@Controller("desk")
@UseGuards(AuthGuard)
export class DeskController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Post("dry-run")
  async dryRun(@CurrentUser() auth: AuthPayload) {
    requireStaff(auth);
    const { runDeskDryRun } = await import("./desk-dry-run");
    return runDeskDryRun(this.prisma, auth);
  }

  @Post("drop-in")
  async sellDropIn(
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      email?: string;
      name?: string;
      firstName?: string;
      lastName?: string;
      sessionId?: string;
      checkIn?: boolean;
      productCode?: string;
    },
  ) {
    requireStaff(auth);
    const email = body.email?.trim().toLowerCase();
    if (!email) throw new BadRequestException("email required");

    const org = await this.prisma.organization.findFirst({
      where: { id: auth.orgId },
    });
    if (!org) throw new BadRequestException("Org missing");

    const location = await this.prisma.location.findFirst({
      where: { organizationId: auth.orgId },
    });
    if (!location) throw new BadRequestException("No location");

    const product = await this.prisma.membershipProduct.findFirst({
      where: {
        organizationId: auth.orgId,
        code: body.productCode || "drop_in",
        active: true,
      },
    });
    if (!product) {
      throw new BadRequestException(
        "drop_in product not configured — reseed or create product",
      );
    }

    let user = await this.prisma.user.findFirst({
      where: { organizationId: auth.orgId, email },
    });

    const names = body.firstName
      ? {
          firstName: body.firstName,
          lastName: body.lastName || "Guest",
        }
      : (() => {
          const parts = (body.name || email.split("@")[0] || "Walk In").trim().split(/\s+/);
          return {
            firstName: parts[0] || "Walk",
            lastName: parts.slice(1).join(" ") || "In",
          };
        })();

    if (!user) {
      const bcrypt = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(
        `dropin-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        10,
      );
      user = await this.prisma.user.create({
        data: {
          organizationId: auth.orgId,
          email,
          passwordHash,
          firstName: names.firstName,
          lastName: names.lastName,
          role: "member",
          points: { create: { balance: 0 } },
        },
      });
    }

    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + 1);

    const membership = await this.prisma.membership.create({
      data: {
        locationId: location.id,
        productId: product.id,
        payerUserId: user.id,
        status: "active",
        startsAt: new Date(),
        endsAt,
        members: {
          create: { userId: user.id },
        },
      },
      include: { product: true },
    });

    // Ensure a waiver packet exists (staff can override check-in if unsigned)
    const existingWaiver = await this.prisma.signaturePacket.findFirst({
      where: { subjectUserId: user.id },
    });
    if (!existingWaiver) {
      const version = await this.prisma.documentTemplateVersion.findFirst({
        where: { status: "active" },
        orderBy: { version: "desc" },
      });
      if (version) {
        await this.prisma.signaturePacket.create({
          data: {
            versionId: version.id,
            subjectUserId: user.id,
            status: "required",
          },
        });
      }
    }

    let booking = null;
    if (body.sessionId) {
      booking = await this.prisma.booking.upsert({
        where: {
          sessionId_userId: {
            sessionId: body.sessionId,
            userId: user.id,
          },
        },
        create: {
          sessionId: body.sessionId,
          userId: user.id,
          status: "confirmed",
        },
        update: { status: "confirmed" },
      });
    }

    let checkIn = null;
    if (body.checkIn) {
      checkIn = await performCheckIn(this.prisma, {
        memberUserId: user.id,
        orgId: auth.orgId,
        sessionId: body.sessionId,
        method: "drop_in_desk",
        recordedById: auth.sub,
        override: true,
        overrideReason: "Desk drop-in sale — same-day access",
      });
    }

    await this.prisma.paymentEvent.create({
      data: {
        membershipId: membership.id,
        provider: "mock",
        externalId: `dropin_${membership.id}_${Date.now()}`,
        type: "drop_in.sale",
        status: "completed",
        amountCents: product.priceCents,
      },
    });

    return {
      member: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
      membership,
      booking,
      checkIn,
      amountCents: product.priceCents,
      productName: product.name,
    };
  }

  @Post("family/link")
  async linkFamily(
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      parentEmail?: string;
      childEmail?: string;
      childName?: string;
      childDob?: string;
      relationship?: string;
      createChildIfMissing?: boolean;
      addToParentMembership?: boolean;
    },
  ) {
    requireStaff(auth);
    const parentEmail = body.parentEmail?.trim().toLowerCase();
    if (!parentEmail) throw new BadRequestException("parentEmail required");

    const parent = await this.prisma.user.findFirst({
      where: { organizationId: auth.orgId, email: parentEmail },
    });
    if (!parent) {
      throw new BadRequestException(
        "Parent account not found — register parent first or check email",
      );
    }

    let childEmail = body.childEmail?.trim().toLowerCase();
    let child = childEmail
      ? await this.prisma.user.findFirst({
          where: { organizationId: auth.orgId, email: childEmail },
        })
      : null;

    if (!child) {
      if (!body.createChildIfMissing) {
        throw new BadRequestException(
          "Child not found — set createChildIfMissing or use existing childEmail",
        );
      }
      const parts = (body.childName || "Youth Athlete").trim().split(/\s+/);
      const firstName = parts[0] || "Youth";
      const lastName = parts.slice(1).join(" ") || "Athlete";
      if (!childEmail) {
        childEmail = `${firstName}.${lastName}.${Date.now()}@youth.sullys.local`
          .toLowerCase()
          .replace(/\s+/g, "");
      }
      const bcrypt = await import("bcryptjs");
      const passwordHash = await bcrypt.hash(
        `youth-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        10,
      );
      child = await this.prisma.user.create({
        data: {
          organizationId: auth.orgId,
          email: childEmail,
          passwordHash,
          firstName,
          lastName,
          role: "child",
          dateOfBirth: body.childDob ? new Date(body.childDob) : undefined,
          points: { create: { balance: 0 } },
        },
      });
    } else if (child.id === parent.id) {
      throw new BadRequestException("Parent and child cannot be the same user");
    }

    const existing = await this.prisma.guardianship.findUnique({
      where: {
        guardianUserId_childUserId: {
          guardianUserId: parent.id,
          childUserId: child.id,
        },
      },
    });

    const link =
      existing ??
      (await this.prisma.guardianship.create({
        data: {
          guardianUserId: parent.id,
          childUserId: child.id,
          relationship: body.relationship?.trim() || "parent",
        },
      }));

    // Ensure youth waiver packet exists for parent proxy signing
    let waiver = await this.prisma.signaturePacket.findFirst({
      where: { subjectUserId: child.id },
      orderBy: { id: "desc" },
    });
    if (!waiver) {
      const version = await this.prisma.documentTemplateVersion.findFirst({
        where: { status: "active" },
        orderBy: { version: "desc" },
      });
      if (version) {
        waiver = await this.prisma.signaturePacket.create({
          data: {
            versionId: version.id,
            subjectUserId: child.id,
            status: "required",
          },
        });
      }
    }

    let membershipNote: string | null = null;
    if (body.addToParentMembership !== false) {
      const parentMembership = await this.prisma.membership.findFirst({
        where: {
          status: "active",
          OR: [
            { payerUserId: parent.id },
            { members: { some: { userId: parent.id } } },
          ],
        },
        include: { members: true, product: true },
      });
      if (parentMembership) {
        const already = parentMembership.members.some(
          (m) => m.userId === child.id,
        );
        if (!already) {
          await this.prisma.membershipMember.create({
            data: {
              membershipId: parentMembership.id,
              userId: child.id,
            },
          });
          membershipNote = `Added to ${parentMembership.product.name}`;
        } else {
          membershipNote = `Already on ${parentMembership.product.name}`;
        }
      } else {
        membershipNote = "Parent has no active membership to attach";
      }
    }

    // Promote parent role if still plain member
    if (parent.role === "member") {
      await this.prisma.user.update({
        where: { id: parent.id },
        data: { role: "parent" },
      });
    }

    return {
      alreadyLinked: Boolean(existing),
      parent: {
        id: parent.id,
        email: parent.email,
        name: `${parent.firstName} ${parent.lastName}`,
      },
      child: {
        id: child.id,
        email: child.email,
        name: `${child.firstName} ${child.lastName}`,
      },
      relationship: link.relationship,
      waiverStatus: waiver?.status ?? "missing",
      membershipNote,
    };
  }
}

@Controller("family")
@UseGuards(AuthGuard)
export class FamilyController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("children")
  async children(@CurrentUser() auth: AuthPayload) {
    const links = await this.prisma.guardianship.findMany({
      where: { guardianUserId: auth.sub },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            dateOfBirth: true,
            role: true,
          },
        },
      },
    });

    const children = await Promise.all(
      links.map(async (l) => {
        const membership = await this.prisma.membership.findFirst({
          where: {
            status: "active",
            OR: [
              { payerUserId: l.childUserId },
              { members: { some: { userId: l.childUserId } } },
            ],
          },
          include: { product: true },
        });
        const waiver = await this.prisma.signaturePacket.findFirst({
          where: { subjectUserId: l.childUserId },
          orderBy: { id: "desc" },
        });
        const attendance = await this.prisma.attendanceEvent.count({
          where: { userId: l.childUserId },
        });
        return {
          id: l.child.id,
          name: `${l.child.firstName} ${l.child.lastName}`,
          email: l.child.email,
          dateOfBirth: l.child.dateOfBirth?.toISOString() ?? null,
          relationship: l.relationship,
          membership: membership
            ? { status: membership.status, plan: membership.product.name }
            : null,
          waiverStatus: waiver?.status ?? "missing",
          attendanceCount: attendance,
        };
      }),
    );

    return { children };
  }

  @Post("children/:id/check-in-token")
  async childToken(
    @Param("id") childId: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    const link = await this.prisma.guardianship.findFirst({
      where: { guardianUserId: auth.sub, childUserId: childId },
    });
    if (!link) throw new ForbiddenException("Not your child");

    const waiver = await this.prisma.signaturePacket.findFirst({
      where: { subjectUserId: childId },
      orderBy: { id: "desc" },
    });
    if (!waiver || waiver.status !== "signed") {
      throw new BadRequestException("Child waiver must be signed first");
    }

    const token = `SUL-${childId.slice(0, 8)}-${Date.now().toString(36).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 60_000);
    await this.prisma.checkInCredential.create({
      data: { userId: childId, token, expiresAt },
    });
    return {
      token,
      expiresInSeconds: 60,
      expiresAt: expiresAt.toISOString(),
      userId: childId,
    };
  }

  @Get("children/:id/waiver")
  async childWaiver(
    @Param("id") childId: string,
    @CurrentUser() auth: AuthPayload,
  ) {
    const link = await this.prisma.guardianship.findFirst({
      where: { guardianUserId: auth.sub, childUserId: childId },
    });
    if (!link) throw new ForbiddenException("Not your child");

    let packet = await this.prisma.signaturePacket.findFirst({
      where: { subjectUserId: childId },
      include: { version: { include: { template: true } } },
      orderBy: { id: "desc" },
    });

    if (!packet) {
      const version = await this.prisma.documentTemplateVersion.findFirst({
        where: { status: "active" },
        orderBy: { version: "desc" },
        include: { template: true },
      });
      if (!version) {
        throw new BadRequestException("No active waiver template");
      }
      packet = await this.prisma.signaturePacket.create({
        data: {
          versionId: version.id,
          subjectUserId: childId,
          status: "required",
        },
        include: { version: { include: { template: true } } },
      });
    }

    return {
      packet: {
        id: packet.id,
        status: packet.status,
        body: packet.version.body,
        templateName: packet.version.template.name,
        signedAt: packet.signedAt?.toISOString() ?? null,
      },
    };
  }

  @Post("children/:id/waiver/sign")
  async signChildWaiver(
    @Param("id") childId: string,
    @CurrentUser() auth: AuthPayload,
    @Body() body: { typedName?: string },
  ) {
    const link = await this.prisma.guardianship.findFirst({
      where: { guardianUserId: auth.sub, childUserId: childId },
    });
    if (!link) throw new ForbiddenException("Not your child");

    const typedName = body.typedName?.trim();
    if (!typedName) throw new BadRequestException("typedName required");

    let packet = await this.prisma.signaturePacket.findFirst({
      where: { subjectUserId: childId, status: "required" },
      orderBy: { id: "desc" },
    });

    if (!packet) {
      const existing = await this.prisma.signaturePacket.findFirst({
        where: { subjectUserId: childId, status: "signed" },
      });
      if (existing) {
        return { packet: existing, alreadySigned: true };
      }
      const version = await this.prisma.documentTemplateVersion.findFirst({
        where: { status: "active" },
        orderBy: { version: "desc" },
      });
      if (!version) throw new BadRequestException("No active waiver template");
      packet = await this.prisma.signaturePacket.create({
        data: {
          versionId: version.id,
          subjectUserId: childId,
          status: "required",
        },
      });
    }

    await this.prisma.signature.create({
      data: {
        packetId: packet.id,
        signerId: auth.sub,
        typedName,
      },
    });
    const updated = await this.prisma.signaturePacket.update({
      where: { id: packet.id },
      data: { status: "signed", signedAt: new Date() },
    });
    return { packet: updated, signedByGuardian: true };
  }
}

@Controller("owner")
@UseGuards(AuthGuard)
export class OwnerBriefController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("morning-brief")
  async morningBrief(@CurrentUser() auth: AuthPayload) {
    if (!["owner", "admin", "front_desk"].includes(auth.role)) {
      throw new ForbiddenException("Owner / desk role required");
    }

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const [
      checkInsToday,
      overridesToday,
      sessionsToday,
      kitchenOpen,
      pendingWaivers,
      activeMemberships,
      pendingPayments,
    ] = await Promise.all([
      this.prisma.attendanceEvent.count({
        where: { checkedInAt: { gte: start, lt: end } },
      }),
      this.prisma.attendanceEvent.findMany({
        where: {
          checkedInAt: { gte: start, lt: end },
          OR: [
            { method: "staff_override" },
            { flags: { not: "" } },
          ],
        },
        include: {
          user: { select: { firstName: true, lastName: true } },
        },
        take: 20,
        orderBy: { checkedInAt: "desc" },
      }),
      this.prisma.session.findMany({
        where: { startsAt: { gte: start, lt: end } },
        include: {
          bookings: { where: { status: { not: "cancelled" } } },
          program: true,
        },
        orderBy: { startsAt: "asc" },
      }),
      this.prisma.kitchenOrder.count({
        where: {
          status: { in: ["placed", "accepted", "preparing", "ready"] },
        },
      }),
      this.prisma.signaturePacket.count({ where: { status: "required" } }),
      this.prisma.membership.count({ where: { status: "active" } }),
      this.prisma.membership.count({ where: { status: "pending_payment" } }),
    ]);

    const classes = sessionsToday.map((s) => {
      const booked = s.bookings.length;
      const checkedIn = s.bookings.filter((b) => b.status === "checked_in")
        .length;
      return {
        id: s.id,
        title: s.title,
        program: s.program.name,
        startsAt: s.startsAt.toISOString(),
        capacity: s.capacity,
        booked,
        checkedIn,
        fillPct: Math.round((booked / Math.max(1, s.capacity)) * 100),
      };
    });

    return {
      asOf: new Date().toISOString(),
      kpis: {
        checkInsToday,
        activeMemberships,
        pendingPayments,
        pendingWaivers,
        kitchenOpenTickets: kitchenOpen,
        classesToday: classes.length,
      },
      classes,
      overrides: overridesToday.map((o) => ({
        id: o.id,
        at: o.checkedInAt.toISOString(),
        member: `${o.user.firstName} ${o.user.lastName}`,
        reason: o.overrideReason,
        flags: o.flags,
      })),
      stripeMode: process.env.STRIPE_SECRET_KEY ? "live_keys" : "mock",
    };
  }
}

