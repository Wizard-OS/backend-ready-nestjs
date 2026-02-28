import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TreatmentSession } from './entities/treatment-session.entity';
import { TreatmentSessionsService } from './treatment-sessions.service';
import { TreatmentSessionsController } from './treatment-sessions.controller';

@Module({
  controllers: [TreatmentSessionsController],
  providers: [TreatmentSessionsService],
  imports: [TypeOrmModule.forFeature([TreatmentSession])],
  exports: [TypeOrmModule],
})
export class TreatmentSessionsModule {}
