import { Exclude, Expose, Type } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ReferenceIdInterface } from '@concepta/nestjs-common';
import { OrgInterface } from '@concepta/nestjs-common';
import { CommonEntityDto, ReferenceIdDto } from '@concepta/nestjs-common';

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
   * Owner
   */
  @Expose()
  @ApiProperty({
    type: ReferenceIdDto,
    description: 'The owner of the org',
  })
  @Type(() => ReferenceIdDto)
  @ValidateNested()
  owner: ReferenceIdInterface = { id: '' };
}
