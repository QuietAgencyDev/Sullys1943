import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { HealthController } from "./health.controller";
import { ClassesController } from "./classes.controller";
import { AuthController } from "./auth/auth.controller";
import { AuthGuard } from "./auth/auth.guard";
import { BillingController } from "./billing.controller";
import { AdminUsersController } from "./admin-users.controller";
import { TvController } from "./tv.controller";
import {
  SessionsController,
  BookingsController,
  CalendarController,
  CheckInController,
  AttendanceController,
  DocumentsController,
  AnnouncementsController,
  MessagesController,
  GamificationController,
  PassportController,
  LegacyController,
  NutritionController,
  KitchenController,
  DeskController,
  FamilyController,
  OwnerBriefController,
} from "./platform.controllers";
import { PortalController } from "./portal.controller";
import { CoachController } from "./coach.controller";
import { ProgressionService } from "./progression.service";

@Module({
  controllers: [
    HealthController,
    ClassesController,
    AuthController,
    BillingController,
    AdminUsersController,
    TvController,
    PortalController,
    CoachController,
    SessionsController,
    BookingsController,
    CalendarController,
    CheckInController,
    AttendanceController,
    DocumentsController,
    AnnouncementsController,
    MessagesController,
    GamificationController,
    PassportController,
    LegacyController,
    NutritionController,
    KitchenController,
    DeskController,
    FamilyController,
    OwnerBriefController,
  ],
  providers: [PrismaService, AuthGuard, ProgressionService],
})
export class AppModule {}
