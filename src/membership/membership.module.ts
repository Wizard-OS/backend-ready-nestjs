import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClinicMembership } from '../clinic-memberships/entities/clinic-membership.entity';
import { PatientFile } from '../patient-files/entities/patient-file.entity';
import { Patient } from '../patients/entities/patient.entity';
import { ClinicSubscriptionAuditLog } from './entities/clinic-subscription-audit-log.entity';
import { ClinicSubscription } from './entities/clinic-subscription.entity';
import { MembershipController } from './membership.controller';
import { MembershipService } from './membership.service';

@Module({
  controllers: [MembershipController],
  providers: [MembershipService],
  imports: [
    TypeOrmModule.forFeature([
      ClinicSubscription,
      ClinicSubscriptionAuditLog,
      ClinicMembership,
      Patient,
      PatientFile,
    ]),
  ],
  exports: [TypeOrmModule, MembershipService],
})
export class MembershipModule {}
