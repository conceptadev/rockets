import { Exclude, Expose, Type } from 'class-transformer';
import { CrudResponsePaginatedDto } from '@concepta/nestjs-crud';
import { UserInterface } from '../interfaces/user.interface';
import { UserDto } from './user.dto';

/**
 * User paginated DTO
 */
@Exclude()
export class UserPaginatedDto extends CrudResponsePaginatedDto<UserInterface> {
  @Expose()
  @Type(() => UserDto)
  data: UserDto[];
}
