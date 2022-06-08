import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';
import { UserInterface } from '../interfaces/user.interface';
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
