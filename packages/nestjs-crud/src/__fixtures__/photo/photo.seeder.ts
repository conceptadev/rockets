import { Seeder } from '@jorgebodega/typeorm-seeding';
import { PhotoFactory } from './photo.factory';

export class PhotoSeeder extends Seeder {
  public async run(): Promise<void> {
    const photoFactory = new PhotoFactory();

    await photoFactory.createMany(15);
  }
}
