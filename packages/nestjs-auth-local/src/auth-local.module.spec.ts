import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AccessTokenInterface,
  AuthenticationModule,
  CredentialLookupInterface,
  GetUserServiceInterface,
  IssueTokenServiceInterface,
} from '@rockts-org/nestjs-authentication';
import { AuthLocalController } from '.';
import { AuthLocalModule } from './auth-local.module';

const USERNAME = 'TestLookupUsername';

@Injectable()
class UserLookup implements GetUserServiceInterface<CredentialLookupInterface> {
  async getUser(): Promise<CredentialLookupInterface> {
    const user: CredentialLookupInterface = {
      id: '1',
      username: USERNAME,
      password: '$2b$10$9y97gOLiusyKnzu7LRdMmOCVpp/xwddaa8M6KtgenvUDao5I.8mJS',
      salt: '$2b$10$9y97gOLiusyKnzu7LRdMmO',
    };
    return new Promise<CredentialLookupInterface>((resolve) => {
      resolve(user);
    });
  }
}

@Injectable()
class IssueToken implements IssueTokenServiceInterface {
  async issueAccessToken(): Promise<AccessTokenInterface> {
    const accessToken: AccessTokenInterface = {
      accessToken: 'accessToken',
      expireIn: new Date(),
    };
    return new Promise<AccessTokenInterface>((resolve) => {
      resolve(accessToken);
    });
  }
}

describe('AuthLocalModuleTest', () => {
  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthenticationModule.forRoot({
          global: true,
          //maxPasswordAttempts: 3,
          //minPasswordStrength: PasswordStrengthEnum.VeryStrong,
        }),
        AuthLocalModule.forRoot({
          getUserService: UserLookup,
          issueTokenService: IssueToken,
        }),
      ],
    }).compile();

    const controller = module.get<AuthLocalController>(AuthLocalController);

    expect(controller).toBeDefined();
  });
});
