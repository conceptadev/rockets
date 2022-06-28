import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UserInterface } from '@concepta/ts-common';
import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';
import { UserDto } from './user.dto';

/**
 * User paginated DTO
 */
@Exclude()
export class UserPaginatedDto extends CrudResponsePaginatedDto<UserInterface> {
  @Expose()
  @ApiProperty({
    type: UserDto,
    isArray: true,
    description: 'Array of Users',
  })
  @Type(() => UserDto)
  data: UserDto[] = [];
}
