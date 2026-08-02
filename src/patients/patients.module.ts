import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Patient } from './entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { PatientProfessionalAssignment } from '../patient-assignments/entities/patient-professional-assignment.entity';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { PatientAccessService } from './services/patient-access.service';

@Module({
  controllers: [PatientsController],
  providers: [PatientsService, PatientAccessService],
  imports: [
    TypeOrmModule.forFeature([
      Patient,
      Appointment,
      PatientProfessionalAssignment,
    ]),
  ],
  exports: [TypeOrmModule, PatientAccessService],
})
export class PatientsModule {}
