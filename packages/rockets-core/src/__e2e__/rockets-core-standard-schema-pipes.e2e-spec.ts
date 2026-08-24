/**
 * Issue #83 — the combination no suite booted: a hand-written controller
 * with schema-carrying DTOs under a global class-validator
 * `ValidationPipe({ whitelist: true })`.
 *
 * The trap: the whitelist strips every property without class-validator
 * metadata, so a body ALREADY validated by the schema arrives at the
 * handler as `{}` — silently, with a success status. Worse than the loud
 * manual parsing it replaces, because the success signal is what makes
 * a consumer delete their safety net.
 */
import { describe, it, expect, afterEach } from 'vitest';
import {
  Body,
  Controller,
  INestApplication,
  Module,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { createZodDto } from 'nestjs-zod';
import request from 'supertest';
import { z } from 'zod';

import {
  allowStandardSchemaKeys,
  StandardSchemaAwareValidationPipe,
  StandardSchemaDtoValidationPipe,
} from '../standard-schema';
import { compileDtoClass } from '../zod/zod-dto';

const echoSchema = z.object({
  name: z.string().min(1),
  note: z.string().optional(),
});

/** Bare nestjs-zod DTO — exactly what the field report used. */
class BareZodDto extends createZodDto(echoSchema) {}

/** Same DTO, stamped: survives ANYONE's whitelist pipe. */
class StampedZodDto extends createZodDto(echoSchema) {}
allowStandardSchemaKeys(StampedZodDto);

/**
 * Rockets' own generated DTO — stamped by `compileDtoClass` itself.
 *
 * The subclass matters: `compileDtoClass` returns a VALUE, and a
 * type-level reference (`InstanceType<typeof X>`) emits `Object` into
 * `design:paramtypes` — a metatype every pipe skips, which made the
 * first version of this test pass with the stamp deleted. The subclass
 * is a real class reference, so the pipe actually sees the DTO, and
 * class-validator reads the stamp through inheritance.
 */
const GeneratedBase = compileDtoClass(echoSchema, 'PipeProbeGeneratedDto');
class GeneratedBodyDto extends (GeneratedBase as new () => object) {}

/** Transforming schema: parse output differs from parse input. */
class TagsDto extends createZodDto(
  z.object({ tags: z.string().transform((value) => value.split(',')) }),
) {}

/** The ambiguous shape: a schema AND a real constraint. */
class BothWorldsDto extends createZodDto(echoSchema) {
  @IsString()
  declare name: string;
}

@Controller('echo')
@ApiTags('Echo')
class EchoController {
  @Post('bare')
  @ApiCreatedResponse({ description: 'Echo bare' })
  bare(@Body() body: BareZodDto): unknown {
    return { got: body };
  }

  @Post('stamped')
  @ApiCreatedResponse({ description: 'Echo stamped' })
  stamped(@Body() body: StampedZodDto): unknown {
    return { got: body };
  }

  @Post('generated')
  @ApiCreatedResponse({ description: 'Echo generated' })
  generated(@Body() body: GeneratedBodyDto): unknown {
    return { got: body };
  }

  @Post('tags')
  @ApiCreatedResponse({ description: 'Echo tags' })
  tags(@Body() body: TagsDto): unknown {
    return { got: body };
  }

  @Post('both')
  @ApiCreatedResponse({ description: 'Echo both' })
  both(@Body() body: BothWorldsDto): unknown {
    return { got: body };
  }
}

async function boot(pipes: readonly unknown[]): Promise<INestApplication> {
  @Module({
    controllers: [EchoController],
    providers: pipes.map((pipe) => ({ provide: APP_PIPE, useValue: pipe })),
  })
  class TestModule {}
  const moduleRef = await Test.createTestingModule({
    imports: [TestModule],
  }).compile();
  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

describe('schema DTOs under class-validator whitelist pipes (#83)', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) await app.close();
    app = undefined as unknown as INestApplication;
  });

  // The field report's exact configuration, pinned as-is: this is what
  // the fixes exist to escape, and if an upstream change ever makes it
  // safe, this test says so.
  it('PINS the trap: an unstamped DTO under a plain whitelist pipe is emptied', async () => {
    app = await boot([
      new StandardSchemaDtoValidationPipe(),
      // eslint-disable-next-line @darraghor/nestjs-typed/should-specify-forbid-unknown-values -- reproduces the exact pipe options from the #83 field report; adding forbidUnknownValues would change the behaviour under test
      new ValidationPipe({ transform: true, whitelist: true }),
    ]);
    const res = await request(app.getHttpServer())
      .post('/echo/bare')
      .send({ name: 'x', note: 'kept?' })
      .expect(201);
    expect(res.body.got).toEqual({});
  });

  it('escape 1 — stamping the DTO survives a PLAIN whitelist pipe', async () => {
    app = await boot([
      new StandardSchemaDtoValidationPipe(),
      // eslint-disable-next-line @darraghor/nestjs-typed/should-specify-forbid-unknown-values -- reproduces the exact pipe options from the #83 field report; adding forbidUnknownValues would change the behaviour under test
      new ValidationPipe({ transform: true, whitelist: true }),
    ]);
    const res = await request(app.getHttpServer())
      .post('/echo/stamped')
      .send({ name: 'x', note: 'kept' })
      .expect(201);
    expect(res.body.got).toEqual({ name: 'x', note: 'kept' });
  });

  it('escape 1 covers Rockets generated DTOs out of the box', async () => {
    app = await boot([
      new StandardSchemaDtoValidationPipe(),
      // eslint-disable-next-line @darraghor/nestjs-typed/should-specify-forbid-unknown-values -- reproduces the exact pipe options from the #83 field report; adding forbidUnknownValues would change the behaviour under test
      new ValidationPipe({ transform: true, whitelist: true }),
    ]);
    const res = await request(app.getHttpServer())
      .post('/echo/generated')
      .send({ name: 'x' })
      .expect(201);
    expect(res.body.got).toEqual({ name: 'x' });
  });

  it('escape 2 — the aware pipe validates schema DTOs itself', async () => {
    app = await boot([
      new StandardSchemaDtoValidationPipe(),
      new StandardSchemaAwareValidationPipe({
        transform: true,
        whitelist: true,
      }),
    ]);
    const res = await request(app.getHttpServer())
      .post('/echo/bare')
      .send({ name: 'x', note: 'kept' })
      .expect(201);
    expect(res.body.got).toEqual({ name: 'x', note: 'kept' });
  });

  // Recognition itself (issue half a): bare nestjs-zod DTOs are now
  // VALIDATED by the Standard Schema pipe — brand-only recognition
  // silently skipped them.
  it('the DTO pipe validates a bare nestjs-zod DTO', async () => {
    app = await boot([new StandardSchemaDtoValidationPipe()]);
    await request(app.getHttpServer())
      .post('/echo/bare')
      .send({ name: '' })
      .expect(400);
  });

  // Would have caught the detector comparing against the wrong
  // class-validator type string: a stamped DTO under the aware pipe
  // must be skipped as schema-validated, not rejected as ambiguous.
  it('the aware pipe does not mistake Rockets stamps for real constraints', async () => {
    app = await boot([
      new StandardSchemaDtoValidationPipe(),
      new StandardSchemaAwareValidationPipe({
        transform: true,
        whitelist: true,
      }),
    ]);
    const res = await request(app.getHttpServer())
      .post('/echo/stamped')
      .send({ name: 'x', note: 'kept' })
      .expect(201);
    expect(res.body.got).toEqual({ name: 'x', note: 'kept' });
  });

  it('rejects the ambiguous both-schema-and-constraints DTO loudly', async () => {
    app = await boot([
      new StandardSchemaDtoValidationPipe(),
      new StandardSchemaAwareValidationPipe({
        transform: true,
        whitelist: true,
      }),
    ]);
    const res = await request(app.getHttpServer())
      .post('/echo/both')
      .send({ name: 'x' })
      .expect(500);
    expect(res.body.message).toMatch(/BOTH a Standard Schema/);
  });
});
// ── The aware pipe ALONE — the case the first draft got fatally wrong ──
//
// The skip-only draft assumed "something upstream validated them"
// without checking: used standalone (exactly how the README presented
// it), `{ name: '', evil: 'x' }` reached the handler untouched with a
// 201 — a total validation bypass, worse than the bug being fixed.
// These pin that the pipe VALIDATES what it recognises.

