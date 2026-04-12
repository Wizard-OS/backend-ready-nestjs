-- Add profile photo URL to users
-- Idempotent migration for PostgreSQL.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "profilePhotoUrl" text;
