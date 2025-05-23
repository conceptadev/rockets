import {
  CacheCreatableInterface,
  CacheInterface,
} from '@concepta/nestjs-common';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { getDataSourceToken } from '@nestjs/typeorm';

import { Test, TestingModule } from '@nestjs/testing';
import { AppModuleFixture } from '../__fixtures__/app.module.fixture';
import { UserEntityFixture } from '../__fixtures__/entities/user-entity.fixture';
import { UserFactoryFixture } from '../__fixtures__/factories/user.factory.fixture';
import { CacheService } from './cache.service';

const expirationDate = new Date();
expirationDate.setHours(expirationDate.getHours() + 1);

jest.mock('../utils/get-expiration-date.util', () => ({
  __esModule: true,
  default: jest.fn(() => expirationDate),
}));

describe(CacheService.name, () => {
  let cacheService: CacheService;
  let seedingSource: SeedingSource;
  let userFactory: UserFactoryFixture;
  let user: UserEntityFixture;

  const createTestCache = (
    overrides: Partial<CacheCreatableInterface> = {},
  ): CacheCreatableInterface => ({
    key: 'test-key',
    type: 'test-type',
    data: 'test-data',
    assigneeId: user.id,
    expiresIn: '1h',
    ...overrides,
  });

  const createTestCacheQuery = (
    overrides: Partial<
      Pick<CacheInterface, 'key' | 'type' | 'assigneeId'>
    > = {},
  ) => ({
    key: 'test-key',
    type: 'test-type',
    assigneeId: user.id,
    ...overrides,
  });

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    cacheService = testModule.get<CacheService>(CacheService);

    seedingSource = new SeedingSource({
      dataSource: testModule.get(getDataSourceToken()),
    });

    await seedingSource.initialize();

    userFactory = new UserFactoryFixture({ seedingSource });
    user = await userFactory.create();
  });

  describe(CacheService.prototype.create, () => {
    it('should create a cache entry', async () => {
      const cacheData = createTestCache();

      const createdCache = await cacheService.create('user', cacheData);
      expect(createdCache).toBeDefined();
      expect(createdCache.key).toBe(cacheData.key);
      expect(createdCache.type).toBe(cacheData.type);
      expect(createdCache.data).toBe(cacheData.data);
      expect(createdCache.assigneeId).toBe(user.id);
    });
  });

  describe(CacheService.prototype.get, () => {
    it('should find an existing cache entry', async () => {
      const cacheData = createTestCache();
      await cacheService.create('user', cacheData);

      const foundCache = await cacheService.get('user', createTestCacheQuery());
      expect(foundCache).toBeDefined();
      expect(foundCache?.key).toBe(cacheData.key);
    });

    it('should return null for non-existent cache', async () => {
      const nonExistentCache = await cacheService.get(
        'user',
        createTestCacheQuery({
          key: 'non-existent-key',
          type: 'non-existent-type',
        }),
      );
      expect(nonExistentCache).toBeNull();
    });
  });

  describe(CacheService.prototype.update, () => {
    it('should update an existing cache entry', async () => {
      const initialCache = createTestCache();
      const createdCache = await cacheService.create('user', initialCache);
      expect(createdCache.data).toBe('test-data');

      const updatedData = 'updated-data';
      const updatedCache = await cacheService.update('user', {
        ...createTestCacheQuery(),
        data: updatedData,
        expiresIn: '1h',
      });

      expect(updatedCache.data).toBe(updatedData);
      expect(updatedCache.key).toBe(initialCache.key);
      expect(updatedCache.type).toBe(initialCache.type);
      expect(updatedCache.assigneeId).toBe(user.id);
    });
  });

  describe(CacheService.prototype.delete, () => {
    it('should delete an existing cache entry', async () => {
      const cacheData = createTestCache();
      await cacheService.create('user', cacheData);

      await cacheService.delete('user', createTestCacheQuery());

      const deletedCache = await cacheService.get(
        'user',
        createTestCacheQuery(),
      );
      expect(deletedCache).toBeNull();
    });
  });

  describe(CacheService.prototype.getAssignedCaches, () => {
    it('should get all caches for an assignee', async () => {
      const cache1 = createTestCache({ key: 'multi-test-key-1' });
      const cache2 = createTestCache({ key: 'multi-test-key-2' });

      await cacheService.create('user', cache1);
      await cacheService.create('user', cache2);

      const userCaches = await cacheService.getAssignedCaches('user', {
        assigneeId: user.id,
      });

      expect(userCaches).toHaveLength(2);
      expect(userCaches[0].assigneeId).toBe(user.id);
      expect(userCaches[1].assigneeId).toBe(user.id);
      expect(userCaches.map((cache) => cache.key)).toContain(cache1.key);
      expect(userCaches.map((cache) => cache.key)).toContain(cache2.key);
    });
  });

  describe(CacheService.prototype.clear, () => {
    it('should clear all caches for an assignee', async () => {
      const cache1 = createTestCache({ key: 'clear-test-key-1' });
      const cache2 = createTestCache({ key: 'clear-test-key-2' });

      await cacheService.create('user', cache1);
      await cacheService.create('user', cache2);

      await cacheService.clear('user', {
        assigneeId: user.id,
      });

      const userCaches = await cacheService.getAssignedCaches('user', {
        assigneeId: user.id,
      });
      expect(userCaches).toHaveLength(0);
    });
  });

  describe(CacheService.prototype.updateOrCreate, () => {
    it('should create new cache if not exists and update if exists', async () => {
      const cacheData = createTestCache({ key: 'update-or-create-key' });

      // First call should create
      const createdCache = await cacheService.updateOrCreate('user', cacheData);
      expect(createdCache.data).toBe('test-data');

      // Second call should update
      const updatedData = 'updated-data';
      const updatedCache = await cacheService.updateOrCreate('user', {
        ...cacheData,
        data: updatedData,
      });

      expect(updatedCache.data).toBe(updatedData);
      expect(updatedCache.key).toBe(cacheData.key);
      expect(updatedCache.type).toBe(cacheData.type);
      expect(updatedCache.assigneeId).toBe(user.id);

      const userCaches = await cacheService.getAssignedCaches('user', {
        assigneeId: user.id,
      });
      expect(userCaches).toHaveLength(1);
    });
  });
});
