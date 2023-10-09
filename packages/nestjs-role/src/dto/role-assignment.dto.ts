import { IsString, ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuditInterface, ReferenceIdInterface } from '@concepta/ts-core';
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
  id: string = '';

  /**
   * Role
   */
  @Expose()
  @ApiProperty({
    type: ReferenceIdDto,
    description: 'Role',
  })
  @Type(() => ReferenceIdDto)
  @ValidateNested()
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
  @ValidateNested()
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
  @ValidateNested()
  audit!: AuditInterface;
}
