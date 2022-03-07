import { Exclude, Expose, Type } from 'class-transformer';
import { CrudResponseManyDto } from '../../../src/dto/crud-response-many.dto';
import { PhotoDto } from './photo.dto';

@Exclude()
export class PhotoManyDto extends CrudResponseManyDto<PhotoDto> {
  @Expose()
  @Type(() => PhotoDto)
  data: PhotoDto[];
}
