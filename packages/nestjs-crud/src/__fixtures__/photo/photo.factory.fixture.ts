import Faker from '@faker-js/faker';
import { Factory } from '@concepta/typeorm-seeding';
import { PhotoFixture } from './photo.entity.fixture';

export class PhotoFactoryFixture extends Factory<PhotoFixture> {
  protected options = { entity: PhotoFixture };

  protected async entity(photo: PhotoFixture): Promise<PhotoFixture> {
    photo.id = Faker.datatype.uuid();
    photo.filename = Faker.random.word() + '.jpg';
    photo.name = Faker.random.word();
    photo.description = Faker.random.words();
    photo.isPublished = Faker.datatype.boolean();
    photo.views = 0;

    return photo;
  }
}
