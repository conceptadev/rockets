import { Seeder } from '@jorgebodega/typeorm-seeding';
import { PhotoFactory } from './photo.factory';

export class PhotoSeeder extends Seeder {
  public async run(): Promise<void> {
    const photoFactory = new PhotoFactory();

    let nextId = 1;

    await photoFactory
      .map((photo) => {
        photo.id = nextId++;
      })
      .createMany(15);
  }
}
