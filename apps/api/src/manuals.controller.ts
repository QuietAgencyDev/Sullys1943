import { createReadStream, existsSync } from "node:fs";
import { join } from "node:path";
import {
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import {
  AuthGuard,
  CurrentUser,
  type AuthPayload,
} from "./auth/auth.guard";

const STAFF = ["owner", "admin", "coach", "front_desk"];
const OWNERS = ["owner", "admin"];

const FILES: Record<string, { file: string; roles: string[] }> = {
  "member-guide": {
    file: "Sullys-Member-Family-User-Guide.pdf",
    roles: ["member", "parent", "child", ...STAFF],
  },
  "owner-manual": {
    file: "Sullys-Owner-Staff-Operations-Manual.pdf",
    roles: STAFF,
  },
  "app-costs": {
    file: "Sullys-App-Hard-Costs.pdf",
    roles: OWNERS,
  },
  "for-danielle": {
    file: "Sullys-For-Danielle.pdf",
    roles: OWNERS,
  },
};

@Controller("manuals")
@UseGuards(AuthGuard)
export class ManualsController {
  @Get(":name")
  download(
    @Param("name") name: string,
    @CurrentUser() auth: AuthPayload,
    @Res() res: Response,
  ) {
    const item = FILES[name];
    if (!item) throw new NotFoundException();
    if (!item.roles.includes(auth.role)) {
      throw new ForbiddenException("That document is not on this login.");
    }
    const full = join(process.cwd(), "private", "manuals", item.file);
    if (!existsSync(full)) throw new NotFoundException();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${item.file}"`);
    createReadStream(full).pipe(res);
  }
}
