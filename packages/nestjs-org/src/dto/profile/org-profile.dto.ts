import { Exclude, Expose, Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrgInterface, OrgProfileInterface } from '@concepta/nestjs-common';
import { CommonEntityDto } from '@concepta/nestjs-common';
import { OrgDto } from '../org.dto';

/**
 * Org DTO
 */
@Exclude()
export class OrgProfileDto
  extends CommonEntityDto
  implements OrgProfileInterface
{
  /**
   * Active
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'The org id of this profile',
  })
  @IsString()
  orgId!: string;

  /**
   * Owner
   */
  @Expose()
  @ApiPropertyOptional({
    type: OrgDto,
    description: 'The org of this profile',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrgDto)
  org?: OrgInterface;
}
