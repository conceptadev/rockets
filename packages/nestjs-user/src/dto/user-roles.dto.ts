import { RoleOwnableInterface, UserRolesInterface } from '@concepta/nestjs-common';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserRolesDto implements UserRolesInterface {
  @Expose()
  @ApiProperty({
    type: 'array',
    description: 'User roles',
  })
  userRoles!: RoleOwnableInterface[];
}
