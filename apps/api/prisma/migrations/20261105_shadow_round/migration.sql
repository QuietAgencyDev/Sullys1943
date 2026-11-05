-- Adult shadow-round reads. Counts and the coach note only. No video.

CREATE TABLE IF NOT EXISTS "ShadowRound" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "engine" TEXT NOT NULL,
  "modelId" TEXT NOT NULL DEFAULT 'mediapipe-pose-lite-v1',
  "signalsJson" TEXT NOT NULL DEFAULT '{}',
  "stance" TEXT NOT NULL,
  "durationSec" INTEGER NOT NULL,
  "frames" INTEGER NOT NULL,
  "visibleFrames" INTEGER NOT NULL,
  "guardLowFrames" INTEGER NOT NULL,
  "feetNarrowFrames" INTEGER NOT NULL,
  "chinUpFrames" INTEGER NOT NULL,
  "punches" INTEGER NOT NULL,
  "jabs" INTEGER NOT NULL,
  "crosses" INTEGER NOT NULL,
  "hooks" INTEGER NOT NULL,
  "uppercuts" INTEGER NOT NULL,
  "shortStraights" INTEGER NOT NULL,
  "missedReturns" INTEGER NOT NULL,
  "signal" TEXT NOT NULL,
  "correction" TEXT NOT NULL,
  "drillTitle" TEXT NOT NULL,
  "drillSteps" TEXT NOT NULL,
  "coachStatus" TEXT NOT NULL DEFAULT 'open',
  "coachNote" TEXT,
  "reviewedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ShadowRound_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ShadowRound_userId_createdAt_idx" ON "ShadowRound"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "ShadowRound_coachStatus_createdAt_idx" ON "ShadowRound"("coachStatus", "createdAt");

ALTER TABLE "ShadowRound" ADD COLUMN IF NOT EXISTS "modelId" TEXT NOT NULL DEFAULT 'mediapipe-pose-lite-v1';
ALTER TABLE "ShadowRound" ADD COLUMN IF NOT EXISTS "signalsJson" TEXT NOT NULL DEFAULT '{}';

DO $$ BEGIN
  ALTER TABLE "ShadowRound"
    ADD CONSTRAINT "ShadowRound_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
