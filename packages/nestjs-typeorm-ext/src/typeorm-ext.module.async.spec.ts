import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmExtModule } from './typeorm-ext.module';

import { PhotoModuleFixture } from './__fixtures__/photo/photo.module.fixture';
import { PhotoEntityInterfaceFixture } from './__fixtures__/photo/interfaces/photo-entity.interface.fixture';
import { PhotoRepositoryFixture } from './__fixtures__/photo/photo.repository.fixture';
import { PhotoEntityFixture } from './__fixtures__/photo/photo.entity.fixture';

describe('AppModule', () => {
  let photoModule: PhotoModuleFixture;
  let photoEntityRepo: Repository<PhotoEntityInterfaceFixture>;
  let photoCustomRepo: PhotoRepositoryFixture;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.registerAsync({
          useFactory: async () => ({
            type: 'postgres',
            entities: [PhotoEntityFixture],
          }),
          testMode: true,
        }),
        PhotoModuleFixture.register(),
      ],
    }).compile();

    photoModule = testModule.get<PhotoModuleFixture>(PhotoModuleFixture);
    photoEntityRepo = testModule.get<Repository<PhotoEntityInterfaceFixture>>(
      'PHOTO_MODULE_ENTITY_REPO_TOKEN',
    );
    photoCustomRepo = testModule.get<PhotoRepositoryFixture>(
      'PHOTO_MODULE_CUSTOM_REPO_TOKEN',
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(photoModule).toBeInstanceOf(PhotoModuleFixture);
      expect(photoEntityRepo).toBeInstanceOf(Repository);
      expect(photoCustomRepo).toBeInstanceOf(PhotoRepositoryFixture);
    });
  });
});
