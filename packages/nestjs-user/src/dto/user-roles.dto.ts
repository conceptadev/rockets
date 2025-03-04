import {
  RoleOwnableInterface,
  UserRolesInterface,
} from '@concepta/nestjs-common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserRolesDto implements UserRolesInterface {
  @Expose()
  @ApiPropertyOptional({
    type: 'array',
    isArray: true,
    description: 'User roles',
  })
  userRoles?: RoleOwnableInterface[];
}
