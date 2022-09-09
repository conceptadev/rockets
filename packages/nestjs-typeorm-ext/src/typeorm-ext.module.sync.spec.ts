import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmExtModule } from './typeorm-ext.module';
import { getEntityRepositoryToken } from './utils/get-entity-repository-token';
import { getDynamicRepositoryToken } from './utils/get-dynamic-repository-token';

import { PhotoModuleFixture } from './__fixtures__/photo/photo.module.fixture';
import { PhotoEntityInterfaceFixture } from './__fixtures__/photo/interfaces/photo-entity.interface.fixture';
import { PhotoRepositoryFixtureInterface } from './__fixtures__/photo/photo.repository.fixture';
import { PhotoEntityFixture } from './__fixtures__/photo/photo.entity.fixture';

describe('AppModule', () => {
  let photoModule: PhotoModuleFixture;
  let photoEntityRepo: Repository<PhotoEntityInterfaceFixture>;
  let photoCustomRepo: PhotoRepositoryFixtureInterface;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [PhotoEntityFixture],
        }),
        PhotoModuleFixture.register(),
      ],
    }).compile();

    photoModule = testModule.get<PhotoModuleFixture>(PhotoModuleFixture);
    photoEntityRepo = testModule.get<Repository<PhotoEntityInterfaceFixture>>(
      getEntityRepositoryToken('photo'),
    );
    photoCustomRepo = testModule.get(getDynamicRepositoryToken('photo'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(photoModule).toBeInstanceOf(PhotoModuleFixture);
      expect(photoEntityRepo).toBeInstanceOf(Repository);
      expect(photoCustomRepo).toBeInstanceOf(Repository);
      expect(photoCustomRepo['customMethod']).toBeInstanceOf(Function);
    });
  });
});
