import supertest from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { TypeOrmExtModule } from '@concepta/nestjs-typeorm-ext';
import {
  ConfigurableCrudOptions,
  ConfigurableCrudOptionsTransformer,
  CrudModule,
} from '@concepta/nestjs-crud';
import { SeedingSource } from '@concepta/typeorm-seeding';

import { OrgFactory } from '../seeding/org.factory';
import { OrgModule } from '../org.module';
import { OrgEntityFixture } from '../__fixtures__/org-entity.fixture';
import { OwnerEntityFixture } from '../__fixtures__/owner-entity.fixture';
import { OwnerModuleFixture } from '../__fixtures__/owner.module.fixture';
import { OwnerFactoryFixture } from '../__fixtures__/owner-factory.fixture';
import { OrgMemberEntityFixture } from '../__fixtures__/org-member.entity.fixture';
import { UserEntityFixture } from '../__fixtures__/user-entity.fixture';
import { InvitationEntityFixture } from '../__fixtures__/invitation.entity.fixture';
import { OrgProfileEntityFixture } from '../__fixtures__/org-profile.entity.fixture';
import { OrgProfileFactory } from '../seeding/org-profile.factory';
import { OrgProfileSeeder } from '../seeding/org-profile.seeder';
import { OrgProfileCrudBuilder } from './org-profile.crud-builder';
import { OrgProfileDtoFixture } from '../__fixtures__/dto/org-profile.dto.fixture';
import { OrgProfileCreateDtoFixture } from '../__fixtures__/dto/org-profile-create.dto.fixture';
import { OrgProfileUpdateDtoFixture } from '../__fixtures__/dto/org-profile-update.dto.fixture';

type OrgProfileExtras = {
  model: {
    type: typeof OrgProfileDtoFixture;
  };
  createOne: {
    dto: typeof OrgProfileCreateDtoFixture;
  };
  updateOne: {
    dto: typeof OrgProfileUpdateDtoFixture;
  };
};

describe('Org Profile Crud Builder (e2e)', () => {
  let app: INestApplication;
  let seedingSource: SeedingSource;

  const orgFactory = new OrgFactory({
    entity: OrgEntityFixture,
    factories: [new OwnerFactoryFixture()],
  });

  const orgProfileFactory = new OrgProfileFactory({
    entity: OrgProfileEntityFixture,
    factories: [orgFactory],
  });

  const extras: OrgProfileExtras = {
    model: {
      type: OrgProfileDtoFixture,
    },
    createOne: {
      dto: OrgProfileCreateDtoFixture,
    },
    updateOne: {
      dto: OrgProfileUpdateDtoFixture,
    },
  };

  // update config to use new dto
  const myOptionsTransform: ConfigurableCrudOptionsTransformer<
    OrgProfileExtras
  > = (
    options: ConfigurableCrudOptions,
    extras?: OrgProfileExtras,
  ): ConfigurableCrudOptions => {
    if (!extras) return options;

    options.controller.model.type = extras.model.type;
    if (options.createOne) options.createOne.dto = extras.createOne.dto;
    if (options.updateOne) options.updateOne.dto = extras.updateOne.dto;
    return options;
  };

  // define profile with custom dtos
  const orgProfileCrudBuilder = new OrgProfileCrudBuilder<
    OrgProfileEntityFixture,
    OrgProfileCreateDtoFixture,
    OrgProfileUpdateDtoFixture,
    OrgProfileCreateDtoFixture,
    OrgProfileExtras
  >();
  orgProfileCrudBuilder.setExtras(extras, myOptionsTransform);

  const { ConfigurableControllerClass, ConfigurableServiceProvider } =
    orgProfileCrudBuilder.build();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmExtModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          synchronize: true,
          entities: [
            OrgEntityFixture,
            OrgProfileEntityFixture,
            OwnerEntityFixture,
            OrgMemberEntityFixture,
            UserEntityFixture,
            InvitationEntityFixture,
          ],
        }),
        OrgModule.forRootAsync({
          imports: [
            TypeOrmExtModule.forFeature({
              org: { entity: OrgEntityFixture },
              'org-member': { entity: OrgMemberEntityFixture },
              'org-profile': { entity: OrgProfileEntityFixture },
            }),
          ],
          useFactory: () => ({}),
        }),
        CrudModule.forRoot({}),
        OwnerModuleFixture.register(),
      ],
      controllers: [ConfigurableControllerClass],
      providers: [ConfigurableServiceProvider],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    seedingSource = new SeedingSource({
      dataSource: app.get(getDataSourceToken()),
    });

    await seedingSource.initialize();

    const orgProfileSeeder = new OrgProfileSeeder({
      factories: [orgProfileFactory],
    });

    await seedingSource.run.one(orgProfileSeeder);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('GET /org-profile', async () => {
    const response = await supertest(app.getHttpServer())
      .get('/org-profile?limit=10')
      .expect(200)
      .expect((res) => res.body.length === 10);
    expect(response);
  });

  it('GET /org-profile/:id', async () => {
    // get an org so we have an id
    const response = await supertest(app.getHttpServer())
      .get('/org-profile?limit=1')
      .expect(200);

    // get one using that id
    await supertest(app.getHttpServer())
      .get(`/org-profile/${response.body[0].id}`)
      .expect(200);
  });

  it('POST /org-profile', async () => {
    // need an org
    const org = await orgFactory.create();

    await supertest(app.getHttpServer())
      .post('/org-profile')
      .send({ orgId: org.id })
      .expect(201);
  });

  it('Patch /org-profile/:id - should update an existing org profile', async () => {
    // need an org
    const org = await orgFactory.create();

    // create org profile first
    const createResponse = await supertest(app.getHttpServer())
      .post('/org-profile')
      .send({ orgId: org.id })
      .expect(201);

    const id = createResponse.body.id;
    const updatedResponse = await supertest(app.getHttpServer())
      .patch(`/org-profile/${id}`)
      .send({
        name: 'Updated Profile',
      })
      .expect(200);

    expect(updatedResponse.body.name).toEqual('Updated Profile');
  });

  it('DELETE /org-profile/:id', async () => {
    // get an org so we have an id
    const response = await supertest(app.getHttpServer())
      .get('/org-profile?limit=1')
      .expect(200);

    // delete one using that id
    await supertest(app.getHttpServer())
      .delete(`/org-profile/${response.body[0].id}`)
      .expect(200);
  });
});
