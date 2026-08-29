import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Clinic } from './entities/clinic.entity';
import { ClinicsController } from './clinics.controller';
import { ClinicsService } from './clinics.service';
import { ClinicMembership } from '../clinic-memberships/entities/clinic-membership.entity';
import { CommonModule } from '../common/common.module';

@Module({
  controllers: [ClinicsController],
  providers: [ClinicsService],
  imports: [CommonModule, TypeOrmModule.forFeature([Clinic, ClinicMembership])],
  exports: [TypeOrmModule, ClinicsService],
})
export class ClinicsModule {}
