import { Body, Controller, Get, Patch } from '@nestjs/common';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { NotificationPreferencesService } from './notification-preferences.service';
import { UpdateNotificationPreferencesDto } from './dto/update-notification-preferences.dto';

@Controller('notification-preferences')
@Auth()
export class NotificationPreferencesController {
  constructor(
    private readonly notificationPreferencesService: NotificationPreferencesService,
  ) {}

  @Get()
  getPreferences(@GetUser() user: User) {
    return this.notificationPreferencesService.getByUser(user.id);
  }

  @Patch()
  updatePreferences(
    @GetUser() user: User,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.notificationPreferencesService.update(user.id, dto);
  }
}
