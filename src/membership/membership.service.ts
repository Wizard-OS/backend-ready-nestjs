import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ClinicMembership } from '../clinic-memberships/entities/clinic-membership.entity';
import { ClinicMembershipRole } from '../clinic-memberships/interfaces/clinic-membership-role.enum';
import { PatientFile } from '../patient-files/entities/patient-file.entity';
import { Patient } from '../patients/entities/patient.entity';
import { ClinicSubscription } from './entities/clinic-subscription.entity';
import { ClinicSubscriptionAuditLog } from './entities/clinic-subscription-audit-log.entity';
import { MembershipPlanCode } from './interfaces/membership-plan-code.enum';
import { SubscriptionStatus } from './interfaces/subscription-status.enum';

type LimitValue = number | null;

interface MembershipLimits {
  professionalUsers: LimitValue;
  totalUsers: LimitValue;
  activePatients: LimitValue;
  storageBytes: LimitValue;
  messagingCreditsMonthlyIncluded: LimitValue;
}

const PLAN_VERSION = '2026-08-mvp';

const PLAN_LIMITS: Record<MembershipPlanCode, MembershipLimits> = {
  [MembershipPlanCode.free]: {
    professionalUsers: 1,
    totalUsers: 2,
    activePatients: null,
    storageBytes: 512 * 1024 * 1024,
    messagingCreditsMonthlyIncluded: 100,
  },
  [MembershipPlanCode.premium]: {
    professionalUsers: 10,
    totalUsers: 20,
    activePatients: null,
    storageBytes: 50 * 1024 * 1024 * 1024,
    messagingCreditsMonthlyIncluded: null,
  },
};

const MVP_ENTITLEMENTS = {
  basicClinicConfiguration: true,
  oneOperationalSite: true,
  basicRoles: true,
  dailyWeeklySchedule: true,
  patientRecords: true,
  clinicalHistory: true,
  basicOdontogram: true,
  treatmentPlans: true,
  simpleEstimates: true,
  basicPayments: true,
  clinicalFiles: true,
  basicReminders: true,
  minimumReports: true,
  googleCalendar: false,
  patientPortal: false,
  onlinePayments: false,
  messagingCredits: false,
  checkout: false,
};

@Injectable()
export class MembershipService {
  constructor(
    @InjectRepository(ClinicSubscription)
    private readonly subscriptionRepository: Repository<ClinicSubscription>,

    @InjectRepository(ClinicSubscriptionAuditLog)
    private readonly auditLogRepository: Repository<ClinicSubscriptionAuditLog>,

    @InjectRepository(ClinicMembership)
    private readonly clinicMembershipRepository: Repository<ClinicMembership>,

    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,

    @InjectRepository(PatientFile)
    private readonly patientFileRepository: Repository<PatientFile>,
  ) {}

  async getCurrent(clinicId: string) {
    const subscription = await this.ensureSubscription(clinicId);
    const limits = PLAN_LIMITS[subscription.planCode];
    const usage = await this.getUsage(clinicId);

    return {
      plan: {
        code: subscription.planCode,
        version: subscription.planVersion,
      },
      status: subscription.status,
      limits,
      usage,
      warnings: this.buildWarnings(limits, usage),
      entitlements: MVP_ENTITLEMENTS,
    };
  }

  async assignManual(
    clinicId: string,
    changedByMembershipId: string,
    planCode: MembershipPlanCode,
    reason?: string,
  ) {
    await this.assertMembershipInClinic(clinicId, changedByMembershipId);

    const subscription = await this.ensureSubscription(clinicId);
    const previousPlanCode = subscription.planCode;

    subscription.planCode = planCode;
    subscription.planVersion = PLAN_VERSION;
    subscription.status = SubscriptionStatus.active;
    subscription.assignedByMembershipId = changedByMembershipId;
    subscription.changeReason = reason ?? null;
    subscription.currentPeriodStart =
      subscription.currentPeriodStart ?? new Date();

    const saved = await this.subscriptionRepository.save(subscription);

    await this.auditLogRepository.save(
      this.auditLogRepository.create({
        clinicId,
        previousPlanCode,
        nextPlanCode: planCode,
        changedByMembershipId,
        reason: reason ?? null,
      }),
    );

    return this.getCurrent(saved.clinicId);
  }

