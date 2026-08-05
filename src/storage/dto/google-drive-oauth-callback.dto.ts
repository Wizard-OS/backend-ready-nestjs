import { IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleDriveOAuthCallbackDto {
  @ApiProperty({ description: 'Authorization code returned by Google OAuth' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Redirect URI used to generate the OAuth URL',
    example: 'https://app.dentalhub.example/integrations/google-drive/callback',
  })
  @IsUrl({ require_tld: false })
  redirectUri: string;
}
