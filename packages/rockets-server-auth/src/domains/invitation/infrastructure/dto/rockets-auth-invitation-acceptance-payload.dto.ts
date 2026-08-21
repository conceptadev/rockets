import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MinLength } from 'class-validator';

import { InvitationAcceptanceDataInterface } from '../../interfaces/invitation-acceptance-data.interface';

/**
  Runtime-validated shape for the public invitation-acceptance payload.
  Replaces the previous `as InvitationAcceptanceDataInterface` cast so
  `password` / `userMetadata` are whitelist-checked at the listener boundary.
  Nested `userMetadata` shape is further validated by the configured
  update DTO inside the listener when present.
 */
export class RocketsAuthInvitationAcceptancePayloadDto
  implements InvitationAcceptanceDataInterface
{
  [key: string]: unknown;

  @ApiPropertyOptional({
    description: 'Password to set on the invited user account',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @ApiPropertyOptional({
    description: 'Optional profile metadata applied on acceptance',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  userMetadata?: Record<string, unknown>;
}
