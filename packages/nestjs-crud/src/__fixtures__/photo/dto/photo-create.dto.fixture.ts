import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { PhotoDtoFixture } from './photo.dto.fixture';

@Exclude()
export class PhotoCreateDtoFixture extends PickType(PhotoDtoFixture, [
  'name',
  'description',
  'filename',
  'isPublished',
]) {}
