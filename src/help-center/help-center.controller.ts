import { Body, Controller, Get, Post } from '@nestjs/common';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { HelpCenterService } from './help-center.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';

@Controller('help-center')
export class HelpCenterController {
  constructor(private readonly helpCenterService: HelpCenterService) {}

  @Get('faqs')
  getFaqs() {
    return this.helpCenterService.getFaqs();
  }

  @Get('contact')
  getContactInfo() {
    return this.helpCenterService.getContactInfo();
  }

  @Post('support-request')
  @Auth()
  createSupportRequest(
    @GetUser() user: User,
    @Body() dto: CreateSupportRequestDto,
  ) {
    return this.helpCenterService.createSupportRequest(user.id, dto);
  }

  @Get('support-requests')
  @Auth()
  getUserSupportRequests(@GetUser() user: User) {
    return this.helpCenterService.getUserSupportRequests(user.id);
  }
}
