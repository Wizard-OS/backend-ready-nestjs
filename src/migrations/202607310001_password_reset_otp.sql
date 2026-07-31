ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "passwordResetOtpHash" text,
  ADD COLUMN IF NOT EXISTS "passwordResetOtpExpiresAt" timestamp,
  ADD COLUMN IF NOT EXISTS "passwordResetOtpUsedAt" timestamp;

CREATE INDEX IF NOT EXISTS idx_users_password_reset_expires
  ON users ("passwordResetOtpExpiresAt")
  WHERE "passwordResetOtpHash" IS NOT NULL;
