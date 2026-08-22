DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_subscriptions_billingprovider_enum') THEN
    CREATE TYPE clinic_subscriptions_billingprovider_enum AS ENUM ('paypal');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_webhook_events_provider_enum') THEN
    CREATE TYPE billing_webhook_events_provider_enum AS ENUM ('paypal');
  END IF;

  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_subscriptions_status_enum')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'clinic_subscriptions_status_enum'
        AND e.enumlabel = 'incomplete'
    )
  THEN
    ALTER TYPE clinic_subscriptions_status_enum ADD VALUE 'incomplete';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_subscriptions_status_enum')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'clinic_subscriptions_status_enum'
        AND e.enumlabel = 'trialing'
    )
  THEN
    ALTER TYPE clinic_subscriptions_status_enum ADD VALUE 'trialing';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_subscriptions_status_enum')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'clinic_subscriptions_status_enum'
        AND e.enumlabel = 'past_due'
    )
  THEN
    ALTER TYPE clinic_subscriptions_status_enum ADD VALUE 'past_due';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_subscriptions_status_enum')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'clinic_subscriptions_status_enum'
        AND e.enumlabel = 'suspended'
    )
  THEN
    ALTER TYPE clinic_subscriptions_status_enum ADD VALUE 'suspended';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_subscriptions_status_enum')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'clinic_subscriptions_status_enum'
        AND e.enumlabel = 'canceled'
    )
  THEN
    ALTER TYPE clinic_subscriptions_status_enum ADD VALUE 'canceled';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'clinic_subscriptions_status_enum')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'clinic_subscriptions_status_enum'
        AND e.enumlabel = 'expired'
    )
  THEN
    ALTER TYPE clinic_subscriptions_status_enum ADD VALUE 'expired';
  END IF;
END $$;

ALTER TABLE clinic_subscriptions
  ADD COLUMN IF NOT EXISTS "billingProvider" clinic_subscriptions_billingprovider_enum,
  ADD COLUMN IF NOT EXISTS "providerCustomerId" text,
  ADD COLUMN IF NOT EXISTS "providerSubscriptionId" text,
  ADD COLUMN IF NOT EXISTS "providerPlanId" text,
  ADD COLUMN IF NOT EXISTS "providerStatus" text,
  ADD COLUMN IF NOT EXISTS "licenseKeyHash" text,
  ADD COLUMN IF NOT EXISTS "licenseKeySuffix" text,
  ADD COLUMN IF NOT EXISTS "licenseIssuedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "licenseActivatedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "cancelAtPeriodEnd" bool NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "lastWebhookEventId" text,
  ADD COLUMN IF NOT EXISTS "lastWebhookProcessedAt" timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS uq_clinic_subscriptions_provider_subscription
  ON clinic_subscriptions ("billingProvider", "providerSubscriptionId")
  WHERE "billingProvider" IS NOT NULL
    AND "providerSubscriptionId" IS NOT NULL;

CREATE TABLE IF NOT EXISTS billing_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider billing_webhook_events_provider_enum NOT NULL,
  "eventId" text NOT NULL,
  "eventType" text NOT NULL,
  "providerSubscriptionId" text,
  payload jsonb NOT NULL,
  "processedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_billing_webhook_events_provider_event UNIQUE (provider, "eventId")
);

CREATE INDEX IF NOT EXISTS idx_billing_webhook_events_provider_subscription
  ON billing_webhook_events (provider, "providerSubscriptionId");
