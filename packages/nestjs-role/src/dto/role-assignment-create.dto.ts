import { Exclude } from 'class-transformer';
import { PickType } from '@nestjs/swagger';
import { RoleAssignmentDto } from './role-assignment.dto';
import { RoleAssignmentCreatableInterface } from '../interfaces/role-assignment-creatable.interface';

/**
 * Role Assignment Create DTO
 */
@Exclude()
export class RoleAssignmentCreateDto
  extends PickType(RoleAssignmentDto, ['role', 'assignee'] as const)
  implements RoleAssignmentCreatableInterface {}
