import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';
import { RoleAssignmentInterface } from '../interfaces/role-assignment.interface';
import { RoleAssignmentDto } from './role-assignment.dto';

/**
 * Role assignment paginated DTO
 */
@Exclude()
export class RoleAssignmentPaginatedDto extends CrudResponsePaginatedDto<RoleAssignmentInterface> {
  @Expose()
  @ApiProperty({
    type: RoleAssignmentDto,
    isArray: true,
    description: 'Array of Role Assignments',
  })
  @Type(() => RoleAssignmentDto)
  data: RoleAssignmentInterface[] = [];
}
