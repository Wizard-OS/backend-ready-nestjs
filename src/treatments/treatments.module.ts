import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Treatment } from './entities/treatment.entity';
import { TreatmentsService } from './treatments.service';
import { TreatmentsController } from './treatments.controller';

@Module({
  controllers: [TreatmentsController],
  providers: [TreatmentsService],
  imports: [TypeOrmModule.forFeature([Treatment])],
  exports: [TypeOrmModule],
})
export class TreatmentsModule {}
