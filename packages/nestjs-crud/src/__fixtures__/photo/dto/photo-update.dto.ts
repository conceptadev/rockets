import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { PhotoDto } from './photo.dto';

@Exclude()
export class PhotoUpdateDto extends PickType(PhotoDto, [
  'name',
  'description',
  'filename',
  'isPublished',
  'views',
]) {}
