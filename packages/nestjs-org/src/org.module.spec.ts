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
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';

import { OrgEntityFixture } from './__fixtures__/org-entity.fixture';
import { OrgRepositoryFixture } from './__fixtures__/org-repository.fixture';

describe('OrgModule', () => {
  let orgModule: OrgModule;
  let orgLookupService: DefaultOrgLookupService;
  let orgMutateService: DefaultOrgMutateService;
  let orgCrudService: OrgCrudService;
  let orgController: OrgController;
  let orgEntityRepo: Repository<OrgEntityFixture>;
  let orgCustomRepo: OrgRepositoryFixture;

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
          orm: {
            entities: { org: { useClass: OrgEntityFixture } },
            repositories: { orgRepository: { useClass: OrgRepositoryFixture } },
          },
        }),
        CrudModule.register(),
      ],
    }).compile();

    orgModule = testModule.get<OrgModule>(OrgModule);
    orgEntityRepo = testModule.get<Repository<OrgEntityFixture>>(
      'ORG_MODULE_ORG_ENTITY_REPO_TOKEN',
    );
    orgCustomRepo = testModule.get<OrgRepositoryFixture>(
      'ORG_MODULE_ORG_CUSTOM_REPO_TOKEN',
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
      expect(orgCustomRepo).toBeInstanceOf(OrgRepositoryFixture);
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
