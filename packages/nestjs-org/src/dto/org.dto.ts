import { IsOptional, IsString } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { AuditDto } from '@concepta/nestjs-common';
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
  id: ReferenceId;

  /**
   * Name
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Name of the org',
  })
  @IsString()
  name: string;

  /**
   * Audit
   */
  @Expose({ toPlainOnly: true })
  @ApiProperty({
    type: AuditDto,
    description: 'Audit data',
  })
  @Type(() => AuditDto)
  audit?: AuditInterface;

  /**
   * Active
   */
  @Expose()
  @ApiProperty({
    type: 'boolean',
    description: 'True if Org is active',
  })
  active: boolean;

  /**
   * ownerUserId
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'userId of owner of the org',
  })
  @IsString()
  @IsOptional()
  ownerUserId?: string;
}
