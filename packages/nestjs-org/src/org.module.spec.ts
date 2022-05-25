import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { OrgModule } from './org.module';
import { DefaultOrgLookupService } from './services/default-org-lookup.service';
import { DefaultOrgMutateService } from './services/default-org-mutate.service';
import { OrgCrudService } from './services/org-crud.service';
import { OrgController } from './org.controller';
import { OrgLookupService } from './services/org-lookup.service';
import { OrgMutateService } from './services/org-mutate.service';
import { CrudModule } from '@concepta/nestjs-crud';
import {
  getDynamicRepositoryToken,
  getEntityRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';

import { OrgEntityFixture } from './__fixtures__/org-entity.fixture';
import { OrgRepositoryFixture } from './__fixtures__/org-repository.fixture';
import { ORG_MODULE_ORG_ENTITY_KEY } from './org.constants';

describe('OrgModule', () => {
  let orgModule: OrgModule;
  let orgLookupService: DefaultOrgLookupService;
  let orgMutateService: DefaultOrgMutateService;
  let orgCrudService: OrgCrudService;
  let orgController: OrgController;
  let orgEntityRepo: Repository<OrgEntityFixture>;
  let orgDynamicRepo: OrgRepositoryFixture;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.registerAsync({
          useFactory: async () => ({
            type: 'sqlite',
            database: ':memory:',
            entities: [OrgEntityFixture],
          }),
        }),
        OrgModule.register({
          entities: {
            org: {
              entity: OrgEntityFixture,
              repository: OrgRepositoryFixture,
            },
          },
        }),
        CrudModule.register(),
      ],
    }).compile();

    orgModule = testModule.get<OrgModule>(OrgModule);
    orgEntityRepo = testModule.get<Repository<OrgEntityFixture>>(
      getEntityRepositoryToken(ORG_MODULE_ORG_ENTITY_KEY),
    );
    orgDynamicRepo = testModule.get<OrgRepositoryFixture>(
      getDynamicRepositoryToken(ORG_MODULE_ORG_ENTITY_KEY),
    );
    orgLookupService =
      testModule.get<DefaultOrgLookupService>(OrgLookupService);
    orgMutateService =
      testModule.get<DefaultOrgMutateService>(OrgMutateService);
    orgCrudService = testModule.get<OrgCrudService>(OrgCrudService);
    orgController = testModule.get<OrgController>(OrgController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(orgModule).toBeInstanceOf(OrgModule);
      expect(orgEntityRepo).toBeInstanceOf(Repository);
      expect(orgDynamicRepo).toBeInstanceOf(OrgRepositoryFixture);
      expect(orgCrudService).toBeInstanceOf(OrgCrudService);
      expect(orgLookupService).toBeInstanceOf(DefaultOrgLookupService);
      expect(orgLookupService['orgRepo']).toBeInstanceOf(OrgRepositoryFixture);
      expect(orgLookupService['orgRepo'].find).toBeInstanceOf(Function);
      expect(orgMutateService).toBeInstanceOf(DefaultOrgMutateService);
      expect(orgMutateService['repo']).toBeInstanceOf(OrgRepositoryFixture);
      expect(orgMutateService['repo'].find).toBeInstanceOf(Function);
      expect(orgController).toBeInstanceOf(OrgController);
    });
  });
});
