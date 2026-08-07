"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveClassesResponseSchema = exports.LiveClassSchema = exports.HealthResponseSchema = void 0;
const zod_1 = require("zod");
exports.HealthResponseSchema = zod_1.z.object({
    status: zod_1.z.literal("ok"),
    service: zod_1.z.string(),
    timestamp: zod_1.z.string(),
});
exports.LiveClassSchema = zod_1.z.object({
    id: zod_1.z.string(),
    startsAt: zod_1.z.string(),
    name: zod_1.z.string(),
    spotsLeft: zod_1.z.number().int().nonnegative(),
    capacity: zod_1.z.number().int().positive(),
    status: zod_1.z.enum(["open", "full", "cancelled"]),
});
exports.LiveClassesResponseSchema = zod_1.z.object({
    classes: zod_1.z.array(exports.LiveClassSchema),
});
//# sourceMappingURL=index.js.map