DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_memberships_role_enum')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'clinic_memberships_role_enum'
        AND e.enumlabel = 'specialist'
    )
  THEN
    ALTER TYPE clinic_memberships_role_enum ADD VALUE 'specialist';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_subscriptions_plancode_enum') THEN
    CREATE TYPE clinic_subscriptions_plancode_enum AS ENUM ('free', 'premium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_subscriptions_status_enum') THEN
    CREATE TYPE clinic_subscriptions_status_enum AS ENUM ('active');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_subscription_audit_logs_previousplancode_enum') THEN
    CREATE TYPE clinic_subscription_audit_logs_previousplancode_enum AS ENUM ('free', 'premium');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_subscription_audit_logs_nextplancode_enum') THEN
    CREATE TYPE clinic_subscription_audit_logs_nextplancode_enum AS ENUM ('free', 'premium');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS clinic_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "clinicId" uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  "planCode" clinic_subscriptions_plancode_enum NOT NULL DEFAULT 'free',
  "planVersion" text NOT NULL DEFAULT '2026-08-mvp',
  status clinic_subscriptions_status_enum NOT NULL DEFAULT 'active',
  "startedAt" timestamptz NOT NULL DEFAULT now(),
  "currentPeriodStart" timestamptz,
  "currentPeriodEnd" timestamptz,
  "assignedByMembershipId" uuid REFERENCES clinic_memberships(id) ON DELETE SET NULL,
  "changeReason" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_clinic_subscriptions_clinic
  ON clinic_subscriptions ("clinicId");

CREATE TABLE IF NOT EXISTS clinic_subscription_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "clinicId" uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  "previousPlanCode" clinic_subscription_audit_logs_previousplancode_enum,
  "nextPlanCode" clinic_subscription_audit_logs_nextplancode_enum NOT NULL,
  "changedByMembershipId" uuid REFERENCES clinic_memberships(id) ON DELETE SET NULL,
  reason text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clinic_subscription_audit_logs_clinic_created
  ON clinic_subscription_audit_logs ("clinicId", "createdAt");

INSERT INTO clinic_subscriptions (
  "clinicId",
  "planCode",
  "planVersion",
  status,
  "startedAt",
  "currentPeriodStart",
  "createdAt",
  "updatedAt"
)
SELECT
  c.id,
  'free',
  '2026-08-mvp',
  'active',
  now(),
  now(),
  now(),
  now()
FROM clinics c
LEFT JOIN clinic_subscriptions cs ON cs."clinicId" = c.id
WHERE cs.id IS NULL;
