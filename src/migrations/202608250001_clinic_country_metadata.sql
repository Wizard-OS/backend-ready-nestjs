ALTER TABLE clinics
  ADD COLUMN IF NOT EXISTS "countryCode" text NOT NULL DEFAULT 'UY',
  ADD COLUMN IF NOT EXISTS "countryName" text NOT NULL DEFAULT 'Uruguay',
  ADD COLUMN IF NOT EXISTS "callingCodes" text[] NOT NULL DEFAULT ARRAY['598']::text[],
  ADD COLUMN IF NOT EXISTS "defaultCallingCode" text NOT NULL DEFAULT '598';

UPDATE clinics
SET
  "countryCode" = COALESCE(NULLIF("countryCode", ''), 'UY'),
  "countryName" = COALESCE(NULLIF("countryName", ''), 'Uruguay'),
  "callingCodes" = CASE
    WHEN "callingCodes" IS NULL OR cardinality("callingCodes") = 0 THEN ARRAY['598']::text[]
    ELSE "callingCodes"
  END,
  "defaultCallingCode" = COALESCE(NULLIF("defaultCallingCode", ''), '598');
