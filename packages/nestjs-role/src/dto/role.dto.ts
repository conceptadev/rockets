import { IsOptional, IsString } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuditInterface, ReferenceId } from '@concepta/ts-core';
import { AuditDto } from '@concepta/nestjs-common';
import { CrudResponseDto } from '@concepta/nestjs-crud';
import { RoleInterface } from '../interfaces/role.interface';

/**
 * Role DTO
 */
@Exclude()
export class RoleDto
  extends CrudResponseDto<RoleInterface>
  implements RoleInterface
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
    description: 'Name of the role',
  })
  @IsString()
  name: string;

  /**
   * Name
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Description of the role',
  })
  @IsString()
  @IsOptional()
  description: string;

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
}
