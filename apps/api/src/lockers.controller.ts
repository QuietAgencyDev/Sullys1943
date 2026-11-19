import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "./auth/auth.guard";

/**
 * Locker rental is a limited membership add-on.
 * The desk has not posted the fee yet, so this does not create a charge.
 */
@Controller("lockers")
@UseGuards(AuthGuard)
export class LockersController {
  @Get("offer")
  offer() {
    return {
      code: "locker-rental",
      name: "Locker rental",
      limited: true,
      priceCents: null as number | null,
      currency: "cad",
      status: "fee_pending",
      note: "Limited lockers. Ask the front desk to reserve one. The fee will be added to membership when the desk posts it. Nothing is charged in the app yet.",
    };
  }
}
