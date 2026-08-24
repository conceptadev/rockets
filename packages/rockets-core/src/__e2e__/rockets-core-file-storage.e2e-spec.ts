import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  Inject,
  Injectable,
  INestApplication,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import { z } from 'zod';
import request from 'supertest';

import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '../domain/interfaces/auth-adapter.interface';
import { extractBearerToken } from '../infrastructure/auth/extract-bearer-token';
import { RocketsCoreModule } from '../rockets-core.module';
import { AuthServerGuard } from '../infrastructure/guards/auth-server.guard';
import { defineAuthAdapter } from '../infrastructure/auth/define-auth-adapter';
import { operationResource } from '../zod/zod-operation-resource';
import type { OperationContext } from '../domain/interfaces/operation-resource.interface';
import {
  FILE_STORAGE_SERVICE_TOKEN,
  type FileStorageDescriptor,
  type FileStorageServiceInterface,
} from '../domain/interfaces/file-storage.interface';

@Injectable()
class SimpleAuthProvider implements AuthAdapterInterface {
  async authenticate(req: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(req);
    if (token === null) return { matched: false };
    if (token === 'ok') return { matched: true, user: { id: 'u1', sub: 'u1' } };
    return { matched: true, error: new UnauthorizedException() };
  }
}

/**
 * Reference adapter for the seam under test — never touches an HTTP
 * request. The point of the pattern: this could be swapped for real S3 /
 * GCS calls without the operation below changing at all.
 */
@Injectable()
class InMemoryFileStorageService implements FileStorageServiceInterface {
  getUploadUrl(file: FileStorageDescriptor): string {
    return `memory://upload/${file.key}?mime=${encodeURIComponent(
      file.mimeType,
    )}&size=${file.size}`;
  }

  getDownloadUrl(file: FileStorageDescriptor): string {
    return `memory://download/${file.key}`;
  }
}

const MAX_BYTES = 5_000_000;
const ALLOWED_MIME = ['image/png', 'image/jpeg', 'application/pdf'] as const;

interface StoredFile {
  readonly id: string;
  readonly key: string;
  readonly mimeType: string;
  readonly size: number;
}

const files = new Map<string, StoredFile>();

interface CreateFileInput {
  readonly name: string;
  readonly mimeType: string;
  readonly size: number;
}

/**
 * A handler CLASS, not a function: `ctx` carries no DI resolver
 * (`OperationContext` doc — "register them as providers on the resource
 * and inject them into a handler class"), so the storage service comes in
 * through the constructor, the same as any other Nest provider.
 */
@Injectable()
class CreateUploadHandler {
  constructor(
    @Inject(FILE_STORAGE_SERVICE_TOKEN)
    private readonly storage: FileStorageServiceInterface,
  ) {}

  async handle(ctx: OperationContext<CreateFileInput>) {
    const id = randomUUID();
    const key = `uploads/${id}`;
    const uploadUrl = await this.storage.getUploadUrl({
      key,
      mimeType: ctx.input.mimeType,
      size: ctx.input.size,
    });
    files.set(id, {
      id,
      key,
      mimeType: ctx.input.mimeType,
      size: ctx.input.size,
    });
    return { id, uploadUrl };
  }
}

const uploadOps = operationResource({
  path: 'uploads',
  public: true,
  providers: [
    {
      provide: FILE_STORAGE_SERVICE_TOKEN,
      useClass: InMemoryFileStorageService,
    },
  ],
  operations: (op) => ({
    // Boundary validation via the schema itself — an oversized or
    // disallowed-mime request 400s BEFORE the storage service is ever
    // called, per #86's "typed limits validated at the boundary" ask.
    create: op.write({
      status: 201,
      input: z.object({
        name: z.string().min(1),
        mimeType: z.enum(ALLOWED_MIME),
        size: z.number().int().positive().max(MAX_BYTES),
      }),
      output: z.object({
        id: z.string(),
        uploadUrl: z.string(),
      }),
      handler: CreateUploadHandler,
    }),
  }),
});

describe('file storage seam — presigned upload/download URLs (e2e, issue #86)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        RocketsCoreModule.forRoot({
          auth: defineAuthAdapter(SimpleAuthProvider),
          providers: [SimpleAuthProvider],
          resources: [uploadOps],
          global: true,
        }),
      ],
      providers: [{ provide: APP_GUARD, useClass: AuthServerGuard }],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('mints an upload URL and never touches the request body itself', async () => {
    const res = await request(app.getHttpServer())
      .post('/uploads/create')
      .send({ name: 'photo.png', mimeType: 'image/png', size: 1024 })
      .expect(201);

    expect(res.body.id).toEqual(expect.any(String));
    expect(res.body.uploadUrl).toContain(
      `memory://upload/uploads/${res.body.id}`,
    );
    expect(files.get(res.body.id)).toMatchObject({
      mimeType: 'image/png',
      size: 1024,
    });
  });

  it('rejects an oversized file at the boundary — storage is never called', async () => {
    const before = files.size;

    await request(app.getHttpServer())
      .post('/uploads/create')
      .send({ name: 'huge.png', mimeType: 'image/png', size: MAX_BYTES + 1 })
      .expect(400);

    expect(files.size).toBe(before);
  });

  it('rejects a disallowed mime type at the boundary', async () => {
    await request(app.getHttpServer())
      .post('/uploads/create')
      .send({ name: 'script.sh', mimeType: 'application/x-sh', size: 10 })
      .expect(400);
  });
});
