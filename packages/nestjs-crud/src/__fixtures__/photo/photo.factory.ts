import Faker from '@faker-js/faker';
import { Factory } from '@jorgebodega/typeorm-seeding';
import { Photo } from './photo.entity';

export class PhotoFactory extends Factory<Photo> {
  protected async definition(): Promise<Photo> {
    const photo = new Photo();

    photo.id = Faker.datatype.number();
    photo.filename = Faker.random.word() + '.jpg';
    photo.name = Faker.random.word();
    photo.description = Faker.random.words();
    photo.isPublished = Faker.datatype.boolean();
    photo.views = 0;

    return photo;
  }
}
