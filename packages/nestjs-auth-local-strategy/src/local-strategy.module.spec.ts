import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AccessTokenInterface,
  AuthenticationConfigOptionsInterface,
  AuthenticationModule,
  AuthenticationService,
  CredentialLookupInterface,
  GetUserServiceInterface,
  IssueTokenServiceInterface,
  PasswordStrengthEnum,
} from '@rockts-org/nestjs-authentication';
import { LocalStrategyModule } from './local-strategy.module';
import { LocalStrategyService } from './local-strategy.service';

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
  async issueAccessToken(username: string): Promise<AccessTokenInterface> {
    const accessToken: AccessTokenInterface = {
      accessToken: 'accessToken',
      expireIn: new Date(),
    };
    return new Promise<AccessTokenInterface>((resolve) => {
      resolve(accessToken);
    });
  }
}

describe('LocalStrategyModuleTest', () => {
  let localStrategyService: LocalStrategyService;

  beforeEach(async () => {});

  afterEach(async () => {
    jest.clearAllMocks();
  });

  /**
   * Check if localStrategyService was injected and works fine
   */
  it('Is localStrategyService Defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        // AuthenticationModule.forRootAsync({
        //   config: {
        //     inject: null,
        //     useFactory: async (): Promise<AuthenticationConfigOptionsInterface> => {
        //       // overwrite config
        //       const config: AuthenticationConfigOptionsInterface = {
        //         maxPasswordAttempts: 3,
        //         minPasswordStrength: PasswordStrengthEnum.VeryStrong,
        //       };
        //       return config;
        //     },
        //   },
        // }),
        LocalStrategyModule.forRoot({
          imports: [
            AuthenticationModule.forRoot({
              config: {
                maxPasswordAttempts: 3,
                minPasswordStrength: PasswordStrengthEnum.VeryStrong,
              },
            }),
          ],
          getUserService: UserLookup,
          issueTokenService: IssueToken,
        }),
      ],
    }).compile();

    localStrategyService =
      module.get<LocalStrategyService>(LocalStrategyService);

    expect(localStrategyService).toBeDefined();
  });
});
