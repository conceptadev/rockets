import { Readable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';

import { createMemoryStorageDriver } from './testing/index.js';
import { StorageClient } from './storage.client.js';
import { StorageErrorCode } from './storage.error.js';
import { StorageUploadControl } from './storage-upload-control.js';
import type { StorageObjectMetadata, StoragePlugin } from './storage.types.js';

describe('StorageClient', () => {
  it('streams Node uploads and exposes safe buffered helpers', async () => {
    const client = new StorageClient('media', createMemoryStorageDriver());

    await client.upload(
      'greeting.txt',
      Readable.from(['hello', ' ', Buffer.from('world')]),
      {
        contentType: 'text/plain',
        metadata: { language: 'en' },
      },
    );

    await expect(client.downloadText('greeting.txt')).resolves.toBe(
      'hello world',
    );
    await expect(client.downloadBytes('greeting.txt')).resolves.toEqual(
      new TextEncoder().encode('hello world'),
    );
    await expect(client.head('greeting.txt')).resolves.toMatchObject({
      contentType: 'text/plain',
      key: 'greeting.txt',
      metadata: { language: 'en' },
      size: 11,
    });
  });

  it('enforces the buffer limit while leaving streaming explicit', async () => {
    const client = new StorageClient(
      'media',
      createMemoryStorageDriver({
        adapter: { initial: { 'large.bin': '12345' } },
      }),
    );

    await expect(
      client.downloadBytes('large.bin', { maxBytes: 4 }),
    ).rejects.toMatchObject({
      code: StorageErrorCode.LIMIT_EXCEEDED,
    });

    const object = await client.downloadStream('large.bin');
    expect(object.body).toBeInstanceOf(ReadableStream);
  });

  it('supports ranges, key handles, listing, searching, copy, and move', async () => {
    const client = new StorageClient('media', createMemoryStorageDriver());
    await client.file('photos/one.txt').upload('abcdef');
    await client.file('photos/two.json').upload('{"ok":true}');

    await expect(
      client.downloadText('photos/one.txt', {
        maxBytes: 3,
        range: { start: 1, end: 3 },
      }),
    ).resolves.toBe('bcd');
    await expect(client.file('photos/two.json').text()).resolves.toBe(
      '{"ok":true}',
    );
    await expect(
      client.downloadJson<{ ok: boolean }>('photos/two.json'),
    ).resolves.toEqual({ ok: true });

    const listed = await client.list({
      delimiter: '/',
      prefix: '',
    });
    expect(listed.prefixes).toEqual(['photos/']);

    const matches: StorageObjectMetadata[] = [];
    for await (const object of client.search('photos/*.txt')) {
      matches.push(object);
    }
    expect(matches.map((object) => object.key)).toEqual(['photos/one.txt']);

    await client.copy('photos/one.txt', 'copies/one.txt');
    await client.move('copies/one.txt', 'archive/one.txt');
    await expect(client.exists('copies/one.txt')).resolves.toBe(false);
    await expect(client.exists('archive/one.txt')).resolves.toBe(true);
  });

  it('promotes only through a driver-declared conditional copy capability', async () => {
    const driver = createMemoryStorageDriver();
    const promote = vi.fn(async () => undefined);
    Object.defineProperty(driver, 'capabilities', {
      value: {
        ...driver.capabilities,
        conditionalCopySource: {
          etag: true,
          version: false,
        },
      },
    });
    driver.promote = promote;
    const client = new StorageClient('media', driver);

    await client.file('staging/image.png').promoteTo('final/image.png', {
      sourceEtag: 'verified-etag',
    });
    expect(promote).toHaveBeenCalledWith(
      'staging/image.png',
      'final/image.png',
      { sourceEtag: 'verified-etag' },
    );
    expect(() =>
      client.promote('staging/image.png', 'final/image.png', {
        sourceVersion: 'v1',
      }),
    ).toThrow(
      expect.objectContaining({ code: StorageErrorCode.NOT_SUPPORTED }),
    );
  });

  it('rejects unconditional promotion and unsupported drivers', async () => {
    const client = new StorageClient('media', createMemoryStorageDriver());

    expect(() => client.promote('staging.bin', 'final.bin', {})).toThrow(
      'requires a source or destination precondition',
    );
    expect(() =>
      client.promote('staging.bin', 'final.bin', {
        destination: { type: 'invalid' } as never,
      }),
    ).toThrow(
      expect.objectContaining({ code: StorageErrorCode.INVALID_ARGUMENT }),
    );
    expect(() =>
      client.promote('staging.bin', 'final.bin', { sourceEtag: 'etag' }),
    ).toThrow(
      expect.objectContaining({ code: StorageErrorCode.NOT_SUPPORTED }),
    );
  });

  it('fails conditional mutations closed unless the exact primitive is declared', () => {
    const client = new StorageClient('media', createMemoryStorageDriver());

    expect(() =>
      client.uploadConditional('new.txt', 'new', {
        condition: { type: 'create' },
      }),
    ).toThrow(
      expect.objectContaining({ code: StorageErrorCode.NOT_SUPPORTED }),
    );
    expect(() =>
      client.deleteConditional('old.txt', {
        condition: { etag: 'old-etag' },
      }),
    ).toThrow(
      expect.objectContaining({ code: StorageErrorCode.NOT_SUPPORTED }),
    );
  });

  it('delegates only driver-declared conditional mutations', async () => {
    const driver = createMemoryStorageDriver();
    const uploadConditional = vi.fn(async (key: string) => ({
      contentType: 'text/plain',
      etag: 'next-etag',
      key,
      size: 4,
    }));
    const deleteConditional = vi.fn(async () => undefined);
    Object.defineProperty(driver, 'capabilities', {
      value: {
        ...driver.capabilities,
        conditionalCreate: { resultEtag: true },
        conditionalDelete: { etag: true },
        conditionalReplace: { resultEtag: true },
      },
    });
    driver.uploadConditional = uploadConditional;
    driver.deleteConditional = deleteConditional;
    const client = new StorageClient('media', driver);

    await client.file('note.txt').uploadConditional('next', {
      condition: { etag: 'old-etag', type: 'replace' },
    });
    await client.file('note.txt').deleteConditional({
      condition: { etag: 'next-etag' },
    });

    expect(uploadConditional).toHaveBeenCalledWith('note.txt', 'next', {
      condition: { etag: 'old-etag', type: 'replace' },
    });
    expect(deleteConditional).toHaveBeenCalledWith('note.txt', {
      condition: { etag: 'next-etag' },
    });
  });

  it('rejects non-canonical conditional ETags in every slot before calling a driver', () => {
    const driver = createMemoryStorageDriver();
    const promote = vi.fn();
    const downloadConditional = vi.fn();
    Object.defineProperty(driver, 'capabilities', {
      value: {
        ...driver.capabilities,
        conditionalCopyDestination: {
          atomicWithSource: true,
          create: true,
          replace: true,
        },
        conditionalCopySource: { etag: true, version: false },
        conditionalCreate: { resultEtag: true },
        conditionalDelete: { etag: true },
        conditionalRead: { etag: true, version: false },
        conditionalReplace: { resultEtag: true },
      },
    });
    driver.uploadConditional = vi.fn();
    driver.deleteConditional = vi.fn();
    driver.downloadConditional = downloadConditional;
    driver.promote = promote;
    const client = new StorageClient('media', driver);

    const invalidEtags = [
      '',
      '*',
      'W/"etag"',
      'w/etag',
      '"etag"',
      '"stale","current"',
      'stale,current',
      'etag\\value',
      ' etag',
      'etag ',
      'etag\tvalue',
      'etag\r\nif-match:*',
      'café',
      'x'.repeat(1025),
    ];
    for (const etag of invalidEtags) {
      const calls: Array<() => unknown> = [
        () =>
          client.uploadConditional('note.txt', 'next', {
            condition: { etag, type: 'replace' },
          }),
        () => client.downloadConditional('note.txt', { condition: { etag } }),
        () => client.deleteConditional('note.txt', { condition: { etag } }),
        () =>
          client.promote('source.txt', 'destination.txt', {
            sourceEtag: etag,
          }),
        () =>
          client.promote('source.txt', 'destination.txt', {
            destination: { etag, type: 'replace' },
          }),
      ];
      for (const call of calls) {
        expect(call).toThrow(
          expect.objectContaining({
            code: StorageErrorCode.INVALID_ARGUMENT,
            permanent: true,
          }),
        );
      }
    }

    expect(driver.uploadConditional).not.toHaveBeenCalled();
    expect(driver.deleteConditional).not.toHaveBeenCalled();
    expect(downloadConditional).not.toHaveBeenCalled();
    expect(promote).not.toHaveBeenCalled();
  });

  it('classifies invalid owned options before calling the provider', async () => {
    const client = new StorageClient('media', createMemoryStorageDriver());

    expect(() => client.list({ delimiter: '' })).toThrow(
      'delimiter must be a non-empty string',
    );
    expect(() => client.search('*', { maxResults: 0 })).toThrow(
      'maxResults must be a positive safe integer',
    );
  });

  it('returns ordered bulk results with normalized partial failures', async () => {
    const client = new StorageClient('media', createMemoryStorageDriver());

    const uploaded = await client.uploadMany([
      { body: 'a', key: 'a.txt' },
      { body: 'b', key: 'b.txt' },
    ]);
    expect(uploaded.uploaded.map((result) => result.key)).toEqual([
      'a.txt',
      'b.txt',
    ]);

    const downloaded = await client.downloadMany([
      'a.txt',
      'missing.txt',
      'b.txt',
    ]);
    expect(downloaded.downloaded.map((object) => object.key)).toEqual([
      'a.txt',
      'b.txt',
    ]);
    expect(downloaded.errors).toMatchObject([
      {
        error: { code: StorageErrorCode.NOT_FOUND },
        key: 'missing.txt',
      },
    ]);

    const existence = await client.existsMany(['a.txt', 'missing.txt']);
    expect(existence).toEqual({
      existing: ['a.txt'],
      missing: ['missing.txt'],
    });
  });

  it('runs owned plugins around operations without replacing errors', async () => {
    const events: string[] = [];
    const plugin: StoragePlugin = {
      name: 'audit',
      beforeOperation(context) {
        events.push(`before:${context.operation}`);
      },
      afterOperation(context) {
        events.push(`after:${context.operation}`);
      },
      onError(context) {
        events.push(`error:${context.operation}`);
        throw new Error('observer failed');
      },
    };
    const client = new StorageClient('media', createMemoryStorageDriver(), [
      plugin,
    ]);

    await client.upload('ok.txt', 'ok');
    await expect(client.head('missing.txt')).rejects.toMatchObject({
      code: StorageErrorCode.NOT_FOUND,
    });

    expect(events).toEqual([
      'before:upload',
      'after:upload',
      'before:head',
      'error:head',
    ]);
  });

  it('uses opaque resumable tokens and rejects invalid tokens', () => {
    const control = new StorageUploadControl();
    expect(control.status).toBe('idle');
    expect(control.toJSON()).toBeUndefined();
    expect(() =>
      StorageUploadControl.from({
        format: '@concepta/rockets-storage/resumable',
        session: {},
        version: 1,
      }),
    ).toThrow('Invalid storage resumable-upload token');
  });
});
