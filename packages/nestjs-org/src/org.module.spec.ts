import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { CrudModule } from '@concepta/nestjs-crud';
import {
  getDynamicRepositoryToken,
  getEntityRepositoryToken,
  TypeOrmExtModule,
} from '@concepta/nestjs-typeorm-ext';
import { OrgModule } from './org.module';
import { DefaultOrgLookupService } from './services/default-org-lookup.service';
import { DefaultOrgMutateService } from './services/default-org-mutate.service';
import { OrgCrudService } from './services/org-crud.service';
import { OrgController } from './org.controller';
import { OrgLookupService } from './services/org-lookup.service';
import { OrgMutateService } from './services/org-mutate.service';
import {
  ORG_MODULE_ORG_ENTITY_KEY,
  ORG_MODULE_OWNER_LOOKUP_SERVICE,
} from './org.constants';

import { OrgEntityFixture } from './__fixtures__/org-entity.fixture';
import { OwnerEntityFixture } from './__fixtures__/owner-entity.fixture';
import { OwnerLookupServiceFixture } from './__fixtures__/owner-lookup-service.fixture';
import { OwnerModuleFixture } from './__fixtures__/owner.module.fixture';

describe('OrgModule', () => {
  let orgModule: OrgModule;
  let orgLookupService: DefaultOrgLookupService;
  let orgMutateService: DefaultOrgMutateService;
  let ownerLookupService: OwnerLookupServiceFixture;
  let orgCrudService: OrgCrudService;
  let orgController: OrgController;
  let orgEntityRepo: Repository<OrgEntityFixture>;
  let orgDynamicRepo: Repository<OrgEntityFixture>;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.register({
          type: 'sqlite',
          database: ':memory:',
          entities: [OrgEntityFixture, OwnerEntityFixture],
        }),
        OrgModule.registerAsync({
          imports: [OwnerModuleFixture.register()],
          inject: [OwnerLookupServiceFixture],
          useFactory: (ownerLookupService: OwnerLookupServiceFixture) => ({
            ownerLookupService,
          }),
          entities: {
            org: {
              entity: OrgEntityFixture,
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
    orgDynamicRepo = testModule.get(
      getDynamicRepositoryToken(ORG_MODULE_ORG_ENTITY_KEY),
    );
    orgLookupService =
      testModule.get<DefaultOrgLookupService>(OrgLookupService);
    orgMutateService =
      testModule.get<DefaultOrgMutateService>(OrgMutateService);
    ownerLookupService = testModule.get<OwnerLookupServiceFixture>(
      ORG_MODULE_OWNER_LOOKUP_SERVICE,
    );
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
      expect(orgDynamicRepo).toBeInstanceOf(Repository);
      expect(orgCrudService).toBeInstanceOf(OrgCrudService);
      expect(orgLookupService).toBeInstanceOf(DefaultOrgLookupService);
      expect(orgLookupService['repo']).toBeInstanceOf(Repository);
      expect(orgLookupService['repo'].find).toBeInstanceOf(Function);
      expect(orgMutateService).toBeInstanceOf(DefaultOrgMutateService);
      expect(orgMutateService['repo']).toBeInstanceOf(Repository);
      expect(ownerLookupService).toBeInstanceOf(OwnerLookupServiceFixture);
      expect(ownerLookupService['repo']).toBeInstanceOf(Repository);
      expect(orgMutateService['repo'].find).toBeInstanceOf(Function);
      expect(orgController).toBeInstanceOf(OrgController);
    });
  });
});
