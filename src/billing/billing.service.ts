import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IncomingHttpHeaders } from 'http';
import { Repository } from 'typeorm';

import { Clinic } from '../clinics/entities/clinic.entity';
import { NotificationChannel } from '../common/interfaces/notification-channel.enum';
import { MembershipService } from '../membership/membership.service';
import { BillingProvider } from '../membership/interfaces/billing-provider.enum';
import { SubscriptionStatus } from '../membership/interfaces/subscription-status.enum';
import { OutboundMessagesService } from '../outbound-messages/outbound-messages.service';
import { CreateBillingCheckoutDto } from './dto/create-billing-checkout.dto';
import { BillingWebhookEvent } from './entities/billing-webhook-event.entity';
import { BillingProviderAdapter } from './interfaces/billing-provider-adapter.interface';
import { PayPalBillingProvider } from './providers/paypal-billing.provider';

interface ProviderWebhookPayload {
  id?: string;
  event_type?: string;
  resource?: Record<string, unknown>;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @InjectRepository(BillingWebhookEvent)
    private readonly webhookEventRepository: Repository<BillingWebhookEvent>,

    @InjectRepository(Clinic)
    private readonly clinicRepository: Repository<Clinic>,

    private readonly membershipService: MembershipService,
    private readonly outboundMessagesService: OutboundMessagesService,
    private readonly paypalProvider: PayPalBillingProvider,
  ) {}

  async createCheckout(clinicId: string, dto: CreateBillingCheckoutDto) {
    const provider = this.getProvider(BillingProvider.paypal);
    const created = await provider.createSubscription({
      clinicId,
      planCode: dto.planCode,
      interval: dto.interval,
    });

    await this.membershipService.beginProviderSubscription({
      clinicId,
      provider: created.provider,
      providerSubscriptionId: created.providerSubscriptionId,
      providerPlanId: created.providerPlanId,
      providerStatus: created.providerStatus,
    });

    return {
      provider: created.provider,
      providerSubscriptionId: created.providerSubscriptionId,
      providerStatus: created.providerStatus,
      approvalUrl: created.approvalUrl,
    };
  }

  async handlePayPalWebhook(headers: IncomingHttpHeaders, payload: unknown) {
    const provider = this.getProvider(BillingProvider.paypal);
    const verification = await provider.verifyWebhook(headers, payload);

    if (!verification.verified) {
      throw new UnauthorizedException('Invalid PayPal webhook signature');
    }

    const event = this.asWebhookPayload(payload);
    const eventId =
      event.id ?? this.getHeader(headers, 'paypal-transmission-id');
    const eventType = event.event_type;

    if (!eventId || !eventType) {
      throw new BadRequestException('Invalid PayPal webhook payload');
    }

    const providerSubscriptionId =
      this.extractProviderSubscriptionId(event) ?? null;
    const existing = await this.webhookEventRepository.findOne({
      where: { provider: BillingProvider.paypal, eventId },
    });

    if (existing?.processedAt) {
      return {
        received: true,
        duplicate: true,
        eventId,
        eventType,
      };
    }

    const savedEvent =
      existing ??
      (await this.webhookEventRepository.save(
        this.webhookEventRepository.create({
          provider: BillingProvider.paypal,
          eventId,
          eventType,
          providerSubscriptionId,
          payload: this.toRecord(payload),
          processedAt: null,
        }),
      ));

    await this.processPayPalEvent(provider, event, eventId);

    savedEvent.processedAt = new Date();
    await this.webhookEventRepository.save(savedEvent);

    return {
      received: true,
      duplicate: false,
      eventId,
      eventType,
    };
  }

  private async processPayPalEvent(
    provider: BillingProviderAdapter,
    event: ProviderWebhookPayload,
    eventId: string,
  ) {
    const providerSubscriptionId = this.extractProviderSubscriptionId(event);

    if (!providerSubscriptionId) {
      this.logger.debug(`Ignoring PayPal event without subscription id`);
      return;
    }

    if (
      [
        'BILLING.SUBSCRIPTION.ACTIVATED',
        'BILLING.SUBSCRIPTION.UPDATED',
        'PAYMENT.SALE.COMPLETED',
      ].includes(event.event_type ?? '')
    ) {
      const details = await provider.getSubscription(providerSubscriptionId);

      if (this.isActivePayPalStatus(details.providerStatus)) {
        const activation =
          await this.membershipService.activateProviderSubscription({
            clinicId: details.clinicId ?? undefined,
            provider: BillingProvider.paypal,
            providerSubscriptionId: details.providerSubscriptionId,
            providerPlanId: details.providerPlanId,
            providerCustomerId: details.providerCustomerId,
            providerStatus: details.providerStatus,
            currentPeriodStart: details.currentPeriodStart,
            currentPeriodEnd: details.currentPeriodEnd,
            webhookEventId: eventId,
          });

        if (activation.issuedLicenseKey) {
          await this.queueLicenseDelivery({
            clinicId: activation.clinicId,
            licenseKey: activation.issuedLicenseKey,
            providerSubscriptionId: details.providerSubscriptionId,
            currentPeriodEnd: details.currentPeriodEnd,
          });
        }
        return;
      }

      await this.membershipService.markProviderSubscription({
        provider: BillingProvider.paypal,
        providerSubscriptionId,
        status: this.mapPayPalStatus(details.providerStatus),
        providerStatus: details.providerStatus,
        currentPeriodEnd: details.currentPeriodEnd,
        webhookEventId: eventId,
      });
      return;
    }

    if (event.event_type === 'BILLING.SUBSCRIPTION.CREATED') {
      const details = await provider.getSubscription(providerSubscriptionId);

      if (details.clinicId) {
        await this.membershipService.beginProviderSubscription({
          clinicId: details.clinicId ?? undefined,
          provider: BillingProvider.paypal,
          providerSubscriptionId,
          providerPlanId: details.providerPlanId ?? '',
          providerStatus: details.providerStatus ?? 'CREATED',
        });
      }
      return;
    }

    if (event.event_type === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
      await this.membershipService.markProviderSubscription({
        provider: BillingProvider.paypal,
        providerSubscriptionId,
        status: SubscriptionStatus.pastDue,
        providerStatus: 'PAYMENT_FAILED',
        webhookEventId: eventId,
      });
      return;
    }

    if (event.event_type === 'BILLING.SUBSCRIPTION.SUSPENDED') {
      await this.membershipService.markProviderSubscription({
        provider: BillingProvider.paypal,
        providerSubscriptionId,
        status: SubscriptionStatus.suspended,
        providerStatus: 'SUSPENDED',
        webhookEventId: eventId,
      });
      return;
    }

    if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
      await this.membershipService.markProviderSubscription({
        provider: BillingProvider.paypal,
        providerSubscriptionId,
        status: SubscriptionStatus.canceled,
        providerStatus: 'CANCELLED',
        cancelAtPeriodEnd: true,
        webhookEventId: eventId,
      });
      return;
    }

    if (event.event_type === 'BILLING.SUBSCRIPTION.EXPIRED') {
      await this.membershipService.markProviderSubscription({
        provider: BillingProvider.paypal,
        providerSubscriptionId,
        status: SubscriptionStatus.expired,
        providerStatus: 'EXPIRED',
        webhookEventId: eventId,
      });
    }
  }

  private getProvider(provider: BillingProvider): BillingProviderAdapter {
    if (provider === BillingProvider.paypal) {
      return this.paypalProvider;
    }

    throw new BadRequestException(`Unsupported billing provider ${provider}`);
  }

  private asWebhookPayload(payload: unknown): ProviderWebhookPayload {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Webhook payload must be an object');
    }

    return payload;
  }

  private extractProviderSubscriptionId(event: ProviderWebhookPayload) {
    const resource = event.resource;

    if (!resource) return null;

    if (event.event_type?.startsWith('BILLING.SUBSCRIPTION.')) {
      return this.stringValue(resource.id);
    }

    return (
      this.stringValue(resource.billing_agreement_id) ??
      this.stringValue(resource.subscription_id) ??
      this.stringValue(resource.billing_subscription_id)
    );
  }

  private mapPayPalStatus(status: string | null) {
    switch (status) {
      case 'ACTIVE':
        return SubscriptionStatus.active;
      case 'APPROVAL_PENDING':
      case 'APPROVED':
        return SubscriptionStatus.incomplete;
      case 'SUSPENDED':
        return SubscriptionStatus.suspended;
      case 'CANCELLED':
        return SubscriptionStatus.canceled;
      case 'EXPIRED':
        return SubscriptionStatus.expired;
      default:
        return SubscriptionStatus.incomplete;
    }
  }

  private isActivePayPalStatus(status: string | null) {
    return status === 'ACTIVE';
  }

  private stringValue(value: unknown) {
    return typeof value === 'string' && value.trim() ? value : null;
  }

  private getHeader(headers: IncomingHttpHeaders, name: string) {
    const value = headers[name];
    return typeof value === 'string' ? value : null;
  }

  private toRecord(payload: unknown): Record<string, unknown> {
    if (payload && typeof payload === 'object') {
      return payload as Record<string, unknown>;
    }

    return { value: payload };
  }

  private async queueLicenseDelivery(input: {
    clinicId: string;
    licenseKey: string;
    providerSubscriptionId: string;
    currentPeriodEnd: Date | null;
  }) {
    const clinic = await this.clinicRepository.findOne({
      where: { id: input.clinicId },
      select: { id: true, name: true, email: true },
    });

    await this.outboundMessagesService.create(input.clinicId, {
      channel: NotificationChannel.EMAIL,
      payloadJson: {
        type: 'premium_license_issued',
        to: clinic?.email ?? null,
        subject: 'Tu membresía Premium fue activada',
        clinicName: clinic?.name ?? null,
        licenseKey: input.licenseKey,
        provider: BillingProvider.paypal,
        providerSubscriptionId: input.providerSubscriptionId,
        currentPeriodEnd: input.currentPeriodEnd?.toISOString() ?? null,
      },
    });
  }
}
