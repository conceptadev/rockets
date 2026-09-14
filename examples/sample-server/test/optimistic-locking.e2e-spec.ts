import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { INestApplication } from '@nestjs/common';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { ExceptionsFilter } from '@concepta/rockets';
import {
  getDynamicRepositoryToken,
  OptimisticLockException,
  Where,
  type RepositoryInterface,
} from '@concepta/rockets-core';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import type { Pet } from '../src/resources/pet/pet.schema';

/**
 * `petSchema` is built from `auditableEntity`, which carries `f.version()`.
 * Since `@concepta/nestjs-repository` 8.0.0-alpha.11 a version column turns
 * update/replace into a compare-and-swap, so the second of two writers who
 * both read the same row is rejected instead of silently overwriting the
 * first — TypeORM's own `@VersionColumn` increments, but the WHERE clause
 * it builds is keyed only by primary key.
 *
 * This only works because the entity actually HAS a version column. Until
 * `f.version()` declared `db: { version: true }` it compiled to a plain
 * integer, and every one of these writes won.
 */
describe('Optimistic locking on generated entities (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let userId: string;
  let petId: string;

  beforeAll(async () => {
    app = await NestFactory.create(AppModule, { logger: ['error'] });
    app.useGlobalFilters(new ExceptionsFilter(app.get(HttpAdapterHost)));
    await app.init();

    const signup = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'locking@example.com',
        password: 'password123',
        name: 'Locking',
      })
      .expect(201);
    userId = signup.body.id;
    token = signup.body.accessToken;

    const pet = await request(app.getHttpServer())
      .post('/pets')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bolt', species: 'Dog', age: 1, status: 'active', userId })
      .expect(201);
    petId = pet.body.id;
  }, 30000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('exposes a version on the generated entity', async () => {
    const res = await request(app.getHttpServer())
      .get(`/pets/${petId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.version).toBe(1);
  });

  it('increments the version on every write', async () => {
    await request(app.getHttpServer())
      .patch(`/pets/${petId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ age: 2 })
      .expect(200);

    const res = await request(app.getHttpServer())
      .get(`/pets/${petId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.version).toBe(2);
    expect(res.body.age).toBe(2);
  });

  // What this pins: a writer holding a stale read never overwrites a newer
  // commit. Removing `db: { version: true }` from `f.version()` lets the
  // second write land and silently erase the first — the regression this
  // guards.
  //
  // It used to race two concurrent PATCHes and expect one to fail. That
  // asserted a scheduling outcome, not the lock: on this sample's
  // single-connection in-memory SQLite the loser was refused by a
  // transaction collision (a 5xx), never by the version check, and a fast
  // runner that happened to serialize the two requests saw both answer 200
  // — correctly, since the second one read the first one's commit. Holding
  // two reads of the same version and writing them in order is the lost
  // update itself, with no timing left in it.
  it('refuses a write made from a stale read instead of clobbering', async () => {
    const repo = app.get<RepositoryInterface<Pet>>(
      getDynamicRepositoryToken('pet'),
    );
    const readByA = await repo.findOne({ where: Where.eq('id', petId) });
    const readByB = await repo.findOne({ where: Where.eq('id', petId) });
    expect(readByA?.version).toBe(readByB?.version);

    await repo.update(readByA!, { name: 'Writer A' });

    await expect(
      repo.update(readByB!, { name: 'Writer B' }),
    ).rejects.toBeInstanceOf(OptimisticLockException);

    const final = await request(app.getHttpServer())
      .get(`/pets/${petId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(final.body.name).toBe('Writer A');
    expect(final.body.version).toBe(Number(readByA!.version) + 1);
  });

  // `@concepta/nestjs-crud` 8.0.0-alpha.12 reads `If-Match` on mutating CRUD
  // routes and turns it into the repository's `expectedVersion`, so a client
  // that read version N can refuse to write over someone else's N+1 without
  // racing anyone. Generated Rockets resources get it for free — these pin
  // that the header reaches the repository instead of being ignored.
  describe('If-Match precondition', () => {
    let ifMatchPetId: string;

    beforeAll(async () => {
      const pet = await request(app.getHttpServer())
        .post('/pets')
        .send({
          name: 'Match',
          species: 'Cat',
          age: 1,
          status: 'active',
          userId,
        })
        .set('Authorization', `Bearer ${token}`)
        .expect(201);
      ifMatchPetId = pet.body.id;
    }, 30000);

    it('rejects a write whose If-Match names a stale version', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/pets/${ifMatchPetId}`)
        .set('Authorization', `Bearer ${token}`)
        .set('If-Match', '"0"')
        .send({ age: 9 })
        .expect(409);

      expect(res.body.errorCode).toBe('OPTIMISTIC_LOCK_CONFLICT');

      const after = await request(app.getHttpServer())
        .get(`/pets/${ifMatchPetId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(after.body.age).toBe(1);
    });

    it('accepts a write whose If-Match names the current version', async () => {
      const current = await request(app.getHttpServer())
        .get(`/pets/${ifMatchPetId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      await request(app.getHttpServer())
        .patch(`/pets/${ifMatchPetId}`)
        .set('Authorization', `Bearer ${token}`)
        .set('If-Match', `"${current.body.version}"`)
        .send({ age: 3 })
        .expect(200);

      const after = await request(app.getHttpServer())
        .get(`/pets/${ifMatchPetId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(after.body.age).toBe(3);
      expect(after.body.version).toBe(current.body.version + 1);
    });

    it('rejects a malformed If-Match instead of ignoring it', async () => {
      await request(app.getHttpServer())
        .patch(`/pets/${ifMatchPetId}`)
        .set('Authorization', `Bearer ${token}`)
        .set('If-Match', 'not-an-etag')
        .send({ age: 4 })
        .expect(400);
    });
  });
});
