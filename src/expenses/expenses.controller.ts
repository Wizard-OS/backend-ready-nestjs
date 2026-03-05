import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { AuthClinic, GetClinicId } from '../auth/decorators';

@Controller('expenses')
@AuthClinic()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(
    @GetClinicId() clinicId: string,
    @Body() createExpenseDto: CreateExpenseDto,
  ) {
    return this.expensesService.create(clinicId, createExpenseDto);
  }

  @Get()
  findAll(@GetClinicId() clinicId: string) {
    return this.expensesService.findAll(clinicId);
  }

  @Get('totals')
  totals(
    @GetClinicId() clinicId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.expensesService.getTotals(clinicId, from, to);
  }

  @Get(':id')
  findOne(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.expensesService.findOne(clinicId, id);
  }

  @Patch(':id')
  update(
    @GetClinicId() clinicId: string,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    return this.expensesService.update(clinicId, id, updateExpenseDto);
  }

  @Delete(':id')
  remove(@GetClinicId() clinicId: string, @Param('id') id: string) {
    return this.expensesService.remove(clinicId, id);
  }
}
