import { Seeder } from '@concepta/typeorm-seeding';
import { PhotoFixture } from './photo.entity.fixture';
import { PhotoFactoryFixture } from './photo.factory.fixture';

export class PhotoSeederFixture extends Seeder<{ photo: PhotoFixture }> {
  protected options = { factories: { photo: PhotoFactoryFixture } };

  public async run(): Promise<void> {
    await this.factory('photo').createMany(15);
  }
}
