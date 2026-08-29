-- Patient profile fields required by the mobile Add Patient flow.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_files_type_enum')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'patient_files_type_enum'
        AND e.enumlabel = 'profile_photo'
    )
  THEN
    ALTER TYPE patient_files_type_enum ADD VALUE 'profile_photo';
  END IF;
END $$;

ALTER TABLE patients
  ADD COLUMN IF NOT EXISTS profession text,
  ADD COLUMN IF NOT EXISTS "streetAddress" text,
  ADD COLUMN IF NOT EXISTS "addressNumber" text,
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS "postalCode" text,
  ADD COLUMN IF NOT EXISTS "profilePhotoFileId" uuid,
  ADD COLUMN IF NOT EXISTS "profilePhotoUrl" text;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_files')
    AND NOT EXISTS (
      SELECT 1
      FROM pg_constraint
      WHERE conname = 'fk_patients_profile_photo_file'
    )
  THEN
    ALTER TABLE patients
      ADD CONSTRAINT fk_patients_profile_photo_file
      FOREIGN KEY ("profilePhotoFileId")
      REFERENCES patient_files(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_patients_profile_photo_file
  ON patients ("profilePhotoFileId")
  WHERE "profilePhotoFileId" IS NOT NULL;
