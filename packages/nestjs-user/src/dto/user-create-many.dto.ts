import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserCreatableInterface } from '@concepta/ts-common';
import { CrudCreateManyDto } from '@concepta/nestjs-crud';
import { UserCreateDto } from './user-create.dto';

/**
 * User DTO
 */
@Exclude()
export class UserCreateManyDto extends CrudCreateManyDto<UserCreatableInterface> {
  @Expose()
  @ApiProperty({
    type: UserCreateDto,
    isArray: true,
    description: 'Array of Users to create',
  })
  @Type(() => UserCreateDto)
  @IsArray()
  @ArrayNotEmpty()
  bulk: UserCreateDto[] = [];
}
