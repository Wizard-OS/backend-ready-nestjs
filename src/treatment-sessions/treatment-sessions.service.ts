import { Injectable } from '@nestjs/common';
import { CreateTreatmentSessionDto } from './dto/create-treatment-session.dto';
import { UpdateTreatmentSessionDto } from './dto/update-treatment-session.dto';

@Injectable()
export class TreatmentSessionsService {
  create(createTreatmentSessionDto: CreateTreatmentSessionDto) {
    return 'This action adds a new treatmentSession';
  }

  findAll() {
    return `This action returns all treatmentSessions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} treatmentSession`;
  }

  update(id: number, updateTreatmentSessionDto: UpdateTreatmentSessionDto) {
    return `This action updates a #${id} treatmentSession`;
  }

  remove(id: number) {
    return `This action removes a #${id} treatmentSession`;
  }
}
