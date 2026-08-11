-- How to integrate:
-- Apply with: cd apps/api && npx prisma migrate deploy
-- Or for local: npx prisma db push (schema already includes these columns)
-- Additive only — does not alter or drop existing columns.

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "is_competitive_fighter" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "boxing_ontario_reg_num" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "boxrec_id_pro" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "boxrec_id_amateur" TEXT;
