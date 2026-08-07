import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { PrismaService } from "./prisma.service";
import { AuthGuard, CurrentUser, type AuthPayload } from "./auth/auth.guard";

function webOrigin() {
  return process.env.WEB_ORIGIN ?? "http://localhost:3000";
}

function stripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

@Controller()
export class BillingController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Post("membership/checkout")
  @UseGuards(AuthGuard)
  async checkout(
    @CurrentUser() auth: AuthPayload,
    @Body() body: { productCode?: string; plan?: string },
  ) {
    const waiver = await this.prisma.signaturePacket.findFirst({
      where: { subjectUserId: auth.sub },
      orderBy: { id: "desc" },
    });
    if (!waiver || waiver.status !== "signed") {
      throw new BadRequestException(
        "Sign the liability waiver before checkout",
      );
    }

    const code = body.productCode || body.plan || "monthly";
    const product = await this.prisma.membershipProduct.findFirst({
      where: { organizationId: auth.orgId, code, active: true },
    });
    if (!product) throw new BadRequestException("Unknown membership product");

    const location = await this.prisma.location.findFirst({
      where: { organizationId: auth.orgId },
    });
    if (!location) throw new BadRequestException("No location configured");

    const membership = await this.prisma.membership.create({
      data: {
        locationId: location.id,
        productId: product.id,
        payerUserId: auth.sub,
        status: "pending_payment",
        members: { create: { userId: auth.sub } },
      },
      include: { product: true },
    });

    if (stripeEnabled()) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      const session = await stripe.checkout.sessions.create({
        mode: product.interval === "one_time" ? "payment" : "subscription",
        customer_email: auth.email,
        line_items: [
          product.stripePriceId
            ? { price: product.stripePriceId, quantity: 1 }
            : {
                price_data: {
                  currency: product.currency,
                  unit_amount: product.priceCents,
                  product_data: { name: product.name },
                  ...(product.interval === "one_time"
                    ? {}
                    : { recurring: { interval: "month" } }),
                },
                quantity: 1,
              },
        ],
        success_url: `${webOrigin()}/join/success?membershipId=${membership.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${webOrigin()}/join?cancelled=1`,
        metadata: {
          membershipId: membership.id,
          userId: auth.sub,
          productCode: product.code,
        },
      });

      await this.prisma.membership.update({
        where: { id: membership.id },
        data: { stripeCheckoutId: session.id },
      });
      await this.prisma.paymentEvent.create({
        data: {
          membershipId: membership.id,
          provider: "stripe",
          externalId: session.id,
          type: "checkout.session",
          status: "pending",
          amountCents: product.priceCents,
        },
      });

      return {
        mode: "stripe" as const,
        membershipId: membership.id,
        checkoutUrl: session.url,
        membership,
      };
    }

    const externalId = `mock_${membership.id}_${Date.now()}`;
    await this.prisma.paymentEvent.create({
      data: {
        membershipId: membership.id,
        provider: "mock",
        externalId,
        type: "checkout.session",
        status: "pending",
        amountCents: product.priceCents,
      },
    });

    return {
      mode: "mock" as const,
      membershipId: membership.id,
      checkoutUrl: `${webOrigin()}/join/pay?token=${encodeURIComponent(externalId)}`,
      membership,
      amountCents: product.priceCents,
      productName: product.name,
    };
  }

  @Post("billing/mock-pay")
  @UseGuards(AuthGuard)
  async mockPay(
    @CurrentUser() auth: AuthPayload,
    @Body() body: { token?: string },
  ) {
    if (!body.token) throw new BadRequestException("token required");
    const event = await this.prisma.paymentEvent.findUnique({
      where: { externalId: body.token },
      include: { membership: true },
    });
    if (!event?.membership) throw new BadRequestException("Payment not found");
    if (event.membership.payerUserId !== auth.sub) {
      throw new BadRequestException("Not your checkout");
    }
    if (event.status === "completed") {
      return { membership: event.membership, alreadyPaid: true };
    }

    const membership = await this.activateMembership(event.membership.id, auth.sub);
    await this.prisma.paymentEvent.update({
      where: { id: event.id },
      data: { status: "completed" },
    });

    return { membership, welcomeXp: 50, mode: "mock" };
  }

  @Get("billing/status")
  @UseGuards(AuthGuard)
  async status(
    @CurrentUser() auth: AuthPayload,
    @Query("membershipId") membershipId?: string,
  ) {
    if (!membershipId) throw new BadRequestException("membershipId required");
    const membership = await this.prisma.membership.findFirst({
      where: { id: membershipId, payerUserId: auth.sub },
      include: { product: true },
    });
    if (!membership) throw new BadRequestException("Membership not found");
    return { membership };
  }

  /** Public billing mode — join UI shows mock vs Stripe without leaking secrets. */
  @Get("billing/mode")
  mode() {
    return {
      mode: stripeEnabled() ? ("stripe" as const) : ("mock" as const),
      webhookConfigured: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      hint: stripeEnabled()
        ? "Stripe Checkout + Customer Portal enabled"
        : "Set STRIPE_SECRET_KEY=sk_test_... in apps/api/.env to enable live test checkout",
    };
  }

  /**
   * Confirm Stripe Checkout return (works without webhook for local test).
   * Webhooks remain the production source of truth.
   */
  @Post("billing/confirm-checkout")
  @UseGuards(AuthGuard)
  async confirmCheckout(
    @CurrentUser() auth: AuthPayload,
    @Body() body: { sessionId?: string; membershipId?: string },
  ) {
    if (!stripeEnabled()) {
      throw new BadRequestException("Stripe is not configured");
    }
    if (!body.sessionId) throw new BadRequestException("sessionId required");

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(body.sessionId);

    const membershipId =
      (session.metadata?.membershipId as string | undefined) ||
      body.membershipId;
    if (!membershipId) {
      throw new BadRequestException("Checkout session missing membership");
    }

    const membership = await this.prisma.membership.findFirst({
      where: { id: membershipId, payerUserId: auth.sub },
    });
    if (!membership) throw new BadRequestException("Membership not found");

    const paid =
      session.payment_status === "paid" ||
      session.status === "complete" ||
      session.payment_status === "no_payment_required";

    if (!paid) {
      return {
        mode: "stripe" as const,
        membership,
        confirmed: false,
        paymentStatus: session.payment_status,
        sessionStatus: session.status,
      };
    }

    let active = membership;
    if (membership.status !== "active") {
      active = await this.activateMembership(membershipId, auth.sub);
    }

    await this.prisma.membership.update({
      where: { id: membershipId },
      data: {
        stripeCheckoutId: session.id,
        stripeCustomerId:
          typeof session.customer === "string"
            ? session.customer
            : membership.stripeCustomerId,
        stripeSubscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : membership.stripeSubscriptionId,
      },
    });

    await this.prisma.paymentEvent.updateMany({
      where: {
        OR: [{ externalId: session.id }, { membershipId }],
        status: { not: "completed" },
      },
      data: { status: "completed" },
    });

    return {
      mode: "stripe" as const,
      membership: active,
      confirmed: true,
      welcomeXp: 50,
    };
  }

  @Get("billing/history")
  @UseGuards(AuthGuard)
  async history(@CurrentUser() auth: AuthPayload) {
    const memberships = await this.prisma.membership.findMany({
      where: {
        OR: [
          { payerUserId: auth.sub },
          { members: { some: { userId: auth.sub } } },
        ],
      },
      select: { id: true },
    });
    const ids = memberships.map((m) => m.id);
    if (!ids.length) {
      return { mode: stripeEnabled() ? "stripe" : "mock", invoices: [] };
    }

    const events = await this.prisma.paymentEvent.findMany({
      where: { membershipId: { in: ids } },
      include: { membership: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return {
      mode: stripeEnabled() ? "stripe" : "mock",
      invoices: events.map((e) => ({
        id: e.id,
        externalId: e.externalId,
        provider: e.provider,
        type: e.type,
        status: e.status,
        amountCents: e.amountCents,
        currency: e.membership?.product.currency ?? "cad",
        productName: e.membership?.product.name ?? "Membership",
        membershipId: e.membershipId,
        membershipStatus: e.membership?.status ?? null,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  }

  @Post("billing/portal-session")
  @UseGuards(AuthGuard)
  async portalSession(@CurrentUser() auth: AuthPayload) {
    if (!stripeEnabled()) {
      return {
        mode: "mock" as const,
        url: null,
        message:
          "Stripe Customer Portal opens when STRIPE_SECRET_KEY is configured. Mock mode: review history in /app/billing.",
      };
    }

    const membership = await this.prisma.membership.findFirst({
      where: {
        payerUserId: auth.sub,
        stripeCustomerId: { not: null },
      },
      orderBy: { startsAt: "desc" },
    });

    if (!membership?.stripeCustomerId) {
      throw new BadRequestException(
        "No Stripe customer on file yet — complete a live checkout first",
      );
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.billingPortal.sessions.create({
      customer: membership.stripeCustomerId,
      return_url: `${webOrigin()}/app/billing`,
    });

    return { mode: "stripe" as const, url: session.url };
  }

  @Post("webhooks/stripe")
  async stripeWebhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers("stripe-signature") signature: string | undefined,
    @Body() body: unknown,
    @Res() res: Response,
  ) {
    if (!stripeEnabled()) {
      return res.status(200).json({ ignored: true });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    let event: { id: string; type: string; data: { object: Record<string, unknown> } };

    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (secret && signature) {
      try {
        event = stripe.webhooks.constructEvent(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (req as any).rawBody ?? JSON.stringify(body),
          signature,
          secret,
        ) as unknown as typeof event;
      } catch {
        return res.status(400).send("Invalid signature");
      }
    } else {
      event = body as typeof event;
    }

    const existing = await this.prisma.paymentEvent.findUnique({
      where: { externalId: event.id },
    });
    if (existing?.status === "completed") {
      return res.json({ received: true, duplicate: true });
    }

    if (
      event.type === "checkout.session.completed" ||
      event.type === "invoice.paid"
    ) {
      const obj = event.data.object;
      const membershipId =
        (obj.metadata as { membershipId?: string } | undefined)?.membershipId ??
        (typeof obj.client_reference_id === "string"
          ? obj.client_reference_id
          : undefined);

      if (membershipId) {
        const membership = await this.prisma.membership.findUnique({
          where: { id: membershipId },
        });
        if (membership && membership.status !== "active") {
          await this.activateMembership(membershipId, membership.payerUserId);
          await this.prisma.membership.update({
            where: { id: membershipId },
            data: {
              stripeCustomerId:
                typeof obj.customer === "string" ? obj.customer : undefined,
              stripeSubscriptionId:
                typeof obj.subscription === "string"
                  ? obj.subscription
                  : undefined,
            },
          });
        }
      }
    }

    await this.prisma.paymentEvent.upsert({
      where: { externalId: event.id },
      create: {
        provider: "stripe",
        externalId: event.id,
        type: event.type,
        status: "completed",
        raw: JSON.stringify(event).slice(0, 4000),
      },
      update: { status: "completed" },
    });

    return res.json({ received: true });
  }

  @Get("membership/products")
  @UseGuards(AuthGuard)
  async products(@CurrentUser() auth: AuthPayload) {
    const products = await this.prisma.membershipProduct.findMany({
      where: { organizationId: auth.orgId, active: true },
      orderBy: { priceCents: "asc" },
    });
    return { products };
  }

  @Get("memberships/me")
  @UseGuards(AuthGuard)
  async myMemberships(@CurrentUser() auth: AuthPayload) {
    const memberships = await this.prisma.membership.findMany({
      where: {
        OR: [
          { payerUserId: auth.sub },
          { members: { some: { userId: auth.sub } } },
        ],
      },
      include: { product: true, location: true },
      orderBy: { startsAt: "desc" },
    });
    return {
      memberships: memberships.map((m) => ({
        id: m.id,
        status: m.status,
        startsAt: m.startsAt.toISOString(),
        endsAt: m.endsAt?.toISOString() ?? null,
        productName: m.product.name,
        productCode: m.product.code,
        priceCents: m.product.priceCents,
        interval: m.product.interval,
        location: m.location.name,
      })),
    };
  }

  @Get("membership-card")
  @UseGuards(AuthGuard)
  async card(@CurrentUser() auth: AuthPayload) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: auth.sub },
    });
    const membership = await this.prisma.membership.findFirst({
      where: {
        status: "active",
        OR: [
          { payerUserId: auth.sub },
          { members: { some: { userId: auth.sub } } },
        ],
      },
      include: { product: true, location: true },
      orderBy: { startsAt: "desc" },
    });
    const waiver = await this.prisma.signaturePacket.findFirst({
      where: { subjectUserId: auth.sub },
      orderBy: { id: "desc" },
    });

    return {
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      plan: membership?.product.name ?? "No plan",
      status: membership?.status ?? "inactive",
      location: membership?.location.name ?? "Sully's",
      waiverStatus: waiver?.status ?? "missing",
    };
  }

  /** Keep legacy path that instantly activates (dev fallback). Prefer checkout. */
  @Post("memberships")
  @UseGuards(AuthGuard)
  async createInstant(
    @CurrentUser() auth: AuthPayload,
    @Body() body: { productCode?: string; plan?: string },
  ) {
    const code = body.productCode || body.plan || "monthly";
    const product = await this.prisma.membershipProduct.findFirst({
      where: { organizationId: auth.orgId, code },
    });
    if (!product) throw new BadRequestException("Unknown membership product");
    const location = await this.prisma.location.findFirst({
      where: { organizationId: auth.orgId },
    });
    if (!location) throw new BadRequestException("No location configured");

    const membership = await this.prisma.membership.create({
      data: {
        locationId: location.id,
        productId: product.id,
        payerUserId: auth.sub,
        status: "active",
        members: { create: { userId: auth.sub } },
      },
      include: { product: true },
    });
    await this.awardWelcome(auth.sub);
    return { membership, welcomeXp: 50 };
  }

  private async activateMembership(membershipId: string, userId: string) {
    const membership = await this.prisma.membership.update({
      where: { id: membershipId },
      data: { status: "active", startsAt: new Date() },
      include: { product: true },
    });
    await this.awardWelcome(userId);
    return membership;
  }

  private async awardWelcome(userId: string) {
    const already = await this.prisma.xpLedger.findFirst({
      where: { userId, reason: "welcome_join" },
    });
    if (already) return;
    await this.prisma.xpLedger.create({
      data: { userId, delta: 50, reason: "welcome_join" },
    });
    await this.prisma.pointsAccount.upsert({
      where: { userId },
      create: { userId, balance: 50 },
      update: { balance: { increment: 50 } },
    });
  }
}
