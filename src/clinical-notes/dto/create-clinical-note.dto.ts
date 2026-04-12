import { IsString, IsUUID, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClinicalNoteDto {
  @ApiProperty({ description: 'UUID del registro clínico' })
  @IsUUID()
  clinicalRecordId: string;

  @ApiProperty({
    example: 'Se realizó limpieza dental profunda',
    description: 'Contenido de la nota clínica',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  content: string;
}
