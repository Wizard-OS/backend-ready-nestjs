BEGIN;

TRUNCATE TABLE
  clinic_subscription_audit_logs,
  clinic_subscriptions,
  notification_preferences,
  user_sessions,
  payment_methods,
  reminders,
  outbound_messages,
  message_templates,
  support_requests,
  clinic_storage_integrations,
  patient_professional_assignments,
  clinical_notes,
  treatment_sessions,
  treatments,
  clinical_records,
  expenses,
  payments,
  patient_files,
  odontogram_entries,
  invoice_items,
  invoices,
  appointments,
  appointment_types,
  patients,
  clinic_memberships,
  clinics,
  users
RESTART IDENTITY CASCADE;

COMMIT;
