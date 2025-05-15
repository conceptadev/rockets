import { Test, TestingModule } from '@nestjs/testing';
import { getDynamicRepositoryToken } from '@concepta/nestjs-common';
import { TypeOrmExtModule } from './typeorm-ext.module';

import { PhotoModuleFixture } from './__fixtures__/photo/photo.module.fixture';
import { PhotoRepositoryFixtureInterface } from './__fixtures__/photo/photo.repository.fixture';
import { PhotoEntityFixture } from './__fixtures__/photo/photo.entity.fixture';
import { TypeOrmRepositoryAdapter } from './repository/typeorm-repository.adapter';

describe('AppModule', () => {
  let photoModule: PhotoModuleFixture;
  let photoCustomRepo: PhotoRepositoryFixtureInterface;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [PhotoEntityFixture],
        }),
        PhotoModuleFixture,
      ],
    }).compile();

    photoModule = testModule.get<PhotoModuleFixture>(PhotoModuleFixture);
    photoCustomRepo = testModule.get(getDynamicRepositoryToken('photo'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(photoModule).toBeInstanceOf(PhotoModuleFixture);
      expect(photoCustomRepo).toBeInstanceOf(TypeOrmRepositoryAdapter);
    });
    it.skip('should use custom repository', async () => {
      expect(photoCustomRepo['customMethod']).toBeInstanceOf(Function);
    });
  });
});
