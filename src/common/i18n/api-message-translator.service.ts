import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class ApiMessageTranslatorService {
  constructor(private readonly i18n: I18nService) {}

  translate(message: string, lang?: string) {
    const currentLang = lang ?? I18nContext.current()?.lang ?? 'en';

    if (!message) return message;

    const exact = this.translateExact(message, currentLang);
    if (exact) return exact;

    const dynamic = this.translateDynamic(message, currentLang);
    if (dynamic) return dynamic;

    return message;
  }

  private t(key: string, lang: string, args?: Record<string, unknown>) {
    return this.i18n.t(key, {
      lang,
      args,
      defaultValue: key,
    });
  }

  private translateExact(message: string, lang: string) {
    const exactMap: Record<string, string> = {
      'clinicId does not match x-clinic-id scope': 'api.scope_mismatch',
      'startTime must be before endTime': 'api.start_before_end',
      'Appointment overlaps with an existing slot': 'api.appointment_overlap',
      'Credentials are not valid (email)': 'api.invalid_credentials_email',
      'Credentials are not valid (password)':
        'api.invalid_credentials_password',
      'User not found (request)': 'api.user_not_found_request',
      'User not found': 'api.user_not_found',
      'Token not valid': 'api.token_not_valid',
      'User is inactive, talk with an admin': 'api.user_inactive',
      'Please check server logs': 'api.internal_error',
      'x-clinic-id header with valid UUID is required':
        'api.header_clinic_required',
      'Authenticated user not found': 'api.auth_user_not_found',
      'User does not have active membership for the requested clinic':
        'api.auth_no_membership',
      'Payment amount exceeds pending invoice balance':
        'api.payment_exceeds_balance',
      'Treatment and clinical record must belong to the same patient':
        'api.same_patient_required',
    };

    const key = exactMap[message];
    return key ? this.t(key, lang) : null;
  }

  private translateDynamic(message: string, lang: string) {
    const invalidId = message.match(/^Invalid (.+) id$/i);
    if (invalidId) {
      return this.t('api.invalid_id', lang, { resource: invalidId[1] });
    }

    const notFound = message.match(/^(.*) with id (.+) not found$/i);
    if (notFound) {
      return this.t('api.not_found', lang, {
        resource: notFound[1],
        id: notFound[2],
      });
    }

    const removed = message.match(/^(.*) (.+) removed$/i);
    if (removed) {
      return this.t('api.removed', lang, {
        resource: removed[1],
        id: removed[2],
      });
    }

    const cancelled = message.match(/^(.*) (.+) cancelled$/i);
    if (cancelled) {
      return this.t('api.cancelled', lang, {
        resource: cancelled[1],
        id: cancelled[2],
      });
    }

    const archived = message.match(/^(.*) (.+) archived$/i);
    if (archived) {
      return this.t('api.archived', lang, {
        resource: archived[1],
        id: archived[2],
      });
    }

    const belongs = message.match(
      /^(.*) does not belong to the requested clinic$/i,
    );
    if (belongs) {
      return this.t('api.belongs_to_clinic', lang, {
        resource: belongs[1],
      });
    }

    const patientTerm = message.match(
      /^Patient with id, email, firstName or lastName "(.+)" not found$/,
    );
    if (patientTerm) {
      return this.t('api.patient_not_found_term', lang, {
        term: patientTerm[1],
      });
    }

    const recordExists = message.match(
      /^Clinical record already exists for patient (.+)$/,
    );
    if (recordExists) {
      return this.t('api.record_exists_patient', lang, {
        patientId: recordExists[1],
      });
    }

    return null;
  }
}
