import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { Auth, GetUser } from '../auth/decorators';
import { User } from '../auth/entities/user.entity';
import { PaymentMethodsService } from './payment-methods.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Controller('payment-methods')
@Auth()
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  create(@GetUser() user: User, @Body() dto: CreatePaymentMethodDto) {
    return this.paymentMethodsService.create(user.id, dto);
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.paymentMethodsService.findAll(user.id);
  }

  @Get(':id')
  findOne(@GetUser() user: User, @Param('id') id: string) {
    return this.paymentMethodsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @GetUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdatePaymentMethodDto,
  ) {
    return this.paymentMethodsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@GetUser() user: User, @Param('id') id: string) {
    return this.paymentMethodsService.remove(user.id, id);
  }

  @Patch(':id/set-default')
  setDefault(@GetUser() user: User, @Param('id') id: string) {
    return this.paymentMethodsService.setDefault(user.id, id);
  }
}
