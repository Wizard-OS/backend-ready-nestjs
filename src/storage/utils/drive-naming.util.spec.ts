import { PatientFileType } from '../../patient-files/interfaces/patient-file-type.enum';
import {
  buildClinicRootFolderName,
  buildDriveFileName,
  buildPatientFolderName,
  folderForPatientFileType,
  patientFileTypeFromDriveFolder,
  slugifyForDrive,
} from './drive-naming.util';

describe('drive naming utilities', () => {
  it('builds clinic and patient folder names without patient PII', () => {
    expect(
      buildClinicRootFolderName(
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'Clínica Sonrisa & Salud',
      ),
    ).toBe('DentalHub__tenant-a1b2c3__clinica-sonrisa-salud');

    expect(buildPatientFolderName('p9x4k2d4-e5f6-7890-abcd-ef1234567890')).toBe(
      'patient-PAC-P9X4K2__p9x4k2',
    );
  });

  it('maps patient file types to expected Drive folders', () => {
    expect(folderForPatientFileType(PatientFileType.RADIOGRAPHY)).toBe(
      'radiographs',
    );
    expect(folderForPatientFileType(PatientFileType.IMAGE)).toBe(
      'clinical-images',
    );
    expect(folderForPatientFileType(PatientFileType.PDF)).toBe('documents');
    expect(folderForPatientFileType(PatientFileType.OTHER)).toBe('misc');
  });

  it('infers patient file types from Drive folder names', () => {
    expect(patientFileTypeFromDriveFolder('radiographs')).toBe(
      PatientFileType.RADIOGRAPHY,
    );
    expect(patientFileTypeFromDriveFolder('clinical-images')).toBe(
      PatientFileType.IMAGE,
    );
    expect(patientFileTypeFromDriveFolder('documents')).toBe(
      PatientFileType.DOCUMENT,
    );
    expect(patientFileTypeFromDriveFolder('misc')).toBe(PatientFileType.OTHER);
  });

  it('builds file names with stable date and file id short code', () => {
    expect(
      buildDriveFileName(
        PatientFileType.RADIOGRAPHY,
        'panoramica.JPG',
        '12345678-e5f6-7890-abcd-ef1234567890',
        new Date('2026-08-05T12:00:00.000Z'),
      ),
    ).toBe('rx__2026-08-05__file-123456.jpg');
  });

  it('falls back to a safe clinic slug', () => {
    expect(slugifyForDrive('!!!')).toBe('clinica');
  });
});
