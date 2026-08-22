import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Clinic } from '../clinics/entities/clinic.entity';
import { MembershipModule } from '../membership/membership.module';
import { OutboundMessagesModule } from '../outbound-messages/outbound-messages.module';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { BillingWebhookEvent } from './entities/billing-webhook-event.entity';
import { PayPalBillingProvider } from './providers/paypal-billing.provider';

@Module({
  controllers: [BillingController],
  providers: [BillingService, PayPalBillingProvider],
  imports: [
    TypeOrmModule.forFeature([BillingWebhookEvent, Clinic]),
    MembershipModule,
    OutboundMessagesModule,
  ],
})
export class BillingModule {}
