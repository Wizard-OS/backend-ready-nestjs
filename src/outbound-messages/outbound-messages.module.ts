import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OutboundMessage } from './entities/outbound-message.entity';
import { OutboundMessagesService } from './outbound-messages.service';
import { OutboundMessagesController } from './outbound-messages.controller';
import { Patient } from '../patients/entities/patient.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { MessageTemplate } from '../message-templates/entities/message-template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OutboundMessage,
      Patient,
      Appointment,
      MessageTemplate,
    ]),
  ],
  controllers: [OutboundMessagesController],
  providers: [OutboundMessagesService],
  exports: [TypeOrmModule, OutboundMessagesService],
})
export class OutboundMessagesModule {}
