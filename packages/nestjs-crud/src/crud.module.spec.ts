import { Test, TestingModule } from '@nestjs/testing';

import { Module } from '@nestjs/common';
import { CrudModule } from './crud.module';
import { CrudOptionsInterface } from './interfaces/crud-options.interface';
import { CrudSettingsInterface } from './interfaces/crud-settings.interface';
import {
  CRUD_MODULE_OPTIONS_TOKEN,
  CRUD_MODULE_SETTINGS_TOKEN,
} from './crud.constants';

describe(CrudModule, () => {
  let crudModule: CrudModule;
  let crudOptions: CrudOptionsInterface;
  let crudSettings: CrudSettingsInterface;

  describe(CrudModule.register, () => {
    beforeAll(async () => {
      const testModule = await Test.createTestingModule({
        imports: [CrudModule.register({})],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe(CrudModule.forRoot, () => {
    beforeAll(async () => {
      const testModule = await Test.createTestingModule({
        imports: [CrudModule.forRoot({})],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe(CrudModule.registerAsync, () => {
    beforeEach(async () => {
      const testModule = await Test.createTestingModule({
        imports: [CrudModule.registerAsync({ useFactory: () => ({}) })],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe(CrudModule.forRootAsync, () => {
    beforeEach(async () => {
      const testModule = await Test.createTestingModule({
        imports: [CrudModule.forRootAsync({ useFactory: () => ({}) })],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe(CrudModule.forFeature, () => {
    @Module({
      imports: [CrudModule.forRoot({})],
    })
    class AppGlobalTest {}

    @Module({
      imports: [AppGlobalTest, CrudModule.forFeature({})],
    })
    class AppFeatureTest {}

    beforeAll(async () => {
      const testModule = await Test.createTestingModule({
        imports: [AppFeatureTest],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();
  });

  describe(CrudModule.forFeature, () => {
    @Module({
      imports: [CrudModule.forRoot({})],
    })
    class AppGlobalTest {}

    @Module({
      imports: [
        AppGlobalTest,
        CrudModule.forFeature({
          settings: {
            serialization: { toPlainOptions: { strategy: 'excludeAll' } },
          },
        }),
      ],
    })
    class AppFeatureTest {}

    beforeAll(async () => {
      const testModule = await Test.createTestingModule({
        imports: [AppFeatureTest],
      }).compile();

      setProviderVars(testModule);
    });

    commonProviderTests();

    it('settings should be overriden', async () => {
      expect(crudSettings).toEqual({
        serialization: { toPlainOptions: { strategy: 'excludeAll' } },
      });
    });
  });

  function setProviderVars(testModule: TestingModule) {
    crudModule = testModule.get<CrudModule>(CrudModule);
    crudOptions = testModule.get<CrudOptionsInterface>(
      CRUD_MODULE_OPTIONS_TOKEN,
    );
    crudSettings = testModule.get<CrudSettingsInterface>(
      CRUD_MODULE_SETTINGS_TOKEN,
    );
  }

  function commonProviderTests() {
    it('providers should be loaded', async () => {
      expect(crudModule).toBeInstanceOf(CrudModule);
      expect(crudOptions).toBeInstanceOf(Object);
      expect(crudSettings).toBeInstanceOf(Object);
    });
  }
});
