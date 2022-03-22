import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { CrudResponsePaginatedDto } from '../../../dto/crud-response-paginated.dto';
import { PhotoDto } from './photo.dto';

@Exclude()
export class PhotoPaginatedDto extends CrudResponsePaginatedDto<PhotoDto> {
  @ApiProperty({ type: [PhotoDto] })
  @Expose()
  @Type(() => PhotoDto)
  data: PhotoDto[];
}
