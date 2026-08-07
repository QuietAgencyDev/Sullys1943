import { z } from "zod";
export declare const HealthResponseSchema: z.ZodObject<{
    status: z.ZodLiteral<"ok">;
    service: z.ZodString;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    status: "ok";
    service: string;
    timestamp: string;
}, {
    status: "ok";
    service: string;
    timestamp: string;
}>;
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
export declare const LiveClassSchema: z.ZodObject<{
    id: z.ZodString;
    startsAt: z.ZodString;
    name: z.ZodString;
    spotsLeft: z.ZodNumber;
    capacity: z.ZodNumber;
    status: z.ZodEnum<["open", "full", "cancelled"]>;
}, "strip", z.ZodTypeAny, {
    status: "open" | "full" | "cancelled";
    id: string;
    startsAt: string;
    name: string;
    spotsLeft: number;
    capacity: number;
}, {
    status: "open" | "full" | "cancelled";
    id: string;
    startsAt: string;
    name: string;
    spotsLeft: number;
    capacity: number;
}>;
export type LiveClass = z.infer<typeof LiveClassSchema>;
export declare const LiveClassesResponseSchema: z.ZodObject<{
    classes: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        startsAt: z.ZodString;
        name: z.ZodString;
        spotsLeft: z.ZodNumber;
        capacity: z.ZodNumber;
        status: z.ZodEnum<["open", "full", "cancelled"]>;
    }, "strip", z.ZodTypeAny, {
        status: "open" | "full" | "cancelled";
        id: string;
        startsAt: string;
        name: string;
        spotsLeft: number;
        capacity: number;
    }, {
        status: "open" | "full" | "cancelled";
        id: string;
        startsAt: string;
        name: string;
        spotsLeft: number;
        capacity: number;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    classes: {
        status: "open" | "full" | "cancelled";
        id: string;
        startsAt: string;
        name: string;
        spotsLeft: number;
        capacity: number;
    }[];
}, {
    classes: {
        status: "open" | "full" | "cancelled";
        id: string;
        startsAt: string;
        name: string;
        spotsLeft: number;
        capacity: number;
    }[];
}>;
export type LiveClassesResponse = z.infer<typeof LiveClassesResponseSchema>;
//# sourceMappingURL=index.d.ts.map