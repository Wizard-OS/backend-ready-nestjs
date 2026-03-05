import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Clinic } from './entities/clinic.entity';
import { ClinicsController } from './clinics.controller';
import { ClinicsService } from './clinics.service';

@Module({
  controllers: [ClinicsController],
  providers: [ClinicsService],
  imports: [TypeOrmModule.forFeature([Clinic])],
  exports: [TypeOrmModule, ClinicsService],
})
export class ClinicsModule {}
