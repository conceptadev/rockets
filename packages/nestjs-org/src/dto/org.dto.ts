import { Exclude, Expose, Type } from 'class-transformer';
import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { AuditDto, ReferenceIdDto } from '@concepta/nestjs-common';
import { CrudResponseDto } from '@concepta/nestjs-crud';
import { OrgInterface } from '../interfaces/org.interface';

/**
 * Org DTO
 */
@Exclude()
export class OrgDto
  extends CrudResponseDto<OrgInterface>
  implements OrgInterface
{
  /**
   * Unique id
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Unique identifier',
  })
  @IsString()
  id: ReferenceId = '';

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
   * Audit
   */
  @Expose({ toPlainOnly: true })
  @ApiProperty({
    type: AuditDto,
    description: 'Audit data',
  })
  @Type(() => AuditDto)
  audit: AuditInterface = new AuditDto();

  /**
   * Active
   */
  @Expose()
  @ApiProperty({
    type: 'boolean',
    description: 'True if Org is active',
  })
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
  owner: ReferenceIdInterface = { id: '' };
}
