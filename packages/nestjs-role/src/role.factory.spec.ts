import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { SeedingSource } from '@concepta/typeorm-seeding';
import { RoleModule } from './role.module';
import { RoleFactory } from './role.factory';

import { AppModuleFixture } from './__fixtures__/app.module.fixture';
import { RoleEntityFixture } from './__fixtures__/entities/role-entity.fixture';

describe('RoleModule', () => {
  let roleModule: RoleModule;
  let seedingSource: SeedingSource;
  let roleFactory: RoleFactory;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    seedingSource = new SeedingSource({
      dataSource: testModule.get(getDataSourceToken()),
    });

    roleFactory = new RoleFactory({ entity: RoleEntityFixture, seedingSource });

    roleModule = testModule.get<RoleModule>(RoleModule);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('factory', () => {
    it('should create a role', async () => {
      expect(roleModule).toBeInstanceOf(RoleModule);

      const role = await roleFactory.create();

      expect(role).toBeInstanceOf(RoleEntityFixture);
      expect(typeof role.name).toEqual('string');
      expect(role.name.length > 0).toEqual(true);
      expect(typeof role.description).toEqual('string');
      expect(role.description.length > 0).toEqual(true);
    });
  });
});
