CREATE TABLE IF NOT EXISTS patient_professional_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "clinicId" uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  "patientId" uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  "professionalMembershipId" uuid NOT NULL REFERENCES clinic_memberships(id) ON DELETE CASCADE,
  "assignedByMembershipId" uuid NOT NULL REFERENCES clinic_memberships(id) ON DELETE RESTRICT,
  "isActive" boolean NOT NULL DEFAULT true,
  "revokedByMembershipId" uuid REFERENCES clinic_memberships(id) ON DELETE SET NULL,
  "revokedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_assignments_clinic_patient
  ON patient_professional_assignments ("clinicId", "patientId");

CREATE INDEX IF NOT EXISTS idx_patient_assignments_clinic_professional
  ON patient_professional_assignments ("clinicId", "professionalMembershipId");

CREATE UNIQUE INDEX IF NOT EXISTS uq_patient_assignments_active
  ON patient_professional_assignments (
    "clinicId",
    "patientId",
    "professionalMembershipId"
  )
  WHERE "isActive" = true;
