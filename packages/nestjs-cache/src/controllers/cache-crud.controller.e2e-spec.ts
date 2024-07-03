import assert from 'assert';
import supertest from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { CacheCreatableInterface } from '@concepta/ts-common';
import { SeedingSource } from '@concepta/typeorm-seeding';

import { CacheFactory } from '../cache.factory';
import { CacheSeeder } from '../cache.seeder';

import { AppModuleFixture } from '../__fixtures__/app.module.fixture';
import { UserCacheEntityFixture } from '../__fixtures__/entities/user-cache-entity.fixture';
import { UserEntityFixture } from '../__fixtures__/entities/user-entity.fixture';
import { UserCacheFactoryFixture } from '../__fixtures__/factories/user-cache.factory.fixture';
import { UserFactoryFixture } from '../__fixtures__/factories/user.factory.fixture';

describe('CacheAssignmentController (e2e)', () => {
  let app: INestApplication;
  let seedingSource: SeedingSource;
  let userFactory: UserFactoryFixture;
  let userCacheFactory: UserCacheFactoryFixture;
  let user: UserEntityFixture;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    seedingSource = new SeedingSource({
      dataSource: app.get(getDataSourceToken()),
    });

    await seedingSource.initialize();

    userFactory = new UserFactoryFixture({ seedingSource });
    userCacheFactory = new UserCacheFactoryFixture({ seedingSource });

    const cacheSeeder = new CacheSeeder({
      factories: [new CacheFactory({ entity: UserCacheEntityFixture })],
    });

    await seedingSource.run.one(cacheSeeder);

    user = await userFactory.create();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    return app ? await app.close() : undefined;
  });

  it('GET /cache/user', async () => {
    await userCacheFactory
      .map((userCache) => {
        userCache.assignee = user;
      })
      .createMany(2);

    await supertest(app.getHttpServer())
      .get('/cache/user?limit=2')
      .expect(200)
      .then((res) => {
        assert.strictEqual(res.body.length, 2);
      });
  });

  it('GET /cache/user/:id', async () => {
    const userCache = await userCacheFactory
      .map((userCache) => {
        userCache.assignee = user;
      })
      .create();

    await supertest(app.getHttpServer())
      .get(
        `/cache/user/${userCache.id}` + `?filter[0]=key||$eq||${userCache.key}`,
      )
      .expect(200)
      .then((res) => {
        assert.strictEqual(res.body.assignee.id, user.id);
      });
  });

  it('GET /cache/user/ with key and type filters', async () => {
    const userCache = await userCacheFactory
      .map((userCache) => {
        userCache.assignee = user;
        userCache.key = 'specific-key';
        userCache.type = 'specific-type';
        userCache.data = JSON.stringify({ name: 'John Doe' });
      })
      .create();

    const url =
      `/cache/user/` +
      `?filter[0]=key||$eq||${userCache.key}` +
      `&filter[1]=type||$eq||${userCache.type}`;
    // Assuming your endpoint can filter by key and type
    await supertest(app.getHttpServer())
      .get(url)
      .expect(200)
      .then((res) => {
        const response = res.body[0];
        assert.strictEqual(response.assignee.id, user.id);
        assert.strictEqual(response.key, userCache.key);
        assert.strictEqual(response.type, userCache.type);
        assert.strictEqual(response.data, userCache.data);
      });
  });

  it('POST /cache/user', async () => {
    const payload: CacheCreatableInterface = {
      key: 'dashboard-1',
      type: 'filter',
      data: '{}',
      expiresIn: '1d',
      assignee: { id: user.id },
    };

    await supertest(app.getHttpServer())
      .post('/cache/user')
      .send(payload)
      .expect(201)
      .then((res) => {
        expect(res.body.key).toBe(payload.key);
        expect(res.body.assignee.id).toBe(user.id);
      });
  });

  it('POST /cache/user assignee id null', async () => {
    const payload = {
      key: 'dashboard-1',
      type: 'filter',
      data: '{}',
      expiresIn: '1d',
      assignee: { id: null },
    };

    await supertest(app.getHttpServer())
      .post('/cache/user')
      .send(payload)
      .expect(400);
  });

  it('POST /cache/user wrong assignee id', async () => {
    const payload = {
      key: 'dashboard-1',
      type: 'filter',
      data: '{}',
      expiresIn: '1d',
      assignee: { id: 'test' },
    };

    await supertest(app.getHttpServer())
      .post('/cache/user')
      .send(payload)
      .expect(500);
  });

  it('POST /cache/user Duplicated', async () => {
    const payload: CacheCreatableInterface = {
      key: 'dashboard-1',
      type: 'filter',
      data: '{}',
      expiresIn: '1d',
      assignee: { id: user.id },
    };

    await supertest(app.getHttpServer())
      .post('/cache/user')
      .send(payload)
      .expect(201)
      .then((res) => {
        expect(res.body.key).toBe(payload.key);
        expect(res.body.assignee.id).toBe(user.id);
      });

    payload.data = '{ "name": "John Doe" }';
    payload.expiresIn = null;
    await supertest(app.getHttpServer())
      .post('/cache/user')
      .send(payload)
      .expect(201)
      .then((res) => {
        expect(res.body.key).toBe(payload.key);
        expect(res.body.data).toBe(payload.data);
        expect(res.body.assignee.id).toBe(user.id);
      });
  });

  it('POST /cache/user null after create', async () => {
    interface ExtendedCacheCreatableInterface
      extends Pick<
        CacheCreatableInterface,
        'key' | 'expiresIn' | 'type' | 'data'
      > {
      assignee: { id: string | null } | null;
    }
    const payload: ExtendedCacheCreatableInterface = {
      key: 'dashboard-1',
      type: 'filter',
      data: '{}',
      expiresIn: '1d',
      assignee: { id: user.id },
    };

    await supertest(app.getHttpServer())
      .post('/cache/user')
      .send(payload)
      .expect(201)
      .then((res) => {
        expect(res.body.key).toBe(payload.key);
        expect(res.body.assignee.id).toBe(user.id);
      });

    payload.data = '{ "name": "John Doe" }';
    payload.expiresIn = null;
    payload.assignee = { id: null };

    await supertest(app.getHttpServer())
      .post('/cache/user')
      .send(payload)
      .expect(400);

    payload.assignee = { id: '' };
    await supertest(app.getHttpServer())
      .post('/cache/user')
      .send(payload)
      .expect(500);

    payload.assignee = null;
    await supertest(app.getHttpServer())
      .post('/cache/user')
      .send(payload)
      .expect(400);
  });

  it('POST /cache/user Update', async () => {
    const payload: CacheCreatableInterface = {
      key: 'dashboard-1',
      type: 'filter',
      data: '{}',
      expiresIn: '1d',
      assignee: { id: user.id },
    };
    await supertest(app.getHttpServer())
      .post('/cache/user')
      .send(payload)
      .expect(201)
      .then((res) => {
        expect(res.body.key).toBe(payload.key);
        expect(res.body.assignee.id).toBe(user.id);
      });
    payload.data = '{ "name": "John Doe" }';
    payload.expiresIn = null;
    await supertest(app.getHttpServer())
      .post('/cache/user/')
      .send(payload)
      .expect(201)
      .then((res) => {
        expect(res.body.key).toBe(payload.key);
        expect(res.body.data).toBe(payload.data);
        expect(res.body.assignee.id).toBe(user.id);
      });
  });

  it('DELETE /cache/user/:id', async () => {
    const userCache = await userCacheFactory
      .map((userCache) => {
        userCache.assignee = user;
      })
      .create();

    await supertest(app.getHttpServer())
      .delete(`/cache/user/${userCache.id}`)
      .expect(200);
  });
});
