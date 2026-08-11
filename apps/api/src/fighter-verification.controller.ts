/**
 * Competitive Fighter Verification — isolated controller.
 * Registered only in app.module.ts. Do not merge into auth or platform.controllers.
 * Frontend: GET/PATCH /api/v1/fighter-verification — never auth/user update routes.
 */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import {
  AuthGuard,
  CurrentUser,
  type AuthPayload,
} from "./auth/auth.guard";

const ID_MAX = 120;
/** Allow BoxRec path fragments like /box-pro/123 or plain numeric IDs */
const ID_PATTERN = /^[A-Za-z0-9/_.-]+$/;

function cleanId(raw: string | null, field: string): string | null {
  if (raw === null) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.length > ID_MAX) {
    throw new BadRequestException(`${field} is too long`);
  }
  if (!ID_PATTERN.test(trimmed)) {
    throw new BadRequestException(
      `${field} contains invalid characters (use letters, numbers, /, -, _, .)`,
    );
  }
  return trimmed;
}

function normalizeBoxrecHref(id: string | null | undefined): string | null {
  if (!id) return null;
  if (id.startsWith("http://") || id.startsWith("https://")) return id;
  const path = id.startsWith("/") ? id : `/${id}`;
  return `https://boxrec.com${path}`;
}

@Controller("fighter-verification")
@UseGuards(AuthGuard)
export class FighterVerificationController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("me")
  async me(@CurrentUser() auth: AuthPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: auth.sub },
      select: {
        isCompetitiveFighter: true,
        boxingOntarioRegNum: true,
        boxrecIdPro: true,
        boxrecIdAmateur: true,
      },
    });
    if (!user) throw new BadRequestException("User not found");

    return {
      isCompetitiveFighter: user.isCompetitiveFighter,
      boxingOntarioRegNum: user.boxingOntarioRegNum,
      boxrecIdPro: user.boxrecIdPro,
      boxrecIdAmateur: user.boxrecIdAmateur,
      links: {
        boxrecPro: normalizeBoxrecHref(user.boxrecIdPro),
        boxrecAmateur: normalizeBoxrecHref(user.boxrecIdAmateur),
        boxingOntario: user.boxingOntarioRegNum
          ? "https://boxingon.ca"
          : null,
      },
    };
  }

  @Patch()
  async update(
    @CurrentUser() auth: AuthPayload,
    @Body()
    body: {
      isCompetitiveFighter?: boolean;
      boxingOntarioRegNum?: string | null;
      boxrecIdPro?: string | null;
      boxrecIdAmateur?: string | null;
    },
  ) {
    const data: {
      isCompetitiveFighter?: boolean;
      boxingOntarioRegNum?: string | null;
      boxrecIdPro?: string | null;
      boxrecIdAmateur?: string | null;
    } = {};

    if (body.boxingOntarioRegNum !== undefined) {
      if (
        body.boxingOntarioRegNum !== null &&
        typeof body.boxingOntarioRegNum !== "string"
      ) {
        throw new BadRequestException("boxingOntarioRegNum must be a string");
      }
      data.boxingOntarioRegNum = cleanId(
        body.boxingOntarioRegNum,
        "boxingOntarioRegNum",
      );
    }
    if (body.boxrecIdPro !== undefined) {
      if (body.boxrecIdPro !== null && typeof body.boxrecIdPro !== "string") {
        throw new BadRequestException("boxrecIdPro must be a string");
      }
      data.boxrecIdPro = cleanId(body.boxrecIdPro, "boxrecIdPro");
    }
    if (body.boxrecIdAmateur !== undefined) {
      if (
        body.boxrecIdAmateur !== null &&
        typeof body.boxrecIdAmateur !== "string"
      ) {
        throw new BadRequestException("boxrecIdAmateur must be a string");
      }
      data.boxrecIdAmateur = cleanId(body.boxrecIdAmateur, "boxrecIdAmateur");
    }
    if (typeof body.isCompetitiveFighter === "boolean") {
      data.isCompetitiveFighter = body.isCompetitiveFighter;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException("No fighter fields to update");
    }

    // If any ID is set and flag omitted, mark competitive
    if (data.isCompetitiveFighter === undefined) {
      const nextPro =
        data.boxrecIdPro !== undefined
          ? data.boxrecIdPro
          : undefined;
      const nextAm =
        data.boxrecIdAmateur !== undefined
          ? data.boxrecIdAmateur
          : undefined;
      const nextOn =
        data.boxingOntarioRegNum !== undefined
          ? data.boxingOntarioRegNum
          : undefined;
      if (nextPro || nextAm || nextOn) {
        data.isCompetitiveFighter = true;
      }
    }

    const user = await this.prisma.user.update({
      where: { id: auth.sub },
      data,
      select: {
        isCompetitiveFighter: true,
        boxingOntarioRegNum: true,
        boxrecIdPro: true,
        boxrecIdAmateur: true,
      },
    });

    return {
      isCompetitiveFighter: user.isCompetitiveFighter,
      boxingOntarioRegNum: user.boxingOntarioRegNum,
      boxrecIdPro: user.boxrecIdPro,
      boxrecIdAmateur: user.boxrecIdAmateur,
      links: {
        boxrecPro: normalizeBoxrecHref(user.boxrecIdPro),
        boxrecAmateur: normalizeBoxrecHref(user.boxrecIdAmateur),
        boxingOntario: user.boxingOntarioRegNum
          ? "https://boxingon.ca"
          : null,
      },
    };
  }
}
