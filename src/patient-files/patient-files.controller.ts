import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';
import type { Request } from 'express';
import type { Express } from 'express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { PatientFilesService } from './patient-files.service';
import { CreatePatientFileDto } from './dto/create-patient-file.dto';
import {
  AuthClinic,
  ClinicRoles,
  GetClinicId,
  GetClinicMembershipId,
  GetClinicMembershipRole,
  GetClinicPermissions,
} from '../auth/decorators';
import { ClinicMembershipRole } from '../clinic-memberships/interfaces/clinic-membership-role.enum';
import { ClinicAccessContext } from '../patients/services/patient-access.service';

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
]);

@ApiTags('Patient Files')
@ApiBearerAuth()
@ApiSecurity('x-clinic-id')
@Controller()
@AuthClinic()
@ClinicRoles(
  ClinicMembershipRole.owner,
  ClinicMembershipRole.admin,
  ClinicMembershipRole.odontologist,
  ClinicMembershipRole.specialist,
  ClinicMembershipRole.receptionist,
  ClinicMembershipRole.assistant,
)
export class PatientFilesController {
  constructor(private readonly patientFilesService: PatientFilesService) {}

  @Post('patients/:patientId/files')
  @ApiOperation({ summary: 'Adjuntar archivo a paciente' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'patientId', description: 'UUID del paciente' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        type: { type: 'string' },
        description: { type: 'string' },
        appointmentId: { type: 'string' },
        clinicalNoteId: { type: 'string' },
        treatmentId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Archivo adjuntado' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = path.join(
            process.cwd(),
            'uploads',
            'patient-files',
          );
          fs.mkdirSync(uploadDir, { recursive: true });
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const ext = extname(file.originalname) || '';
          cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype.startsWith('image/') ||
          ALLOWED_MIME_TYPES.has(file.mimetype)
        ) {
          return cb(null, true);
        }

        return cb(new BadRequestException('File type is not allowed'), false);
      },
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  create(
    @GetClinicId() clinicId: string,
    @GetClinicMembershipId() membershipId: string,
    @GetClinicMembershipRole() role: ClinicMembershipRole,
    @GetClinicPermissions() permissionsJson: Record<string, boolean>,
    @Param('patientId') patientId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreatePatientFileDto,
    @Req() request: Request,
  ) {
    const baseUrl = `${request.protocol}://${request.get('host')}`;
    return this.patientFilesService.create(
      this.context(clinicId, membershipId, role, permissionsJson),
      patientId,
      membershipId,
      file,
      baseUrl,
      dto,
    );
  }

  @Get('patients/:patientId/files')
  @ApiOperation({ summary: 'Listar archivos del paciente' })
  @ApiParam({ name: 'patientId', description: 'UUID del paciente' })
  @ApiResponse({ status: 200, description: 'Archivos del paciente' })
  findAllByPatient(
    @GetClinicId() clinicId: string,
    @GetClinicMembershipId() membershipId: string,
    @GetClinicMembershipRole() role: ClinicMembershipRole,
    @GetClinicPermissions() permissionsJson: Record<string, boolean>,
    @Param('patientId') patientId: string,
  ) {
    return this.patientFilesService.findAllByPatient(
      this.context(clinicId, membershipId, role, permissionsJson),
      patientId,
    );
  }

  @Get('patient-files/:id')
  @ApiOperation({ summary: 'Obtener archivo de paciente por ID' })
  @ApiParam({ name: 'id', description: 'UUID del archivo' })
  @ApiResponse({ status: 200, description: 'Archivo encontrado' })
  findOne(
    @GetClinicId() clinicId: string,
    @GetClinicMembershipId() membershipId: string,
    @GetClinicMembershipRole() role: ClinicMembershipRole,
    @GetClinicPermissions() permissionsJson: Record<string, boolean>,
    @Param('id') id: string,
  ) {
    return this.patientFilesService.findOne(
      this.context(clinicId, membershipId, role, permissionsJson),
      id,
    );
  }

  @Delete('patient-files/:id')
  @ApiOperation({ summary: 'Eliminar archivo de paciente' })
  @ApiParam({ name: 'id', description: 'UUID del archivo' })
  @ApiResponse({ status: 200, description: 'Archivo eliminado' })
  remove(
    @GetClinicId() clinicId: string,
    @GetClinicMembershipId() membershipId: string,
    @GetClinicMembershipRole() role: ClinicMembershipRole,
    @GetClinicPermissions() permissionsJson: Record<string, boolean>,
    @Param('id') id: string,
  ) {
    return this.patientFilesService.remove(
      this.context(clinicId, membershipId, role, permissionsJson),
      id,
    );
  }

  private context(
    clinicId: string,
    membershipId: string,
    role: ClinicMembershipRole,
    permissionsJson: Record<string, boolean> | undefined,
  ): ClinicAccessContext {
    return { clinicId, membershipId, role, permissionsJson };
  }
}
