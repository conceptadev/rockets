import { getDynamicRepositoryToken } from '@concepta/nestjs-typeorm-ext';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';

import { AUTH_HISTORY_MODULE_AUTH_HISTORY_ENTITY_KEY } from './auth-history.constants';
import { AuthHistoryController } from './auth-history.controller';
import { AuthHistoryModule } from './auth-history.module';
import { AuthHistoryCrudService } from './services/auth-history-crud.service';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { AuthHistoryEntityFixture } from './__fixtures__/entities/auth-history.entity.fixture';

describe('AppModule', () => {
  let authHistoryModule: AuthHistoryModule;
  let authHistoryCrudService: AuthHistoryCrudService;
  let authHistoryController: AuthHistoryController;
  let authHistoryRepo: Repository<AuthHistoryEntityFixture>;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    authHistoryModule = testModule.get<AuthHistoryModule>(AuthHistoryModule);
    authHistoryRepo = testModule.get(
      getDynamicRepositoryToken(AUTH_HISTORY_MODULE_AUTH_HISTORY_ENTITY_KEY),
    );
    authHistoryCrudService = testModule.get<AuthHistoryCrudService>(
      AuthHistoryCrudService,
    );
    authHistoryController = testModule.get<AuthHistoryController>(
      AuthHistoryController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(authHistoryModule).toBeInstanceOf(AuthHistoryModule);
      expect(authHistoryRepo).toBeInstanceOf(Repository);
      expect(authHistoryCrudService).toBeInstanceOf(AuthHistoryCrudService);
      expect(authHistoryController).toBeInstanceOf(AuthHistoryController);
    });
  });
});
