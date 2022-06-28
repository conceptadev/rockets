import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CrudCreateManyDto } from '@concepta/nestjs-crud';
import { RoleAssignmentCreatableInterface } from '@concepta/ts-common';
import { RoleAssignmentCreateDto } from './role-assignment-create.dto';

/**
 * Role assignment create many DTO
 */
@Exclude()
export class RoleAssignmentCreateManyDto extends CrudCreateManyDto<RoleAssignmentCreatableInterface> {
  @Expose()
  @ApiProperty({
    type: RoleAssignmentCreateDto,
    isArray: true,
    description: 'Array of Roles Assignments to create',
  })
  @Type(() => RoleAssignmentCreateDto)
  @IsArray()
  @ArrayNotEmpty()
  bulk: RoleAssignmentCreatableInterface[] = [];
}
