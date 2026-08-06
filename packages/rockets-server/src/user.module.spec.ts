import { vi, type Mocked, describe, it, expect } from 'vitest';
import { DynamicModule, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getDynamicRepositoryToken } from '@concepta/rockets-core';
import { CqrsModule } from '@nestjs/cqrs';
import { UserModule } from './user.module';
import { MeController } from './gateways/http/me.controller';
import {
  USER_METADATA_MODULE_ENTITY_KEY,
  UpsertUserMetadataHandler,
  GetUserMetadataHandler,
} from '@concepta/rockets-core';
import {
  RAW_OPTIONS_TOKEN,
  ROCKETS_USER_METADATA_DTO_TOKEN,
} from './rockets.tokens';
import type { RocketsOptions } from './rockets.module-definition';
import { StubUserMetadataEntity } from './__fixtures__/entities/stub-user-metadata.entity';
import type { RepositoryInterface } from '@concepta/rockets-core';
import type { UserMetadataEntityInterface } from '@concepta/rockets-core';

class MetadataCreateDto {
  userId!: string;
}

class MetadataUpdateDto {
  id!: string;
}

function rocketsOptionsFixture(): RocketsOptions {
  return {
    settings: {},
    userMetadata: {
      entity: StubUserMetadataEntity,
      createDto: MetadataCreateDto,
      updateDto: MetadataUpdateDto,
    },
  };
}

function metadataRepositoryFixture(): Mocked<
  RepositoryInterface<UserMetadataEntityInterface>
> {
  return {
    entityName: 'UserMetadata',
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    remove: vi.fn(),
    find: vi.fn(),
    merge: vi.fn(),
    gt: vi.fn(),
    gte: vi.fn(),
    lt: vi.fn(),
    lte: vi.fn(),
  } as unknown as Mocked<RepositoryInterface<UserMetadataEntityInterface>>;
}

@Module({})
class UserModuleTestHarnessModule {
  static forTest(
    options: RocketsOptions,
    repo: Mocked<RepositoryInterface<UserMetadataEntityInterface>>,
  ): DynamicModule {
    return {
      module: UserModuleTestHarnessModule,
      global: true,
      imports: [CqrsModule.forRoot()],
      providers: [
        { provide: RAW_OPTIONS_TOKEN, useValue: options },
        {
          // MeController reads only the narrowed DTO config token.
          provide: ROCKETS_USER_METADATA_DTO_TOKEN,
          useValue: {
            updateDto: options.userMetadata?.updateDto,
          },
        },
        {
          provide: getDynamicRepositoryToken(USER_METADATA_MODULE_ENTITY_KEY),
          useValue: repo,
        },
        UpsertUserMetadataHandler,
        GetUserMetadataHandler,
      ],
      exports: [
        RAW_OPTIONS_TOKEN,
        ROCKETS_USER_METADATA_DTO_TOKEN,
        getDynamicRepositoryToken(USER_METADATA_MODULE_ENTITY_KEY),
      ],
    };
  }
}

describe('UserModule', () => {
  it('register() loads MeController', async () => {
    const options = rocketsOptionsFixture();
    const repo = metadataRepositoryFixture();

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        UserModuleTestHarnessModule.forTest(options, repo),
        UserModule.register(),
      ],
    }).compile();

    expect(moduleRef.get(MeController)).toBeInstanceOf(MeController);
  });
});
