import { Controller, Get, Inject } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

@Controller("classes")
export class ClassesController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get("live")
  async getLive() {
    const start = new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const sessions = await this.prisma.session.findMany({
      where: { startsAt: { gte: start, lt: end } },
      include: { bookings: true },
      orderBy: { startsAt: "asc" },
      take: 8,
    });

    if (sessions.length === 0) {
      return {
        classes: [
          {
            id: "seed-fallback",
            startsAt: "6:00 PM",
            name: "Boxing Fundamentals",
            spotsLeft: 8,
            capacity: 16,
            status: "open" as const,
          },
        ],
      };
    }

    return {
      classes: sessions.map((s) => {
        const booked = s.bookings.filter((b) => b.status !== "cancelled").length;
        const spotsLeft = Math.max(0, s.capacity - booked);
        return {
          id: s.id,
          startsAt: s.startsAt.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          }),
          name: s.title,
          spotsLeft,
          capacity: s.capacity,
          status: spotsLeft === 0 ? ("full" as const) : ("open" as const),
        };
      }),
    };
  }
}
