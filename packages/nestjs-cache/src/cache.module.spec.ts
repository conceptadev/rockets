import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { CacheInterface } from '@concepta/nestjs-common';
import { CACHE_MODULE_REPOSITORIES_TOKEN } from './cache.constants';
import { CacheModule } from './cache.module';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { DynamicModule } from '@nestjs/common';
import { CacheService } from './services/cache.service';

describe(CacheModule.name, () => {
  let cacheModule: CacheModule;
  let cacheService: CacheService;
  let cacheDynamicRepo: Record<string, Repository<CacheInterface>>;

  beforeEach(async () => {
    // to avoid error log from i18next not initialized
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    cacheModule = testModule.get<CacheModule>(CacheModule);
    cacheService = testModule.get<CacheService>(CacheService);
    cacheDynamicRepo = testModule.get<
      Record<string, Repository<CacheInterface>>
    >(CACHE_MODULE_REPOSITORIES_TOKEN);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(cacheModule).toBeInstanceOf(CacheModule);
      expect(cacheService).toBeInstanceOf(CacheService);
      expect(cacheDynamicRepo).toBeDefined();
    });
  });

  describe('CacheModule functions', () => {
    const spyRegister = jest
      .spyOn(CacheModule, 'register')
      .mockImplementation(() => {
        return {} as DynamicModule;
      });

    const spyRegisterAsync = jest
      .spyOn(CacheModule, 'registerAsync')
      .mockImplementation(() => {
        return {} as DynamicModule;
      });

    it('should call super.register in register method', () => {
      CacheModule.register({});
      expect(spyRegister).toHaveBeenCalled();
    });

    it('should call super.registerAsync in register method', () => {
      CacheModule.registerAsync({});
      expect(spyRegisterAsync).toHaveBeenCalled();
    });

    it('should throw an error in forFeature method', () => {
      expect(() => CacheModule.forFeature({})).toThrow(
        'You must provide the entities option',
      );
    });
  });
});
