import { Seeder } from '@jorgebodega/typeorm-seeding';
import { PhotoFactoryFixture } from './photo.factory.fixture';

export class PhotoSeederFixture extends Seeder {
  public async run(): Promise<void> {
    const photoFactory = new PhotoFactoryFixture();

    await photoFactory.createMany(15);
  }
}
