import { describe, it, expect } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { whitelistedFromDto } from './whitelisted-from-dto.util';

describe('whitelistedFromDto', () => {
  class UserMetadataShapeDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    bio?: string;
  }

  it('keeps only DTO fields (class-validator whitelist) and drops extra keys', async () => {
    const out = await whitelistedFromDto(UserMetadataShapeDto, {
      name: 'A',
      ussdserId: 'b9378e1f-4274-4315-8bf9-baa6ce9481',
      notOnDto: 99,
    } as object);

    expect(out).toEqual({ name: 'A' });
    expect('ussdserId' in out).toBe(false);
    expect('notOnDto' in out).toBe(false);
  });

  it('applies class-validator rules and throws BadRequestException on failure', async () => {
    class StrictEmailDto {
      @IsEmail()
      email!: string;
    }

    await expect(
      whitelistedFromDto(StrictEmailDto, { email: 'nope' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('succeeds when the payload matches the DTO', async () => {
    const out = await whitelistedFromDto(UserMetadataShapeDto, {
      name: 'B',
      bio: 'c',
    });

    expect(out).toEqual({ name: 'B', bio: 'c' });
  });

  it('skipMissingProperties allows empty object when all fields optional', async () => {
    const out = await whitelistedFromDto(UserMetadataShapeDto, {});
    expect(out).toEqual({});
  });

  it('validates non-optional DTO properties (present but empty fails @IsNotEmpty)', async () => {
    class WithRequiredIdDto {
      @IsNotEmpty()
      @IsString()
      id!: string;
    }

    await expect(
      whitelistedFromDto(WithRequiredIdDto, { id: '' } as object),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('validates format when decorators demand it (UUID example)', async () => {
    class UuidFieldDto {
      @IsOptional()
      @IsUUID('4')
      userId?: string;
    }

    await expect(
      whitelistedFromDto(UuidFieldDto, { userId: 'not-a-uuid' }),
    ).rejects.toBeInstanceOf(BadRequestException);

    const ok = await whitelistedFromDto(UuidFieldDto, {
      userId: 'b9378e1f-4274-4315-8bf9-baa6ce948100',
    });
    expect(ok).toEqual({ userId: 'b9378e1f-4274-4315-8bf9-baa6ce948100' });
  });

  it('accepts callable Standard Schema implementations', async () => {
    const callableSchema: StandardSchemaV1<unknown, { name: string }> &
      (() => void) = Object.assign(() => undefined, {
      '~standard': {
        validate(value: unknown) {
          if (
            typeof value === 'object' &&
            value !== null &&
            'name' in value &&
            typeof value.name === 'string'
          ) {
            return { value: { name: value.name.trim() } };
          }

          return { issues: [{ message: 'Expected a name.' }] };
        },
        vendor: 'callable-test',
        version: 1 as const,
      },
    });

    class CallableSchemaDto {
      static readonly schema = callableSchema;
    }

    await expect(
      whitelistedFromDto(CallableSchemaDto, {
        extra: 'strip me',
        name: '  Ada  ',
      }),
    ).resolves.toEqual({ name: 'Ada' });
  });
});
