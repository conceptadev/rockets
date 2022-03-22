import { Exclude, Expose, Type } from 'class-transformer';
import { CrudCreateManyDto } from '@concepta/nestjs-crud';
import { UserCreatableInterface } from '../interfaces/user-creatable.interface';
import { UserCreateDto } from './user-create.dto';

/**
 * User DTO
 */
@Exclude()
export class UserCreateManyDto extends CrudCreateManyDto<UserCreatableInterface> {
  @Expose()
  @Type(() => UserCreateDto)
  bulk: UserCreateDto[];
}
