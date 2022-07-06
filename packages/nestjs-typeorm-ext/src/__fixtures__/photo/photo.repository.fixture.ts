import { DataSource, Repository } from 'typeorm';
import { PhotoEntityFixture } from './photo.entity.fixture';

interface CustomFixtureMethods {
  customMethod(): null;
}
export interface PhotoRepositoryFixtureInterface
  extends Repository<PhotoEntityFixture>,
    CustomFixtureMethods {}

export const createPhotoRepositoryFixture = (
  dataSource: DataSource,
): PhotoRepositoryFixtureInterface => {
  return dataSource
    .getRepository(PhotoEntityFixture)
    .extend<CustomFixtureMethods>({
      customMethod(): null {
        return null;
      },
    });
};
