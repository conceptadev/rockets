/**
 * Compile-only checks: `yarn test:typetests` / `tsc -p tsconfig.typetest.json`.
 * Excluded from the production build via `tsconfig.json`.
 */
import { z } from 'zod';

import { createStandardSchemaDto } from './create-standard-schema-dto';
import { createStandardSchemaResponseDto } from './create-standard-schema-response-dto';
import { StandardSchemaResponse } from './standard-schema-response.decorator';
import { ApiStandardSchemaResponse } from './swagger/api-standard-schema-response.decorator';

const TransformingSchema = z.object({
  publishedAt: z.date().transform((value) => value.toISOString()),
});

class RequestDto extends createStandardSchemaDto(TransformingSchema) {}
class ResponseDto extends createStandardSchemaResponseDto(TransformingSchema) {}

const requestValue: RequestDto = {
  publishedAt: '2026-08-19T00:00:00.000Z',
};
const responseValue: ResponseDto = {
  publishedAt: new Date('2026-08-19T00:00:00.000Z'),
};

void requestValue;
void responseValue;

const invalidRequestValue: RequestDto = {
  // @ts-expect-error — request handlers receive the parsed schema output
  publishedAt: new Date('2026-08-19T00:00:00.000Z'),
};
const invalidResponseValue: ResponseDto = {
  // @ts-expect-error — response handlers return the schema input
  publishedAt: '2026-08-19T00:00:00.000Z',
};

void invalidRequestValue;
void invalidResponseValue;

void StandardSchemaResponse(ResponseDto);
void ApiStandardSchemaResponse(ResponseDto);

// @ts-expect-error — request DTO output is not a response-handler input carrier
void StandardSchemaResponse(RequestDto);
// @ts-expect-error — Swagger responses require response DTO carriers
void ApiStandardSchemaResponse(RequestDto);

// @ts-expect-error — DTO carriers represent whole-object contracts
void createStandardSchemaDto(z.string());
// @ts-expect-error — response DTO carriers accept whole-object handler values
void createStandardSchemaResponseDto(z.string());
// @ts-expect-error — whole-array requests use explicit route schema metadata
void createStandardSchemaDto(z.array(z.string()));
// @ts-expect-error — native response serialization applies DTO schemas per item
void createStandardSchemaResponseDto(z.array(z.string()));
