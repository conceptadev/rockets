import { Exclude, Expose, Type } from 'class-transformer';
import { CrudResponsePaginatedDto } from '../../../src/dto/crud-response-paginated.dto';
import { PhotoDto } from './photo.dto';

@Exclude()
export class PhotoPaginatedDto extends CrudResponsePaginatedDto<PhotoDto> {
  @Expose()
  @Type(() => PhotoDto)
  data: PhotoDto[];
}
