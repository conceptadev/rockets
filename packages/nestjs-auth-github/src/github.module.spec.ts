import { mock } from 'jest-mock-extended';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { JwtModule } from '@concepta/nestjs-jwt';
import { GithubController } from './github.controller';
import { GithubModule } from './github.module';
import { GithubCredentialsInterface } from './interfaces/github-credentials.interface';
import { Injectable } from '@nestjs/common';
import { GithubUserLookupServiceInterface } from './interfaces/github-user-lookup-service.interface';
import { ReferenceId } from '@concepta/nestjs-common';
import { FederatedModule } from '@concepta/nestjs-federated';
import { Federated } from '@concepta/nestjs-federated/dist/entities/federated.entity';

//TODO: we should remove user lookup service from the module
@Injectable()
export class UserLookupServiceFixture
  implements GithubUserLookupServiceInterface
{
  async byUsername(id: ReferenceId): Promise<GithubCredentialsInterface> {
    throw new Error(`Method not implemented, cant get ${id}.`);
  }
}

describe('GithubModuleTest', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserLookupServiceFixture],
      imports: [
        GithubModule.register({
          userLookupService: new UserLookupServiceFixture(),
        }),
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
      .useValue(mock<Federated>())
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
