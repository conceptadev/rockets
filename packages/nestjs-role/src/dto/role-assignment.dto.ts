import { ValidateNested } from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ReferenceIdInterface } from '@concepta/ts-core';
import { RoleAssignmentInterface } from '@concepta/ts-common';
import { CommonEntityDto, ReferenceIdDto } from '@concepta/nestjs-common';

/**
 * Role assignment DTO
 */
@Exclude()
export class RoleAssignmentDto
  extends CommonEntityDto
  implements RoleAssignmentInterface
{
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
}
