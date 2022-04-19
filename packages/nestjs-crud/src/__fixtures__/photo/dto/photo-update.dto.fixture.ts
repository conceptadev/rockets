import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { PhotoDtoFixture } from './photo.dto.fixture';

@Exclude()
export class PhotoUpdateDtoFixture extends PickType(PhotoDtoFixture, [
  'name',
  'description',
  'filename',
  'isPublished',
  'views',
]) {}