describe('StandardSchemaAwareValidationPipe standalone (#83 M1)', () => {
  let app: INestApplication;

  afterEach(async () => {
    if (app) await app.close();
    app = undefined as unknown as INestApplication;
  });

  it('rejects an invalid body with no other pipe registered', async () => {
    app = await boot([
      new StandardSchemaAwareValidationPipe({
        transform: true,
        whitelist: true,
        forbidUnknownValues: true,
      }),
    ]);
    await request(app.getHttpServer())
      .post('/echo/bare')
      .send({ name: '' })
      .expect(400);
  });

  it('strips unknown keys via the schema, not the whitelist', async () => {
    app = await boot([
      new StandardSchemaAwareValidationPipe({
        transform: true,
        whitelist: true,
        forbidUnknownValues: true,
      }),
    ]);
    const res = await request(app.getHttpServer())
      .post('/echo/bare')
      .send({ name: 'x', evil: 'injected' })
      .expect(201);
    expect(res.body.got).toEqual({ name: 'x' });
  });

  // Why the docs say "register EXACTLY ONE": pairing parses twice, and
  // a TRANSFORMING schema is not idempotent. The first draft pinned
  // "idempotence" with a non-transforming schema — an assertion
  // satisfied by a case that cannot fail. This pins the real hazard.
  it('pairing double-parses: a transforming schema rejects its own output', async () => {
    app = await boot([
      new StandardSchemaDtoValidationPipe(),
      new StandardSchemaAwareValidationPipe({
        transform: true,
        whitelist: true,
        forbidUnknownValues: true,
      }),
    ]);
    // split(',') turns the string into an array; the second parse then
    // receives an array where it expects a string.
    await request(app.getHttpServer())
      .post('/echo/tags')
      .send({ tags: 'a,b' })
      .expect(400);
  });

  it('the same transforming schema works with exactly one pipe', async () => {
    app = await boot([
      new StandardSchemaAwareValidationPipe({
        transform: true,
        whitelist: true,
        forbidUnknownValues: true,
      }),
    ]);
    const res = await request(app.getHttpServer())
      .post('/echo/tags')
      .send({ tags: 'a,b' })
      .expect(201);
    expect(res.body.got).toEqual({ tags: ['a', 'b'] });
  });

  // F3: the outer pipe's status option must reach schema failures too —
  // a uniform 422 contract must not silently split by DTO kind.
  it('errorHttpStatusCode applies to schema carriers', async () => {
    app = await boot([
      new StandardSchemaAwareValidationPipe({
        transform: true,
        whitelist: true,
        forbidUnknownValues: true,
        errorHttpStatusCode: 422,
      }),
    ]);
    await request(app.getHttpServer())
      .post('/echo/bare')
      .send({ name: '' })
      .expect(422);
  });
});
