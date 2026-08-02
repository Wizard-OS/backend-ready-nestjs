import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import fs from 'fs';

import { AppModule } from '../src/app.module';

describe('Phase 1 Flow (e2e)', () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let adminUserId: string;
  let doctorToken: string;
  let doctorUserId: string;
  let clinicId: string;
  let membershipId: string;
  let doctorMembershipId: string;
  let patientId: string;
  let patientDocumentId: string;
  let appointmentTypeId: string;
  let appointmentId: string;
  let clinicalRecordId: string;
  let clinicalNoteId: string;
  let treatmentId: string;
  let invoiceId: string;
  let paymentId: string;
  let patientFileId: string;
  let patientFilePath: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    await request(app.getHttpServer()).get('/seed').expect(200);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test1@google.com',
        password: 'Abc123',
      })
      .expect(201);

    adminToken = loginResponse.body.token;
    adminUserId = loginResponse.body.id;

    const doctorLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test2@google.com',
        password: 'Abc123',
      })
      .expect(201);

    doctorToken = doctorLoginResponse.body.token;
    doctorUserId = doctorLoginResponse.body.id;
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('creates clinic with owner membership', async () => {
    const clinicResponse = await request(app.getHttpServer())
      .post('/clinics')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Dental Hub Clinic',
        phone: '+59824000000',
        email: `clinic_${Date.now()}@example.com`,
        address: 'Av. Principal 123',
        timezone: 'America/Montevideo',
        currency: 'USD',
        workingHoursJson: {
          monday: [{ from: '09:00', to: '18:00' }],
        },
      })
      .expect(201);

    clinicId = clinicResponse.body.id;

    const membershipsResponse = await request(app.getHttpServer())
      .get('/clinic-memberships')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    const ownerMembership = membershipsResponse.body.find(
      (membership: { userId: string; role: string }) =>
        membership.userId === adminUserId && membership.role === 'owner',
    );

    expect(ownerMembership).toBeDefined();
    membershipId = ownerMembership.id;

    const doctorMembershipResponse = await request(app.getHttpServer())
      .post('/clinic-memberships')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        clinicId,
        userId: doctorUserId,
        role: 'odontologist',
      })
      .expect(201);

    doctorMembershipId = doctorMembershipResponse.body.id;
  });

  it('creates patient, appointment type and appointment in clinic scope', async () => {
    patientDocumentId = `UY-${Date.now()}`;

    const patientResponse = await request(app.getHttpServer())
      .post('/patients/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        clinicId,
        email: `patient_${Date.now()}@example.com`,
        firstName: 'Ana',
        lastName: 'Perez',
        documentId: patientDocumentId,
        birthDate: '1993-08-20',
        gender: 'Female',
        phone: `+5989${Date.now().toString().slice(-8)}`,
        emergencyContact: 'Laura Perez +59891111111',
        medicalHistory: 'Sin alergias conocidas',
        dentalHistory: 'Restauración antigua',
        observations: 'Prefiere agenda matutina',
      })
      .expect(201);

    patientId = patientResponse.body.id;

    const patientByDocument = await request(app.getHttpServer())
      .get(`/patients/${patientDocumentId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    expect(patientByDocument.body.id).toBe(patientId);

    const typeResponse = await request(app.getHttpServer())
      .post('/appointments/types')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        clinicId,
        name: 'Consulta General',
        durationMin: 30,
        defaultPrice: '60.00',
      })
      .expect(201);

    appointmentTypeId = typeResponse.body.id;

    const startAt = new Date(Date.now() + 3600 * 1000);
    const endAt = new Date(startAt.getTime() + 30 * 60000);

    const appointmentResponse = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        clinicId,
        patientId,
        appointmentTypeId,
        professionalMembershipId: membershipId,
        description: 'Control inicial',
        startTime: startAt.toISOString(),
        endTime: endAt.toISOString(),
      })
      .expect(201);

    appointmentId = appointmentResponse.body.id;
  });

  it('restricts secondary professionals to assigned patients without contact data', async () => {
    const hiddenPatientResponse = await request(app.getHttpServer())
      .post('/patients/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        clinicId,
        email: `hidden_patient_${Date.now()}@example.com`,
        firstName: 'Paciente',
        lastName: 'Oculto',
        documentId: `UY-HIDDEN-${Date.now()}`,
        birthDate: '1991-02-03',
        gender: 'Other',
        phone: `+5987${Date.now().toString().slice(-8)}`,
        address: 'Dirección reservada',
        emergencyContact: 'Contacto reservado',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/patient-assignments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        patientId,
        professionalMembershipId: doctorMembershipId,
      })
      .expect(201);

    const doctorPatients = await request(app.getHttpServer())
      .get('/patients')
      .set('Authorization', `Bearer ${doctorToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    expect(doctorPatients.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: patientId,
          phone: null,
          email: null,
          address: null,
          emergencyContact: null,
        }),
      ]),
    );
    expect(
      doctorPatients.body.some(
        (patient: { id: string }) =>
          patient.id === hiddenPatientResponse.body.id,
      ),
    ).toBe(false);

    await request(app.getHttpServer())
      .get(`/patients/${hiddenPatientResponse.body.id}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .set('x-clinic-id', clinicId)
      .expect(403);

    await request(app.getHttpServer())
      .get('/common/reports/income')
      .set('Authorization', `Bearer ${doctorToken}`)
      .set('x-clinic-id', clinicId)
      .expect(403);
  });

  it('grants and removes temporary patient access through appointment assignment', async () => {
    const temporaryPatient = await request(app.getHttpServer())
      .post('/patients/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        clinicId,
        email: `temporary_patient_${Date.now()}@example.com`,
        firstName: 'Temporal',
        lastName: 'Agenda',
        documentId: `UY-TEMP-${Date.now()}`,
        birthDate: '1995-05-05',
        gender: 'Other',
      })
      .expect(201);

    const startAt = new Date(Date.now() + 2 * 3600 * 1000);
    const endAt = new Date(startAt.getTime() + 30 * 60000);

    const temporaryAppointment = await request(app.getHttpServer())
      .post('/appointments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        clinicId,
        patientId: temporaryPatient.body.id,
        appointmentTypeId,
        professionalMembershipId: doctorMembershipId,
        description: 'Acceso temporal',
        startTime: startAt.toISOString(),
        endTime: endAt.toISOString(),
      })
      .expect(201);

    await request(app.getHttpServer())
      .get(`/patients/${temporaryPatient.body.id}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/appointments/${temporaryAppointment.body.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({ status: 3 })
      .expect(200);

    await request(app.getHttpServer())
      .get(`/patients/${temporaryPatient.body.id}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .set('x-clinic-id', clinicId)
      .expect(403);
  });

  it('documents clinical evolution, odontogram and treatment plan', async () => {
    const clinicalRecord = await request(app.getHttpServer())
      .post('/clinical-records')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        patientId,
        allergies: 'None',
        chronicDiseases: 'None',
        medicalHistory: 'Paciente sin medicación actual',
        dentalHistory: 'Restauración en pieza 36',
        observations: 'Control inicial completo',
      })
      .expect(201);

    clinicalRecordId = clinicalRecord.body.id;

    const clinicalNote = await request(app.getHttpServer())
      .post('/clinical-notes')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        clinicalRecordId,
        content: 'Se realiza evaluación inicial y se indica restauración.',
        reason: 'Dolor leve al masticar',
        diagnosis: 'Caries oclusal en pieza 36',
        procedure: 'Evaluación clínica',
        indications: 'Control y presupuesto de restauración',
        observations: 'Paciente tolera bien la consulta',
        toothCodes: ['36'],
      })
      .expect(201);

    clinicalNoteId = clinicalNote.body.id;

    const treatment = await request(app.getHttpServer())
      .post('/treatments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        name: 'Restauración pieza 36',
        patientId,
        doctorId: adminUserId,
        professionalMembershipId: membershipId,
        toothCode: '36',
        description: 'Restauración de resina',
        basePrice: '100.00',
        status: 'accepted',
      })
      .expect(201);

    treatmentId = treatment.body.id;

    const odontogramEntry = await request(app.getHttpServer())
      .patch(`/patients/${patientId}/odontogram/teeth/36`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        status: 'caries',
        observation: 'Lesión oclusal',
        clinicalNoteId,
        treatmentId,
      })
      .expect(200);

    expect(odontogramEntry.body.status).toBe('caries');
    expect(odontogramEntry.body.professionalMembershipId).toBe(membershipId);

    const odontogram = await request(app.getHttpServer())
      .get(`/patients/${patientId}/odontogram`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    expect(odontogram.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          toothCode: '36',
          status: 'caries',
        }),
      ]),
    );
  });

  it('handles partial payment and invoice status updates', async () => {
    const invoiceResponse = await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        clinicId,
        patientId,
        number: `INV-${Date.now()}`,
        treatmentId,
        status: 'accepted',
        subtotal: '100.00',
        discount: '0.00',
        tax: '0.00',
        totalAmount: '100.00',
        observations: 'Presupuesto simple MVP',
        items: [
          {
            type: 'custom',
            refId: treatmentId,
            description: 'Restauración pieza 36',
            qty: 1,
            unitPrice: '100.00',
          },
        ],
      })
      .expect(201);

    invoiceId = invoiceResponse.body.id;

    const paymentResponse = await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        invoiceId,
        amount: '40.00',
        method: 'cash',
        paidAt: new Date().toISOString(),
        receivedByMembershipId: membershipId,
      })
      .expect(201);

    paymentId = paymentResponse.body.id;

    const invoiceAfterPayment = await request(app.getHttpServer())
      .get(`/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    expect(invoiceAfterPayment.body.status).toBe('partially_paid');
  });

  it('rejects mismatched commercial document relations', async () => {
    const otherPatient = await request(app.getHttpServer())
      .post('/patients/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        clinicId,
        email: `other_patient_${Date.now()}@example.com`,
        firstName: 'Bruno',
        lastName: 'Silva',
        documentId: `UY-OTHER-${Date.now()}`,
        birthDate: '1984-04-12',
        gender: 'Male',
        phone: `+5988${Date.now().toString().slice(-8)}`,
      })
      .expect(201);

    const otherTreatment = await request(app.getHttpServer())
      .post('/treatments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        name: 'Limpieza otro paciente',
        patientId: otherPatient.body.id,
        doctorId: adminUserId,
        professionalMembershipId: membershipId,
        description: 'Tratamiento de control',
        basePrice: '80.00',
        status: 'accepted',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/invoices')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        clinicId,
        patientId,
        number: `INV-BAD-${Date.now()}`,
        treatmentId: otherTreatment.body.id,
        subtotal: '80.00',
        discount: '0.00',
        tax: '0.00',
        totalAmount: '80.00',
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/treatments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        name: 'Tratamiento con factura ajena',
        patientId: otherPatient.body.id,
        doctorId: adminUserId,
        professionalMembershipId: membershipId,
        description: 'Debe fallar por invoiceId',
        basePrice: '90.00',
        status: 'accepted',
        invoiceId,
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        invoiceId,
        patientId: otherPatient.body.id,
        amount: '1.00',
        method: 'cash',
        paidAt: new Date().toISOString(),
      })
      .expect(400);

    await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        invoiceId,
        treatmentId: otherTreatment.body.id,
        amount: '1.00',
        method: 'cash',
        paidAt: new Date().toISOString(),
      })
      .expect(400);
  });

  it('voids payments without deleting and registers another manual payment', async () => {
    const voidedPayment = await request(app.getHttpServer())
      .patch(`/payments/${paymentId}/void`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        reason: 'Pago cargado por error',
      })
      .expect(200);

    expect(voidedPayment.body.voidedAt).toBeDefined();
    expect(voidedPayment.body.voidReason).toBe('Pago cargado por error');

    await request(app.getHttpServer())
      .post('/payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .send({
        invoiceId,
        amount: '25.00',
        method: 'transfer',
        paidAt: new Date().toISOString(),
        receivedByMembershipId: membershipId,
      })
      .expect(201);

    const invoiceAfterPayment = await request(app.getHttpServer())
      .get(`/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    expect(invoiceAfterPayment.body.status).toBe('partially_paid');
  });

  it('uploads and lists patient files', async () => {
    const uploadResponse = await request(app.getHttpServer())
      .post(`/patients/${patientId}/files`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .field('type', 'pdf')
      .field('description', 'Radiografía inicial')
      .field('appointmentId', appointmentId)
      .field('clinicalNoteId', clinicalNoteId)
      .field('treatmentId', treatmentId)
      .attach('file', Buffer.from('%PDF-1.4 test'), {
        filename: 'radiografia.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    patientFileId = uploadResponse.body.id;
    patientFilePath = uploadResponse.body.path;
    expect(uploadResponse.body.patientId).toBe(patientId);
    expect(uploadResponse.body.url).toContain('/uploads/patient-files/');
    expect(fs.existsSync(patientFilePath)).toBe(true);

    const filesResponse = await request(app.getHttpServer())
      .get(`/patients/${patientId}/files`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    expect(filesResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: patientFileId,
          type: 'pdf',
        }),
      ]),
    );

    await request(app.getHttpServer())
      .delete(`/patient-files/${patientFileId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    expect(fs.existsSync(patientFilePath)).toBe(false);

    await request(app.getHttpServer())
      .get(`/patient-files/${patientFileId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .expect(404);
  });

  it('returns minimum phase 1 reports', async () => {
    const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const to = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const appointmentsReport = await request(app.getHttpServer())
      .get('/common/reports/appointments')
      .query({ from, to, professionalMembershipId: membershipId })
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    expect(appointmentsReport.body.total).toBeGreaterThanOrEqual(1);

    const incomeReport = await request(app.getHttpServer())
      .get('/common/reports/income')
      .query({ from, to })
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    expect(Number(incomeReport.body.total)).toBeGreaterThan(0);

    const pendingReport = await request(app.getHttpServer())
      .get('/common/reports/pending-payments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    expect(Number(pendingReport.body.totalPending)).toBeGreaterThan(0);

    const treatmentsReport = await request(app.getHttpServer())
      .get('/common/reports/active-treatments')
      .set('Authorization', `Bearer ${adminToken}`)
      .set('x-clinic-id', clinicId)
      .expect(200);

    expect(treatmentsReport.body.count).toBeGreaterThanOrEqual(1);
  });
});
