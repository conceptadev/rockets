import { describe, expect, it } from 'vitest';
import type { OpenAPIObject } from '@nestjs/swagger';
import { liftInlineRequestBodyDefinitions } from './lift-inline-definitions';

function documentWithBody(schema: Record<string, unknown>): OpenAPIObject {
  return {
    openapi: '3.0.0',
    info: { title: 't', version: '1' },
    paths: {
      '/admin/users/{id}': {
        patch: {
          responses: {},
          requestBody: {
            content: { 'application/json': { schema } },
          },
        },
      },
    },
    components: { schemas: {} },
  };
}

describe('liftInlineRequestBodyDefinitions', () => {
  it('lifts nested definitions into components and rewrites the refs', () => {
    const doc = documentWithBody({
      type: 'object',
      properties: {
        userMetadata: { $ref: '#/definitions/UserMetadataUpdateDto' },
      },
      definitions: {
        UserMetadataUpdateDto: {
          type: 'object',
          properties: { nick: { $ref: '#/definitions/Nick' } },
        },
        Nick: { type: 'string' },
      },
    });

    const lifted = liftInlineRequestBodyDefinitions(doc);

    const body = lifted.paths['/admin/users/{id}'].patch?.requestBody as {
      content: Record<string, { schema: Record<string, unknown> }>;
    };
    expect(body.content['application/json'].schema).toEqual({
      type: 'object',
      properties: {
        userMetadata: { $ref: '#/components/schemas/UserMetadataUpdateDto' },
      },
    });
    expect(lifted.components?.schemas?.UserMetadataUpdateDto).toEqual({
      type: 'object',
      properties: { nick: { $ref: '#/components/schemas/Nick' } },
    });
    expect(lifted.components?.schemas?.Nick).toEqual({ type: 'string' });
  });

  it('keeps an already registered component untouched', () => {
    const doc = documentWithBody({
      type: 'object',
      properties: { userMetadata: { $ref: '#/$defs/UserMetadataUpdateDto' } },
      $defs: { UserMetadataUpdateDto: { type: 'object' } },
    });
    const registered = { type: 'object', additionalProperties: false };
    doc.components = { schemas: { UserMetadataUpdateDto: registered } };

    const lifted = liftInlineRequestBodyDefinitions(doc);

    expect(lifted.components?.schemas?.UserMetadataUpdateDto).toBe(registered);
  });

  it('returns the same document when no body carries definitions', () => {
    const doc = documentWithBody({ type: 'object' });
    expect(liftInlineRequestBodyDefinitions(doc)).toBe(doc);
  });
});
