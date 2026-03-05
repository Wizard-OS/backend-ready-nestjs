import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

import { ExpenseCategory } from '../interfaces/expense-category.enum';

export class CreateExpenseDto {
  @IsUUID()
  clinicId: string;

  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @Matches(/^\d+(\.\d{1,2})?$/)
  amount: string;

  @IsDateString()
  spentAt: Date;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  recordedByMembershipId?: string;
}
