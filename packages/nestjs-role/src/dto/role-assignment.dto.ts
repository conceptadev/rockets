import { IsString } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  AuditInterface,
  ReferenceId,
  ReferenceIdInterface,
} from '@concepta/ts-core';
import { RoleAssignmentInterface } from '@concepta/ts-common';
import { AuditDto, ReferenceIdDto } from '@concepta/nestjs-common';

/**
 * Role assignment DTO
 */
@Exclude()
export class RoleAssignmentDto implements RoleAssignmentInterface {
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
   * Role
   */
  @Expose()
  @ApiProperty({
    type: ReferenceIdDto,
    description: 'Role',
  })
  @Type(() => ReferenceIdDto)
  role: ReferenceIdInterface = new ReferenceIdDto();

  /**
   * Assignee
   */
  @Expose()
  @ApiProperty({
    type: ReferenceIdDto,
    description: 'Assignee',
  })
  @Type(() => ReferenceIdDto)
  assignee: ReferenceIdInterface = new ReferenceIdDto();

  /**
   * Audit
   */
  @Expose({ toPlainOnly: true })
  @ApiProperty({
    type: AuditDto,
    description: 'Audit data',
  })
  @Type(() => AuditDto)
  audit!: AuditInterface;
}
