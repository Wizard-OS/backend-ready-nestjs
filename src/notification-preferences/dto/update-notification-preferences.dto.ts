import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Notificaciones por email',
  })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Notificaciones por SMS',
  })
  @IsOptional()
  @IsBoolean()
  smsNotifications?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Notificaciones push' })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Recordatorios de citas' })
  @IsOptional()
  @IsBoolean()
  appointmentReminders?: boolean;

  @ApiPropertyOptional({ example: false, description: 'Emails de marketing' })
  @IsOptional()
  @IsBoolean()
  marketingEmails?: boolean;

  @ApiPropertyOptional({
    example: true,
    description: 'Actualizaciones de tratamiento',
  })
  @IsOptional()
  @IsBoolean()
  treatmentUpdates?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Alertas de facturación' })
  @IsOptional()
  @IsBoolean()
  billingAlerts?: boolean;
}
