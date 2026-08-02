import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

import { OdontogramService } from './odontogram.service';
import { UpdateOdontogramToothDto } from './dto/update-odontogram-tooth.dto';
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

@ApiTags('Odontogram')
@ApiBearerAuth()
@ApiSecurity('x-clinic-id')
@Controller('patients/:patientId/odontogram')
@AuthClinic()
@ClinicRoles(
  ClinicMembershipRole.owner,
  ClinicMembershipRole.admin,
  ClinicMembershipRole.odontologist,
)
export class OdontogramController {
  constructor(private readonly odontogramService: OdontogramService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener odontograma actual del paciente' })
  @ApiParam({ name: 'patientId', description: 'UUID del paciente' })
  @ApiResponse({ status: 200, description: 'Odontograma del paciente' })
  findByPatient(
    @GetClinicId() clinicId: string,
    @GetClinicMembershipId() membershipId: string,
    @GetClinicMembershipRole() role: ClinicMembershipRole,
    @GetClinicPermissions() permissionsJson: Record<string, boolean>,
    @Param('patientId') patientId: string,
  ) {
    return this.odontogramService.findByPatient(
      this.context(clinicId, membershipId, role, permissionsJson),
      patientId,
    );
  }

  @Patch('teeth/:toothCode')
  @ApiOperation({ summary: 'Actualizar estado de una pieza dental' })
  @ApiParam({ name: 'patientId', description: 'UUID del paciente' })
  @ApiParam({ name: 'toothCode', description: 'Código FDI de pieza dental' })
  @ApiResponse({ status: 200, description: 'Pieza actualizada' })
  updateTooth(
    @GetClinicId() clinicId: string,
    @GetClinicMembershipId() membershipId: string,
    @GetClinicMembershipRole() role: ClinicMembershipRole,
    @GetClinicPermissions() permissionsJson: Record<string, boolean>,
    @Param('patientId') patientId: string,
    @Param('toothCode') toothCode: string,
    @Body() dto: UpdateOdontogramToothDto,
  ) {
    return this.odontogramService.updateTooth(
      this.context(clinicId, membershipId, role, permissionsJson),
      patientId,
      toothCode,
      membershipId,
      dto,
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
