import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository, FindOptionsWhere } from 'typeorm';

import { UserSession } from './entities/user-session.entity';

@Injectable()
export class UserSessionsService {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionRepository: Repository<UserSession>,
  ) {}

  async createSession(
    userId: string,
    metadata: { deviceName?: string; ipAddress?: string; userAgent?: string },
  ): Promise<UserSession> {
    const session = this.sessionRepository.create({
      userId,
      ...metadata,
    });
    return await this.sessionRepository.save(session);
  }

  async getActiveSessions(userId: string): Promise<UserSession[]> {
    return await this.sessionRepository.find({
      where: { userId, isRevoked: false },
      order: { lastActiveAt: 'DESC' },
    });
  }

  async revokeSession(userId: string, sessionId: string): Promise<{ message: string }> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    session.isRevoked = true;
    await this.sessionRepository.save(session);

    return { message: 'Session revoked successfully' };
  }

  async revokeAllOtherSessions(
    userId: string,
    currentSessionId?: string,
  ): Promise<{ message: string }> {
    const where: FindOptionsWhere<UserSession> = { userId, isRevoked: false };
    if (currentSessionId) {
      where.id = Not(currentSessionId);
    }

    await this.sessionRepository.update(where, { isRevoked: true });

    return { message: 'All other sessions revoked successfully' };
  }

  async updateLastActive(sessionId: string): Promise<void> {
    await this.sessionRepository.update(sessionId, {
      lastActiveAt: new Date(),
    });
  }
}


