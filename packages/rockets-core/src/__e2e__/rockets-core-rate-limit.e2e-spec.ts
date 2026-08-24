import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Controller, Get, INestApplication, Injectable } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';
import { AppContextHost } from '@concepta/nestjs-core';
import {
  getDynamicRepositoryToken,
  InjectDynamicRepository,
  TransactionScope,
  Where,
  type RepositoryInterface,
} from '@concepta/nestjs-repository';
import request from 'supertest';

import { RocketsCoreModule } from '../rockets-core.module';
import { defineModuleResource } from '../infrastructure/resource/define-module-resource';
import {
  RATE_LIMIT_STORE_TOKEN,
  type RateLimitResult,
  type RateLimitStoreInterface,
} from '../domain/interfaces/rate-limit.interface';
import { RateLimit } from '../decorators/rate-limit.decorator';
import { RateLimitGuard } from '../infrastructure/guards/rate-limit.guard';
import { InMemoryRateLimitStore } from '../infrastructure/rate-limit/in-memory-rate-limit-store.service';

@ApiTags('probe-e2e')
@Controller('probe')
class ProbeController {
  @Get('limited')
  @RateLimit({ limit: 2, windowMs: 60_000 })
  @ApiOkResponse({ description: 'ok' })
  limited() {
    return { ok: true };
  }

  @Get('unlimited')
  @ApiOkResponse({ description: 'ok' })
  unlimited() {
    return { ok: true };
  }
}

describe('rate limiting (e2e, issue #56) — in-memory reference store', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ProbeController],
      providers: [
        { provide: APP_GUARD, useClass: RateLimitGuard },
        { provide: RATE_LIMIT_STORE_TOKEN, useClass: InMemoryRateLimitStore },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('allows requests up to the limit and reports remaining via headers', async () => {
    const first = await request(app.getHttpServer())
      .get('/probe/limited')
      .expect(200);
    expect(first.headers['x-ratelimit-limit']).toBe('2');
    expect(first.headers['x-ratelimit-remaining']).toBe('1');

    await request(app.getHttpServer()).get('/probe/limited').expect(200);
  });

  it('rejects the request over the limit with 429 and Retry-After', async () => {
    const res = await request(app.getHttpServer())
      .get('/probe/limited')
      .expect(429);
    expect(res.headers['retry-after']).toBeDefined();
  });

  it('a route without @RateLimit() is never throttled', async () => {
    for (let i = 0; i < 10; i++) {
      await request(app.getHttpServer()).get('/probe/unlimited').expect(200);
    }
  });
});

/**
 * Real-DB proof that a dynamic-repository-backed store forwards `ctx`
 * correctly (issue #56's explicit ask, tied to the #45 regression
 * class) — a hand-written entity/store local to this test file,
 * matching the SAME pattern `CONFIGURATION.md` §7c documents. Not
 * shipped from core (rule 13: core stays ORM-agnostic); this is what
 * PROVES the documented pattern actually works against a real
 * TransactionScope + repository, not just an assertion in prose.
 */
@Entity('rate_limit_counters')
class RateLimitCounterEntity {
  @PrimaryColumn({ type: 'varchar' }) key!: string;
  @Column({ type: 'int' }) count!: number;
  @Column({ type: 'bigint' }) windowStart!: number;
}

const RATE_LIMIT_COUNTER_KEY = 'rateLimitCounter';

@Injectable()
class SqlRateLimitStore implements RateLimitStoreInterface {
  constructor(
    @InjectDynamicRepository(RATE_LIMIT_COUNTER_KEY)
    private readonly repo: RepositoryInterface<RateLimitCounterEntity>,
    private readonly txScope: TransactionScope,
  ) {}

  async consume(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<RateLimitResult> {
    // No pre-existing ctx at the guard layer (guards run before
    // interceptors) — this is the scope this store opens and owns.
    const ctx = AppContextHost.from();
    return this.txScope.run(
      ctx,
      async () => {
        const now = Date.now();
        const existing = await this.repo.findOne({
          where: Where.eq<RateLimitCounterEntity>('key', key),
          ctx,
        });

        const stale =
          existing === null || now - Number(existing.windowStart) >= windowMs;
        const count = stale ? 1 : existing.count + 1;
        const windowStart = stale ? now : Number(existing.windowStart);

        if (existing === null) {
          await this.repo.create({ key, count, windowStart }, { ctx });
        } else {
          await this.repo.update(existing, { count, windowStart }, { ctx });
        }

        return {
          allowed: count <= limit,
          limit,
          remaining: Math.max(0, limit - count),
          resetAt: windowStart + windowMs,
        };
      },
      // MANDATORY: fail-closed when this app has no transaction-capable
      // adapter registered at all, rather than silently proceeding
      // uncounted (CONFIGURATION.md §8a).
      { propagation: 'MANDATORY' },
    );
  }
}

@ApiTags('sql-probe-e2e')
@Controller('sql-probe')
class SqlProbeController {
  @Get('limited')
  @RateLimit({ limit: 2, windowMs: 60_000 })
  @ApiOkResponse({ description: 'ok' })
  limited() {
    return { ok: true };
  }
}

// defineModuleResource, not a plain TypeOrmModule.forFeature + @Module —
// TransactionScope (and every other repository primitive SqlRateLimitStore
// needs) is registered by RocketsCoreModule's own composition, the same
// wiring a real app goes through (rule 2/4 in AGENTS.md).
const rateLimitCounterResource = defineModuleResource({
  entities: [{ key: RATE_LIMIT_COUNTER_KEY, entity: RateLimitCounterEntity }],
  controllers: [SqlProbeController],
  providers: [SqlRateLimitStore],
  // Crosses the module boundary: the root test module's
  // `RATE_LIMIT_STORE_TOKEN` provider aliases it via `useExisting`.
  exports: [SqlRateLimitStore],
});

describe('rate limiting (e2e, issue #56) — dynamic-repository + TransactionScope', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [RateLimitCounterEntity],
          synchronize: true,
          dropSchema: true,
        }),
        RocketsCoreModule.forRoot({
          repository: TypeOrmRepositoryModule,
          resources: [rateLimitCounterResource],
          global: true,
        }),
      ],
      providers: [
        { provide: APP_GUARD, useClass: RateLimitGuard },
        { provide: RATE_LIMIT_STORE_TOKEN, useExisting: SqlRateLimitStore },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('enforces the limit against a real database', async () => {
    await request(app.getHttpServer()).get('/sql-probe/limited').expect(200);
    await request(app.getHttpServer()).get('/sql-probe/limited').expect(200);
    await request(app.getHttpServer()).get('/sql-probe/limited').expect(429);
  });

  it('ctx reached the repository layer — the counter row was actually committed', async () => {
    // Independent proof, not the guard/store's own read path: query the
    // SAME dynamic repository token directly. If `ctx` had been dropped
    // (issue #45's regression class), the write would either not be
    // visible here (wrong/no transaction) or the count would be wrong
    // (a lost update from a mis-scoped transaction).
    const repo = app.get<RepositoryInterface<RateLimitCounterEntity>>(
      getDynamicRepositoryToken(RATE_LIMIT_COUNTER_KEY),
    );
    const rows = await repo.find({});

    expect(rows).toHaveLength(1);
    expect(rows[0]?.count).toBe(3);
  });
});
