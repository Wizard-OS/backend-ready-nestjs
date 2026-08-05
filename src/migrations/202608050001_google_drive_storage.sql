-- Google Drive storage integration for patient files.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storage_provider_type_enum') THEN
    CREATE TYPE storage_provider_type_enum AS ENUM ('local', 'google_drive');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'storage_integration_status_enum') THEN
    CREATE TYPE storage_integration_status_enum AS ENUM ('connected', 'disconnected', 'error');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_file_storage_status_enum') THEN
    CREATE TYPE patient_file_storage_status_enum AS ENUM (
      'available',
      'unavailable',
      'pending_classification'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'patient_file_sync_source_enum') THEN
    CREATE TYPE patient_file_sync_source_enum AS ENUM (
      'app',
      'drive_import',
      'drive_update'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS clinic_storage_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "clinicId" uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  provider storage_provider_type_enum NOT NULL DEFAULT 'google_drive',
  status storage_integration_status_enum NOT NULL DEFAULT 'disconnected',
  "rootFolderId" text,
  "patientsFolderId" text,
  "encryptedAccessToken" text,
  "encryptedRefreshToken" text,
  "tokenExpiresAt" timestamptz,
  "driveStartPageToken" text,
  "metadataJson" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_clinic_storage_integrations_clinic_provider UNIQUE ("clinicId", provider)
);

CREATE INDEX IF NOT EXISTS idx_clinic_storage_integrations_clinic
  ON clinic_storage_integrations ("clinicId");

ALTER TABLE patient_files
  ADD COLUMN IF NOT EXISTS "storageProvider" storage_provider_type_enum NOT NULL DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS "storageStatus" patient_file_storage_status_enum NOT NULL DEFAULT 'available',
  ADD COLUMN IF NOT EXISTS "syncSource" patient_file_sync_source_enum NOT NULL DEFAULT 'app',
  ADD COLUMN IF NOT EXISTS "driveFileId" text,
  ADD COLUMN IF NOT EXISTS "driveFolderId" text,
  ADD COLUMN IF NOT EXISTS checksum text,
  ADD COLUMN IF NOT EXISTS "driveModifiedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "externalMetadataJson" jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE UNIQUE INDEX IF NOT EXISTS uq_patient_files_drive_file_id
  ON patient_files ("driveFileId")
  WHERE "driveFileId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_patient_files_storage_status
  ON patient_files ("storageProvider", "storageStatus");
