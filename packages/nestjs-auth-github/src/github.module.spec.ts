import { mock } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { JwtModule } from '@concepta/nestjs-jwt';
import { GithubController } from './github.controller';
import { GithubModule } from './github.module';
import { GithubCredentialsInterface } from './interfaces/github-credentials.interface';
import { FederatedModule } from '@concepta/nestjs-federated';
import { FederatedEntity } from '@concepta/nestjs-federated/dist/entities/federated.entity';

describe('GithubModuleTest', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        GithubModule.register(),
        AuthenticationModule.register(),
        FederatedModule.register(),
        JwtModule.register(),
      ],
    })
      .overrideProvider('USER_MODULE_USER_ENTITY_REPO_TOKEN')
      .useValue(mock<GithubCredentialsInterface>())
      .overrideProvider('USER_MODULE_USER_CUSTOM_REPO_TOKEN')
      .useValue({})
      .overrideProvider('FEDERATED_MODULE_FEDERATED_ENTITY_REPO_TOKEN')
      .useValue(mock<FederatedEntity>())
      .overrideProvider('FEDERATED_MODULE_FEDERATED_CUSTOM_REPO_TOKEN')
      .useValue({})
      .overrideProvider('FEDERATED_MODULE_USER_LOOKUP_SERVICE_TOKEN')
      .useValue({})
      .overrideProvider('FEDERATED_MODULE_USER_MUTATE_SERVICE_TOKEN')
      .useValue({})
      .compile();

    const controller = module.get(GithubController);
    expect(controller).toBeDefined();
  });
});
