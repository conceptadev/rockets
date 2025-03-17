import { PickType } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { PhotoUpdatableInterfaceFixture } from '../interfaces/photo-updatable.interface.fixture';
import { PhotoDtoFixture } from './photo.dto.fixture';

@Exclude()
export class PhotoUpdateDtoFixture
  extends PickType(PhotoDtoFixture, [
    'name',
    'description',
    'filename',
    'isPublished',
    'views',
  ] as const)
  implements PhotoUpdatableInterfaceFixture {}
