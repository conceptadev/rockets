import { Exclude, Expose, Type } from 'class-transformer';
import { CrudResponseManyDto } from '@rockts-org/nestjs-crud';
import { UserInterface } from '../interfaces/user.interface';
import { UserDto } from './user.dto';

/**
 * User DTO
 */
@Exclude()
export class UserManyDto extends CrudResponseManyDto<UserInterface> {
  @Expose()
  @Type(() => UserDto)
  data: UserDto[];
}
