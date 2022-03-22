import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CrudCreateManyDto } from '../../../dto/crud-create-many.dto';
import { PhotoCreateDto } from './photo-create.dto';
import { PhotoDto } from './photo.dto';

@Exclude()
export class PhotoCreateManyDto extends CrudCreateManyDto<PhotoCreateDto> {
  @ApiProperty({ type: [PhotoDto] })
  @Expose()
  @Type(() => PhotoCreateDto)
  bulk: PhotoCreateDto[];
}
