import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CrudCreateManyDto } from '@concepta/nestjs-crud';
import { RoleCreatableInterface } from '@concepta/nestjs-common';
import { RoleCreateDto } from './role-create.dto';

/**
 * Role DTO
 */
@Exclude()
export class RoleCreateManyDto extends CrudCreateManyDto<RoleCreatableInterface> {
  @Expose()
  @ApiProperty({
    type: RoleCreateDto,
    isArray: true,
    description: 'Array of Roles to create',
  })
  @Type(() => RoleCreateDto)
  @IsArray()
  @ArrayNotEmpty()
  bulk: RoleCreateDto[] = [];
}
