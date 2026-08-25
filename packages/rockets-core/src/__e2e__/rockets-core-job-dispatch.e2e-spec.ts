import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Inject, Injectable, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { z } from 'zod';
import request from 'supertest';

import { RocketsCoreModule } from '../rockets-core.module';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { operationResource } from '../zod/zod-operation-resource';
import type { OperationContext } from '../domain/interfaces/operation-resource.interface';
import type {
  AuthAdapterInterface,
  AuthAttemptResult,
} from '../domain/interfaces/auth-adapter.interface';
import {
  JOB_DISPATCH_SERVICE_TOKEN,
  type JobDispatchServiceInterface,
} from '../domain/interfaces/job-dispatch.interface';
import { InProcessJobDispatchService } from '../infrastructure/jobs/in-process-job-dispatch.service';

@Injectable()
class OpenAuthProvider implements AuthAdapterInterface {
  async authenticate(): Promise<AuthAttemptResult> {
    return { matched: true, user: { id: 'u1', sub: 'u1' } };
  }
}

/**
 * The documented "202 + job id" shape (CONFIGURATION.md §6d): the
 * operation enqueues and returns immediately — it does not wait for the
 * job to run. Async work happens on a worker that calls `claim`
 * separately, shown in the second half of this spec without any HTTP
 * layer at all (a worker is not a route).
 */
@Injectable()
class GenerateReportHandler {
  constructor(
    @Inject(JOB_DISPATCH_SERVICE_TOKEN)
    private readonly jobs: JobDispatchServiceInterface,
  ) {}

  async handle(ctx: OperationContext<{ reportId: string }>) {
    const { jobId } = await this.jobs.enqueue(
      'generate-report',
      { reportId: ctx.input.reportId },
      { dedupeKey: `report:${ctx.input.reportId}` },
    );
    return { jobId };
  }
}

const ops = operationResource({
  path: 'reports',
  public: true,
  providers: [
    {
      provide: JOB_DISPATCH_SERVICE_TOKEN,
      useClass: InProcessJobDispatchService,
    },
  ],
  // A worker process claims jobs OUTSIDE any HTTP route, so this provider
  // has to cross the generated module's boundary — the same "genuinely
  // shared" case module-resource exports are for.
  exports: [JOB_DISPATCH_SERVICE_TOKEN],
  operations: (op) => ({
    generate: op.write({
      status: 202,
      input: z.object({ reportId: z.string() }),
      output: z.object({ jobId: z.string() }),
      handler: GenerateReportHandler,
    }),
  }),
});

describe('job dispatch — 202 + job id over operationResource (e2e, issue #53)', () => {
  let app: INestApplication;
  let dispatcher: InProcessJobDispatchService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(OpenAuthProvider),
          providers: [OpenAuthProvider],
          resources: [ops],
          global: true,
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    dispatcher = app.get(JOB_DISPATCH_SERVICE_TOKEN);
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  /**
   * Drains and completes every OTHER pending job first — tests share one
   * dispatcher instance, so a job an earlier test enqueued but never
   * claimed would otherwise be first in line here.
   */
  async function claimAndComplete(
    jobId: string,
  ): Promise<Awaited<ReturnType<InProcessJobDispatchService['claim']>>> {
    for (let i = 0; i < 20; i++) {
      const claimed = await dispatcher.claim(['generate-report']);
      if (claimed === undefined) return undefined;
      await dispatcher.complete(claimed.jobId);
      if (claimed.jobId === jobId) return claimed;
    }
    throw new Error(`claimAndComplete: never saw jobId "${jobId}"`);
  }

  it('returns 202 with a job id without running the work inline', async () => {
    const res = await request(app.getHttpServer())
      .post('/reports/generate')
      .send({ reportId: 'r1' })
      .expect(202);

    expect(res.body.jobId).toEqual(expect.any(String));
    await claimAndComplete(res.body.jobId);
  });

  it('a worker can claim, process, and complete the enqueued job', async () => {
    const created = await request(app.getHttpServer())
      .post('/reports/generate')
      .send({ reportId: 'r2' })
      .expect(202);

    const claimed = await claimAndComplete(created.body.jobId);

    expect(claimed?.jobId).toBe(created.body.jobId);
    expect(claimed?.payload).toEqual({ reportId: 'r2' });
  });

  it('two requests for the same report dedupe to one job', async () => {
    const first = await request(app.getHttpServer())
      .post('/reports/generate')
      .send({ reportId: 'r3-dedupe' })
      .expect(202);
    const second = await request(app.getHttpServer())
      .post('/reports/generate')
      .send({ reportId: 'r3-dedupe' })
      .expect(202);

    expect(second.body.jobId).toBe(first.body.jobId);
  });
});
