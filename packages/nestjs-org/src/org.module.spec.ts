import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { CrudModule } from '@concepta/nestjs-crud';
import {
  RepositoryInterface,
  getDynamicRepositoryToken,
  getEntityRepositoryToken,
} from '@concepta/nestjs-common';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import { OrgModule } from './org.module';
import { OrgCrudService } from './services/org-crud.service';
import { OrgController } from './org.controller';
import { OrgModelService } from './services/org-model.service';
import { ORG_MODULE_ORG_ENTITY_KEY } from './org.constants';

import { OrgEntityFixture } from './__fixtures__/org-entity.fixture';
import { OwnerEntityFixture } from './__fixtures__/owner-entity.fixture';
import { OwnerModuleFixture } from './__fixtures__/owner.module.fixture';
import { OrgMemberEntityFixture } from './__fixtures__/org-member.entity.fixture';
import { UserEntityFixture } from './__fixtures__/user-entity.fixture';
import { InvitationEntityFixture } from './__fixtures__/invitation.entity.fixture';
import { OrgProfileEntityFixture } from './__fixtures__/org-profile.entity.fixture';

describe('OrgModule', () => {
  let orgModule: OrgModule;
  let orgModelService: OrgModelService;
  let orgCrudService: OrgCrudService;
  let orgController: OrgController;
  let orgEntityRepo: RepositoryInterface<OrgEntityFixture>;
  let orgDynamicRepo: RepositoryInterface<OrgEntityFixture>;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [
            OrgEntityFixture,
            OwnerEntityFixture,
            OrgMemberEntityFixture,
            OrgProfileEntityFixture,
            UserEntityFixture,
            InvitationEntityFixture,
          ],
        }),
        OrgModule.forRoot({
          entities: {
            org: {
              entity: OrgEntityFixture,
            },
            'org-member': {
              entity: OrgMemberEntityFixture,
            },
          },
        }),
        CrudModule.forRoot({}),
        OwnerModuleFixture.register(),
      ],
    }).compile();

    orgModule = testModule.get<OrgModule>(OrgModule);
    orgEntityRepo = testModule.get<RepositoryInterface<OrgEntityFixture>>(
      getEntityRepositoryToken(ORG_MODULE_ORG_ENTITY_KEY),
    );
    orgDynamicRepo = testModule.get(
      getDynamicRepositoryToken(ORG_MODULE_ORG_ENTITY_KEY),
    );
    orgModelService = testModule.get<OrgModelService>(OrgModelService);
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
      expect(orgModelService).toBeInstanceOf(OrgModelService);
      expect(orgModelService['repo']).toBeInstanceOf(Repository);
      expect(orgModelService['repo'].find).toBeInstanceOf(Function);
      expect(orgController).toBeInstanceOf(OrgController);
    });
  });
});
