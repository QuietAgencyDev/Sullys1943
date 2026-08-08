/**
 * Commerce payment adapter — Moneris when configured, otherwise mock checkout.
 * Membership Stripe path stays in billing.controller.ts until consolidated.
 */

export type PaymentProviderName = "mock" | "moneris";

export type CheckoutCreateInput = {
  amountCents: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
};

export type CheckoutCreateResult = {
  provider: PaymentProviderName;
  externalId: string;
  checkoutUrl: string;
  /** Moneris ticket for Checkout.js when hosted page URL is not used */
  ticket?: string;
};

export function commerceProvider(): PaymentProviderName {
  if (
    process.env.MONERIS_STORE_ID &&
    process.env.MONERIS_API_TOKEN &&
    process.env.MONERIS_CHECKOUT_ID
  ) {
    return "moneris";
  }
  return "mock";
}

export function webOrigin() {
  return process.env.WEB_ORIGIN ?? "http://localhost:3000";
}

function dollarsFromCents(cents: number) {
  return (Math.max(0, cents) / 100).toFixed(2);
}

/**
 * Create a checkout session. Mock returns an in-app pay URL.
 * Moneris uses Checkout ticket API (test/prod host from MONERIS_ENV).
 */
export async function createCommerceCheckout(
  input: CheckoutCreateInput,
): Promise<CheckoutCreateResult> {
  const provider = commerceProvider();
  const externalId = `com_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

  if (provider === "mock") {
    const url = new URL("/pay/mock", webOrigin());
    url.searchParams.set("token", externalId);
    url.searchParams.set(
      "amount",
      String(input.amountCents),
    );
    if (input.metadata?.orderId) {
      url.searchParams.set("orderId", input.metadata.orderId);
    }
    return {
      provider: "mock",
      externalId,
      checkoutUrl: url.toString(),
    };
  }

  const env = (process.env.MONERIS_ENV ?? "qa").toLowerCase();
  const endpoint =
    env === "prod" || env === "production"
      ? "https://gateway.moneris.com/chkt/request/request.php"
      : "https://gatewayt.moneris.com/chkt/request/request.php";

  const payload = {
    store_id: process.env.MONERIS_STORE_ID,
    api_token: process.env.MONERIS_API_TOKEN,
    checkout_id: process.env.MONERIS_CHECKOUT_ID,
    txn_total: dollarsFromCents(input.amountCents),
    environment: env === "prod" || env === "production" ? "prod" : "qa",
    action: "preload",
    order_no: externalId,
    cust_id: input.customerEmail ?? "",
    dynamic_descriptor: input.description.slice(0, 20),
  };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data: { response?: { ticket?: string; success?: string } } = {};
    try {
      data = JSON.parse(text) as typeof data;
    } catch {
      data = {};
    }
    const ticket = data.response?.ticket;
    if (!ticket) {
      // Fall back to mock if Moneris rejects / misconfigured
      const url = new URL("/pay/mock", webOrigin());
      url.searchParams.set("token", externalId);
      url.searchParams.set("amount", String(input.amountCents));
      url.searchParams.set("fallback", "moneris");
      return {
        provider: "mock",
        externalId,
        checkoutUrl: url.toString(),
      };
    }
    const checkoutUrl = new URL("/pay/moneris", webOrigin());
    checkoutUrl.searchParams.set("ticket", ticket);
    checkoutUrl.searchParams.set("token", externalId);
    return {
      provider: "moneris",
      externalId,
      checkoutUrl: checkoutUrl.toString(),
      ticket,
    };
  } catch {
    const url = new URL("/pay/mock", webOrigin());
    url.searchParams.set("token", externalId);
    url.searchParams.set("amount", String(input.amountCents));
    return {
      provider: "mock",
      externalId,
      checkoutUrl: url.toString(),
    };
  }
}
