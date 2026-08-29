import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Gender } from '../../common/interfaces/gender.enum';

export class CreatePatientDto {
  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description:
      'UUID de la clínica. Opcional/deprecado en endpoints con x-clinic-id.',
  })
  @IsUUID()
  @IsOptional()
  clinicId?: string;

  @ApiPropertyOptional({
    example: 'paciente@email.com',
    description: 'Email del paciente',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'María', description: 'Nombre del paciente' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'López', description: 'Apellido del paciente' })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    example: 'UY-12345678',
    description: 'Documento o identificación del paciente',
  })
  @IsString()
  @MaxLength(80)
  @IsOptional()
  documentId?: string;

  @ApiProperty({
    example: '1990-05-15',
    description: 'Fecha de nacimiento (ISO 8601)',
  })
  @IsDateString()
  birthDate: Date;

  @ApiProperty({
    enum: Gender,
    example: Gender.FEMALE,
    description: 'Género del paciente',
  })
  @IsEnum(Gender, {
    message: 'gender must be a valid enum value',
  })
  gender: Gender;

  @ApiPropertyOptional({
    example: 'Av. Principal 123',
    description: 'Dirección',
  })
  @IsString()
  @IsOptional()
  address: string;

  @ApiPropertyOptional({
    example: 'Arquitecto',
    description: 'Profesión del paciente',
  })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  profession?: string;

  @ApiPropertyOptional({
    example: 'Av. Principal',
    description: 'Calle de la dirección del paciente',
  })
  @IsString()
  @MaxLength(180)
  @IsOptional()
  streetAddress?: string;

  @ApiPropertyOptional({
    example: '1234',
    description: 'Número de puerta o domicilio',
  })
  @IsString()
  @MaxLength(40)
  @IsOptional()
  addressNumber?: string;

  @ApiPropertyOptional({
    example: 'Pocitos',
    description: 'Barrio del paciente',
  })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  neighborhood?: string;

  @ApiPropertyOptional({
    example: 'Montevideo',
    description: 'Localidad o ciudad del paciente',
  })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    example: '11300',
    description: 'Código postal del paciente',
  })
  @IsString()
  @MaxLength(40)
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({
    example: '+5491112345678',
    description: 'Teléfono',
  })
  @IsString()
  @IsOptional()
  phone: string;

  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description:
      'UUID del archivo usado como foto de perfil. Se administra con el endpoint de foto.',
  })
  @IsUUID()
  @IsOptional()
  profilePhotoFileId?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/uploads/patient-files/foto.jpg',
    description:
      'URL de la foto de perfil. Se administra con el endpoint de foto.',
  })
  @IsString()
  @IsOptional()
  profilePhotoUrl?: string;

  @ApiPropertyOptional({
    example: 'Laura López +59891111111',
    description: 'Contacto de emergencia',
  })
  @IsString()
  @IsOptional()
  emergencyContact?: string;

  @ApiPropertyOptional({
    example: 'Prefiere turnos por la mañana',
    description: 'Observaciones generales',
  })
  @IsString()
  @IsOptional()
  observations?: string;

  @ApiPropertyOptional({
    example: 'Hipertensión controlada',
    description: 'Antecedentes médicos básicos',
  })
  @IsString()
  @IsOptional()
  medicalHistory?: string;

  @ApiPropertyOptional({
    example: 'Bruxismo nocturno',
    description: 'Antecedentes odontológicos básicos',
  })
  @IsString()
  @IsOptional()
  dentalHistory?: string;
}
