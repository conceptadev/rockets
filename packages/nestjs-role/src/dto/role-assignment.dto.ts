import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { RoleAssignmentInterface } from '@concepta/nestjs-common';
import { CommonEntityDto } from '@concepta/nestjs-common';
import { ReferenceId } from '@concepta/nestjs-common';

/**
 * Role assignment DTO
 */
@Exclude()
export class RoleAssignmentDto
  extends CommonEntityDto
  implements RoleAssignmentInterface
{
  /**
   * Role ID
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Role ID',
  })
  roleId!: ReferenceId;

  /**
   * Assignee ID
   */
  @Expose()
  @ApiProperty({
    type: 'string',
    description: 'Assignee ID',
  })
  assigneeId!: ReferenceId;
}
