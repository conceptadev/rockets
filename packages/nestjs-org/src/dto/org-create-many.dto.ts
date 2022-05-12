import { Exclude, Expose, Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CrudCreateManyDto } from '@concepta/nestjs-crud';
import { OrgCreatableInterface } from '../interfaces/org-creatable.interface';
import { OrgCreateDto } from './org-create.dto';

/**
 * Org DTO
 */
@Exclude()
export class OrgCreateManyDto extends CrudCreateManyDto<OrgCreatableInterface> {
  @Expose()
  @ApiProperty({
    type: OrgCreateDto,
    isArray: true,
    description: 'Array of Orgs to create',
  })
  @Type(() => OrgCreateDto)
  @IsArray()
  @ArrayNotEmpty()
  bulk: OrgCreateDto[];
}
