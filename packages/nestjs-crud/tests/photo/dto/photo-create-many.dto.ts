import { Exclude, Expose, Type } from 'class-transformer';
import { CrudCreateManyDto } from '../../../src/dto/crud-create-many.dto';
import { PhotoCreateDto } from './photo-create.dto';

@Exclude()
export class PhotoCreateManyDto extends CrudCreateManyDto<PhotoCreateDto> {
  @Expose()
  @Type(() => PhotoCreateDto)
  bulk: PhotoCreateDto[];
}
