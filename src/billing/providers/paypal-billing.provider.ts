import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { IncomingHttpHeaders } from 'http';

import { getEnv, getRequiredEnv } from '../../config/env';
import { BillingProvider } from '../../membership/interfaces/billing-provider.enum';
import { MembershipPlanCode } from '../../membership/interfaces/membership-plan-code.enum';
import { BillingInterval } from '../interfaces/billing-interval.enum';
import {
  BillingProviderAdapter,
  CreateProviderSubscriptionInput,
  CreatedProviderSubscription,
  ProviderSubscriptionDetails,
  ProviderWebhookVerification,
} from '../interfaces/billing-provider-adapter.interface';

interface PayPalLink {
  href?: string;
  rel?: string;
  method?: string;
}

interface PayPalSubscriptionResponse {
  id?: string;
  plan_id?: string;
  status?: string;
  custom_id?: string;
  start_time?: string;
  subscriber?: {
    payer_id?: string;
  };
  billing_info?: {
    next_billing_time?: string;
  };
  links?: PayPalLink[];
}

interface PayPalVerifyWebhookResponse {
  verification_status?: string;
}

@Injectable()
export class PayPalBillingProvider implements BillingProviderAdapter {
  readonly provider = BillingProvider.paypal;

  private readonly logger = new Logger(PayPalBillingProvider.name);

  async createSubscription(
    input: CreateProviderSubscriptionInput,
  ): Promise<CreatedProviderSubscription> {
    if (input.planCode !== MembershipPlanCode.premium) {
      throw new BadRequestException('Only premium subscriptions are billable');
    }

    const providerPlanId = this.getPlanId(input.interval);
    const subscription = await this.paypalRequest<PayPalSubscriptionResponse>(
      '/v1/billing/subscriptions',
      {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: {
          plan_id: providerPlanId,
          custom_id: input.clinicId,
          application_context: {
            brand_name: getEnv('PAYPAL_BRAND_NAME') ?? 'Dental Hub',
            user_action: 'SUBSCRIBE_NOW',
            return_url: getRequiredEnv('PAYPAL_RETURN_URL'),
            cancel_url: getRequiredEnv('PAYPAL_CANCEL_URL'),
          },
        },
      },
    );

    if (!subscription.id) {
      throw new BadRequestException(
        'PayPal did not return a subscription id',
      );
    }

    const approvalUrl = subscription.links?.find(
      (link) => link.rel === 'approve',
    )?.href;

    if (!approvalUrl) {
      throw new BadRequestException('PayPal did not return an approval URL');
    }

    return {
      provider: this.provider,
      providerSubscriptionId: subscription.id,
      providerPlanId,
      providerStatus: subscription.status ?? 'CREATED',
      approvalUrl,
    };
  }

  async verifyWebhook(
    headers: IncomingHttpHeaders,
    payload: unknown,
  ): Promise<ProviderWebhookVerification> {
    const webhookId = getRequiredEnv('PAYPAL_WEBHOOK_ID');
    const verification = await this.paypalRequest<PayPalVerifyWebhookResponse>(
      '/v1/notifications/verify-webhook-signature',
      {
        method: 'POST',
        body: {
          auth_algo: this.requireHeader(headers, 'paypal-auth-algo'),
          cert_url: this.requireHeader(headers, 'paypal-cert-url'),
          transmission_id: this.requireHeader(
            headers,
            'paypal-transmission-id',
          ),
          transmission_sig: this.requireHeader(
            headers,
            'paypal-transmission-sig',
          ),
          transmission_time: this.requireHeader(
            headers,
            'paypal-transmission-time',
          ),
          webhook_id: webhookId,
          webhook_event: payload,
        },
      },
    );

    return { verified: verification.verification_status === 'SUCCESS' };
  }

  async getSubscription(
    providerSubscriptionId: string,
  ): Promise<ProviderSubscriptionDetails> {
    const subscription = await this.paypalRequest<PayPalSubscriptionResponse>(
      `/v1/billing/subscriptions/${encodeURIComponent(providerSubscriptionId)}`,
      { method: 'GET' },
    );

    return {
      providerSubscriptionId,
      providerPlanId: subscription.plan_id ?? null,
      providerCustomerId: subscription.subscriber?.payer_id ?? null,
      providerStatus: subscription.status ?? null,
      clinicId: subscription.custom_id ?? null,
      currentPeriodStart: this.parseDate(subscription.start_time),
      currentPeriodEnd: this.parseDate(
        subscription.billing_info?.next_billing_time,
      ),
    };
  }

  private getPlanId(interval: BillingInterval) {
    if (interval === BillingInterval.monthly) {
      return getRequiredEnv('PAYPAL_PREMIUM_MONTHLY_PLAN_ID');
    }

    return getRequiredEnv('PAYPAL_PREMIUM_YEARLY_PLAN_ID');
  }

  private async paypalRequest<T>(
    path: string,
    options: {
      method: 'GET' | 'POST';
      headers?: Record<string, string>;
      body?: Record<string, unknown>;
    },
  ): Promise<T> {
    const accessToken = await this.getAccessToken();
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const message = await response.text();
      this.logger.error(`PayPal API error ${response.status}: ${message}`);
      throw new BadRequestException('PayPal request failed');
    }

    return (await response.json()) as T;
  }

  private async getAccessToken() {
    const clientId = getRequiredEnv('PAYPAL_CLIENT_ID');
    const clientSecret = getRequiredEnv('PAYPAL_CLIENT_SECRET');
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
      'base64',
    );
    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
    });

    if (!response.ok) {
      const message = await response.text();
      this.logger.error(`PayPal OAuth error ${response.status}: ${message}`);
      throw new BadRequestException('PayPal authentication failed');
    }

    const body = (await response.json()) as { access_token?: string };

    if (!body.access_token) {
      throw new BadRequestException('PayPal did not return an access token');
    }

    return body.access_token;
  }

  private get baseUrl() {
    return getEnv('PAYPAL_ENV') === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  }

  private requireHeader(headers: IncomingHttpHeaders, name: string) {
    const value = headers[name];

    if (!value || Array.isArray(value)) {
      throw new BadRequestException(`Missing PayPal webhook header ${name}`);
    }

    return value;
  }

  private parseDate(value?: string) {
    if (!value) return null;

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
