import { Controller, Delete, Get, Param } from '@nestjs/common';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { UserSessionsService } from './user-sessions.service';

@Controller('user-sessions')
@Auth()
export class UserSessionsController {
  constructor(private readonly userSessionsService: UserSessionsService) {}

  @Get()
  getActiveSessions(@GetUser() user: User) {
    return this.userSessionsService.getActiveSessions(user.id);
  }

  @Delete(':id')
  revokeSession(@GetUser() user: User, @Param('id') sessionId: string) {
    return this.userSessionsService.revokeSession(user.id, sessionId);
  }

  @Delete()
  revokeAllOtherSessions(@GetUser() user: User) {
    return this.userSessionsService.revokeAllOtherSessions(user.id);
  }
}
