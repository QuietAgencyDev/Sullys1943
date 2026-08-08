import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
} from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import {
  commerceProvider,
  createCommerceCheckout,
  webOrigin,
} from "./payments/payment-provider";

/** Mirrors apps/web store catalog — keep prices in sync. */
const STORE_CATALOG: {
  id: string;
  name: string;
  priceCents: number;
  category: string;
}[] = [
  { id: "adult-hand-wraps", name: "Adult Hand Wraps", priceCents: 2000, category: "gear" },
  { id: "kids-hand-wraps", name: "Kid's Hand Wraps", priceCents: 2000, category: "gear" },
  { id: "kids-boxing-gloves", name: "Kid's Boxing Gloves", priceCents: 7000, category: "gear" },
  {
    id: "sullys-boxing-gloves-white",
    name: "Sully's Boxing Gloves — White",
    priceCents: 9000,
    category: "gear",
  },
  {
    id: "sullys-boxing-gloves-black",
    name: "Sully's Boxing Gloves — Black",
    priceCents: 9000,
    category: "gear",
  },
  { id: "sullys-baseball-hat", name: "Sully's Baseball Hat", priceCents: 3000, category: "apparel" },
  {
    id: "sullys-t-shirts",
    name: "Sully's Boxing Gym T-Shirts",
    priceCents: 4000,
    category: "apparel",
  },
];

const DONATION_PRESETS = [2500, 5000, 10000, 25000];

@Controller("commerce")
export class CommerceController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("mode")
  mode() {
    return {
      provider: commerceProvider(),
      currency: "CAD",
      donationPresets: DONATION_PRESETS,
    };
  }

  @Get("catalog")
  catalog() {
    return {
      products: STORE_CATALOG,
      currency: "CAD",
    };
  }

  @Post("donate/checkout")
  async donateCheckout(
    @Body()
    body: {
      amountCents?: number;
      email?: string;
      name?: string;
      message?: string;
    },
  ) {
    const amountCents = Math.floor(Number(body.amountCents) || 0);
    if (amountCents < 500) {
      throw new BadRequestException("Minimum donation is $5");
    }
    if (amountCents > 500_000) {
      throw new BadRequestException("Amount too large");
    }

    const order = await this.prisma.commerceOrder.create({
      data: {
        kind: "donation",
        status: "pending",
        email: body.email?.trim() || null,
        name: body.name?.trim() || null,
        message: body.message?.trim() || null,
        amountCents,
        itemsJson: JSON.stringify([
          { id: "donation", name: "Donation", qty: 1, priceCents: amountCents },
        ]),
      },
    });

    const session = await createCommerceCheckout({
      amountCents,
      description: "Sully's Donation",
      successUrl: `${webOrigin()}/donate/success?orderId=${order.id}`,
      cancelUrl: `${webOrigin()}/donate`,
      customerEmail: body.email?.trim(),
      metadata: { orderId: order.id, kind: "donation" },
    });

    await this.prisma.paymentEvent.create({
      data: {
        commerceOrderId: order.id,
        provider: session.provider,
        externalId: session.externalId,
        type: "donation_checkout",
        status: "pending",
        amountCents,
        raw: JSON.stringify({ ticket: session.ticket ?? null }),
      },
    });

    return {
      orderId: order.id,
      provider: session.provider,
      checkoutUrl: session.checkoutUrl,
      ticket: session.ticket ?? null,
    };
  }

  @Post("store/checkout")
  async storeCheckout(
    @Body()
    body: {
      items?: { productId: string; qty?: number }[];
      email?: string;
      name?: string;
    },
  ) {
    const items = body.items ?? [];
    if (!items.length) throw new BadRequestException("Cart is empty");

    const lines: {
      id: string;
      name: string;
      qty: number;
      priceCents: number;
    }[] = [];
    let amountCents = 0;
    for (const line of items) {
      const product = STORE_CATALOG.find((p) => p.id === line.productId);
      if (!product) {
        throw new BadRequestException(`Unknown product: ${line.productId}`);
      }
      const qty = Math.min(20, Math.max(1, Math.floor(Number(line.qty) || 1)));
      lines.push({
        id: product.id,
        name: product.name,
        qty,
        priceCents: product.priceCents,
      });
      amountCents += product.priceCents * qty;
    }

    const order = await this.prisma.commerceOrder.create({
      data: {
        kind: "store",
        status: "pending",
        email: body.email?.trim() || null,
        name: body.name?.trim() || null,
        amountCents,
        itemsJson: JSON.stringify(lines),
      },
    });

    const session = await createCommerceCheckout({
      amountCents,
      description: "Sully's Store",
      successUrl: `${webOrigin()}/store/success?orderId=${order.id}`,
      cancelUrl: `${webOrigin()}/store`,
      customerEmail: body.email?.trim(),
      metadata: { orderId: order.id, kind: "store" },
    });

    await this.prisma.paymentEvent.create({
      data: {
        commerceOrderId: order.id,
        provider: session.provider,
        externalId: session.externalId,
        type: "store_checkout",
        status: "pending",
        amountCents,
        raw: JSON.stringify({ ticket: session.ticket ?? null }),
      },
    });

    return {
      orderId: order.id,
      provider: session.provider,
      checkoutUrl: session.checkoutUrl,
      ticket: session.ticket ?? null,
      amountCents,
    };
  }

  /** Complete mock (and Moneris-fallback) payments. */
  @Post("pay/complete")
  async completePay(
    @Body() body: { token?: string; orderId?: string },
  ) {
    const token = body.token?.trim();
    if (!token) throw new BadRequestException("token required");

    const event = await this.prisma.paymentEvent.findUnique({
      where: { externalId: token },
    });
    if (!event) throw new BadRequestException("Payment not found");
    if (event.status === "completed") {
      return { ok: true, alreadyPaid: true, orderId: event.commerceOrderId };
    }

    await this.prisma.paymentEvent.update({
      where: { id: event.id },
      data: { status: "completed" },
    });
    if (event.commerceOrderId) {
      await this.prisma.commerceOrder.update({
        where: { id: event.commerceOrderId },
        data: { status: "paid" },
      });
    }
    return {
      ok: true,
      orderId: event.commerceOrderId,
      amountCents: event.amountCents,
      kind: event.type,
    };
  }

  @Get("orders/:id")
  async orderById(@Param("id") id: string) {
    const order = await this.prisma.commerceOrder.findUnique({
      where: { id },
    });
    if (!order) throw new BadRequestException("Order not found");
    return {
      id: order.id,
      kind: order.kind,
      status: order.status,
      amountCents: order.amountCents,
      currency: order.currency,
      items: JSON.parse(order.itemsJson || "[]") as unknown[],
      name: order.name,
    };
  }
}
