import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  invoiceId: string;

  @Matches(/^\d+(\.\d{1,2})?$/)
  amount: string;

  @IsString()
  method: string;

  @IsDateString()
  paidAt: Date;

  @IsString()
  @IsOptional()
  reference?: string;

  @IsUUID()
  @IsOptional()
  receivedByMembershipId?: string;
}
