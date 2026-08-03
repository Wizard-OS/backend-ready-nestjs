import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClinicMembership } from './entities/clinic-membership.entity';
import { ClinicMembershipsService } from './clinic-memberships.service';
import { ClinicMembershipsController } from './clinic-memberships.controller';
import { MembershipModule } from '../membership/membership.module';

@Module({
  controllers: [ClinicMembershipsController],
  providers: [ClinicMembershipsService],
  imports: [MembershipModule, TypeOrmModule.forFeature([ClinicMembership])],
  exports: [TypeOrmModule, ClinicMembershipsService],
})
export class ClinicMembershipsModule {}