  async assertCanCreateMembership(
    clinicId: string,
    nextRole: ClinicMembershipRole,
  ) {
    const current = await this.getCurrent(clinicId);

    this.assertLimitAvailable(
      current.limits.totalUsers,
      current.usage.totalUsers,
      'User limit reached for current membership',
    );

    if (this.isProfessionalRole(nextRole)) {
      await this.assertCanAddProfessional(clinicId);
    }
  }

  async assertCanAddProfessional(clinicId: string) {
    const current = await this.getCurrent(clinicId);
    this.assertLimitAvailable(
      current.limits.professionalUsers,
      current.usage.professionalUsers,
      'Professional limit reached for current membership',
    );
  }

  async assertCanStoreFile(clinicId: string, incomingBytes: number) {
    const current = await this.getCurrent(clinicId);
    const limit = current.limits.storageBytes;

    if (limit != null && current.usage.storageBytes + incomingBytes > limit) {
      throw new BadRequestException(
        'Storage limit reached for current membership',
      );
    }
  }

  async ensureSubscription(clinicId: string): Promise<ClinicSubscription> {
    const existing = await this.subscriptionRepository.findOne({
      where: { clinicId },
    });

    if (existing) return existing;

    const now = new Date();
    return await this.subscriptionRepository.save(
      this.subscriptionRepository.create({
        clinicId,
        planCode: MembershipPlanCode.free,
        planVersion: PLAN_VERSION,
        status: SubscriptionStatus.active,
        startedAt: now,
        currentPeriodStart: now,
      }),
    );
  }

  isProfessionalRole(role: ClinicMembershipRole): boolean {
    return [
      ClinicMembershipRole.odontologist,
      ClinicMembershipRole.specialist,
    ].includes(role);
  }

  private async getUsage(clinicId: string) {
    const [totalUsers, professionalUsers, activePatients, storage] =
      await Promise.all([
        this.clinicMembershipRepository.count({
          where: { clinicId, isActive: true, user: { isActive: true } },
          relations: { user: true },
        }),
        this.clinicMembershipRepository
          .createQueryBuilder('membership')
          .innerJoin('membership.user', 'user')
          .where('membership.clinicId = :clinicId', { clinicId })
          .andWhere('membership.isActive = true')
          .andWhere('user.isActive = true')
          .andWhere('membership.role IN (:...roles)', {
            roles: [
              ClinicMembershipRole.odontologist,
              ClinicMembershipRole.specialist,
            ],
          })
          .getCount(),
        this.patientRepository.count({ where: { clinicId } }),
        this.patientFileRepository
          .createQueryBuilder('file')
          .select('COALESCE(SUM(file.size), 0)', 'total')
          .innerJoin('file.patient', 'patient')
          .where('patient.clinicId = :clinicId', { clinicId })
          .getRawOne<{ total: string }>(),
      ]);

    return {
      professionalUsers,
      totalUsers,
      activePatients,
      storageBytes: Number(storage?.total ?? 0),
      messagingCreditsMonthlyIncluded: 0,
    };
  }

  private buildWarnings(
    limits: MembershipLimits,
    usage: {
      professionalUsers: number;
      totalUsers: number;
      activePatients: number;
      storageBytes: number;
      messagingCreditsMonthlyIncluded: number;
    },
  ) {
    return Object.entries(limits).reduce(
      (acc, [key, limit]) => {
        if (limit == null || key === 'messagingCreditsMonthlyIncluded') {
          return acc;
        }

        const used = usage[key as keyof typeof usage];
        const ratio = used / limit;
        acc[key] = {
          at80Percent: ratio >= 0.8,
          blocked: used >= limit,
        };
        return acc;
      },
      {} as Record<string, { at80Percent: boolean; blocked: boolean }>,
    );
  }

  private assertLimitAvailable(
    limit: LimitValue,
    currentUsage: number,
    message: string,
  ) {
    if (limit != null && currentUsage >= limit) {
      throw new BadRequestException(message);
    }
  }

  private async assertMembershipInClinic(
    clinicId: string,
    membershipId: string,
  ) {
    const membership = await this.clinicMembershipRepository.findOne({
      where: { id: membershipId, clinicId, isActive: true },
      select: { id: true },
    });

    if (!membership) {
      throw new BadRequestException(
        'Membership does not belong to the requested clinic',
      );
    }
  }
}
