import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  timestamp: z.string(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const LiveClassSchema = z.object({
  id: z.string(),
  startsAt: z.string(),
  name: z.string(),
  spotsLeft: z.number().int().nonnegative(),
  capacity: z.number().int().positive(),
  status: z.enum(["open", "full", "cancelled"]),
});

export type LiveClass = z.infer<typeof LiveClassSchema>;

export const LiveClassesResponseSchema = z.object({
  classes: z.array(LiveClassSchema),
});

export type LiveClassesResponse = z.infer<typeof LiveClassesResponseSchema>;
