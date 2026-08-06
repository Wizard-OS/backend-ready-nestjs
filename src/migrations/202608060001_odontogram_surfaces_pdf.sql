-- Odontogram MVP: tooth surfaces, action grouping and generated PDF support.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'odontogram_entries_surface_enum'
  ) THEN
    CREATE TYPE odontogram_entries_surface_enum AS ENUM (
      'full',
      'vestibular',
      'lingual',
      'mesial',
      'distal',
      'occlusal'
    );
  END IF;
END $$;

ALTER TABLE odontogram_entries
  ADD COLUMN IF NOT EXISTS surface odontogram_entries_surface_enum NOT NULL DEFAULT 'full',
  ADD COLUMN IF NOT EXISTS "actionGroupId" uuid,
  ADD COLUMN IF NOT EXISTS "treatmentType" text,
  ADD COLUMN IF NOT EXISTS description text;

ALTER TABLE odontogram_entries
  DROP CONSTRAINT IF EXISTS uq_odontogram_patient_tooth;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'uq_odontogram_patient_tooth_surface'
  ) THEN
    ALTER TABLE odontogram_entries
      ADD CONSTRAINT uq_odontogram_patient_tooth_surface
      UNIQUE ("patientId", "toothCode", surface);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_odontogram_patient_tooth_surface
  ON odontogram_entries ("patientId", "toothCode", surface);

CREATE INDEX IF NOT EXISTS idx_odontogram_action_group
  ON odontogram_entries ("actionGroupId");
