import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  OrgProfileInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';
import { OrgInterface } from '@concepta/nestjs-common';
import { CommonEntityDto, ReferenceIdDto } from '@concepta/nestjs-common';
import { OrgProfileDto } from './profile/org-profile.dto';

/**
 * Org DTO
 */
@Exclude()
export class OrgDto extends CommonEntityDto implements OrgInterface {
  /**
   * Name
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Name of the org',
  })
  @IsString()
  name = '';

  /**
   * Active
   */
  @Expose()
  @ApiProperty({
    type: 'boolean',
    description: 'True if Org is active',
  })
  @IsBoolean()
  @IsOptional()
  active = true;

  /**
   * Owner ID
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'The org owner ID',
  })
  @IsUUID()
  ownerId!: string;

  /**
   * Owner
   */
  @Expose()
  @ApiPropertyOptional({
    type: ReferenceIdDto,
    description: 'The owner of the org',
  })
  @Type(() => ReferenceIdDto)
  @IsOptional()
  @ValidateNested()
  owner?: ReferenceIdInterface;

  /**
   * Org Profile
   */
  @Expose()
  @ApiPropertyOptional({
    type: OrgProfileDto,
    description: 'The org profile',
  })
  @Type(() => OrgProfileDto)
  @IsOptional()
  @ValidateNested()
  orgProfile?: OrgProfileInterface;
}
