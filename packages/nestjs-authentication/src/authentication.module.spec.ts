import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticationModule } from './authentication.module';
import { authenticationConfig } from './config/authentication.config';
import { PasswordStrengthEnum } from './enum/password-strength.enum';
import { AccessTokenInterface } from './interfaces/access-token.interface';
import { CredentialLookupInterface } from './interfaces/credential-lookup.interface';
import { CredentialLookupServiceInterface } from './interfaces/credential-lookup-service.interface';
import { AuthenticationOptionsInterface } from './interfaces/authentication-options.interface';
import { AuthenticationAsyncOptionsInterface } from './interfaces/authentication-options.interface';

const USERNAME = 'TestLookupUsername';
const ACCESS_TOKEN = 'TestLookup_AccessToken';

@Injectable()
class InjectTest {
  getInfo() {
    return 'info';
  }
}

@Injectable()
class UserLookup implements CredentialLookupServiceInterface {
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

  async issueAccessToken(): Promise<AccessTokenInterface> {
    return new Promise<AccessTokenInterface>((resolve) => {
      resolve({
        accessToken: ACCESS_TOKEN,
        expireIn: new Date(),
      });
    });
  }

  async refreshToken(): Promise<AccessTokenInterface> {
    return new Promise<AccessTokenInterface>((resolve) => {
      resolve({
        accessToken: ACCESS_TOKEN,
        expireIn: new Date(),
      });
    });
  }
}

@Injectable()
class TestLookupInjected extends UserLookup {
  //@typescript-eslint/no-unused-vars
  constructor(private injectTest: InjectTest) {
    super();
  }

  getInfo(): string {
    return this.injectTest.getInfo();
  }
}

@Module({
  providers: [InjectTest, UserLookup, TestLookupInjected],
  exports: [InjectTest, UserLookup, TestLookupInjected],
})
export class TestModule {}

describe('AuthenticationModule', () => {
  let testLookupInjected: TestLookupInjected;
  let config: AuthenticationOptionsInterface;
  let configAsync: AuthenticationAsyncOptionsInterface;

  beforeEach(async () => {
    config = await authenticationConfig();

    configAsync = {
      inject: [authenticationConfig.KEY],
      useFactory: async (
        config: AuthenticationAsyncOptionsInterface,
      ): Promise<AuthenticationOptionsInterface> => {
        // overwrite config
        return {
          ...config,
          minPasswordStrength: PasswordStrengthEnum.VeryStrong,
        };
      },
    };
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  /**
   * Check if TestLookupInjected was injected and works fine
   */
  it('Is TestLookupInjected Defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [TestModule],
    }).compile();

    testLookupInjected = module.get<TestLookupInjected>(TestLookupInjected);

    expect(testLookupInjected).toBeDefined();
    expect(testLookupInjected.getInfo()).toBe('info');
  });

  it('AuthenticationModule.Authenticate.forRoot.fail', async () => {
    let failed = false;
    try {
      await Test.createTestingModule({
        imports: [AuthenticationModule.forRoot(config)],
      }).compile();
    } catch (err) {
      failed = true;
    }

    expect(failed).toBeTruthy();
  });

  it('AuthenticationModule.Authenticate.forRootAsync.fail', async () => {
    let failed = false;
    try {
      await Test.createTestingModule({
        imports: [AuthenticationModule.forRootAsync(configAsync)],
      }).compile();
    } catch (err) {
      failed = true;
    }

    expect(failed).toBeTruthy();
  });

  it('AuthenticationModule.Authenticate.forRoot.fail_2', async () => {
    let failed = false;
    try {
      await Test.createTestingModule({
        imports: [AuthenticationModule.forRoot(config)],
      }).compile();
    } catch (err) {
      failed = true;
    }

    expect(failed).toBeTruthy();
  });

  it('AuthenticationModule.Authenticate.forRootAsync.fail_2', async () => {
    let failed = false;
    try {
      await Test.createTestingModule({
        imports: [AuthenticationModule.forRootAsync(configAsync)],
      }).compile();
    } catch (err) {
      failed = true;
    }

    expect(failed).toBeTruthy();
  });

  it('AuthenticationModule.Authenticate.forRoot.fail_3', async () => {
    let failed = false;
    try {
      await Test.createTestingModule({
        imports: [AuthenticationModule.forRoot(null)],
      }).compile();
    } catch (err) {
      failed = true;
    }

    expect(failed).toBeTruthy();
  });

  it('AuthenticationModule.Authenticate.forRootAsync.fail_3', async () => {
    let failed = false;
    try {
      await Test.createTestingModule({
        imports: [AuthenticationModule.forRootAsync(null)],
      }).compile();
    } catch (err) {
      failed = true;
    }

    expect(failed).toBeTruthy();
  });

  it('AuthenticationModule.Authenticate.forRootAsync.fail_4', async () => {
    let failed = false;
    try {
      await Test.createTestingModule({
        imports: [AuthenticationModule],
      }).compile();
    } catch (err) {
      failed = true;
    }

    expect(failed).toBeTruthy();
  });

  // it('AuthenticationModule.Authenticate.forRootAsync.fail_7', async () => {
  //   let failed = false;

  //   try {
  //     await Test.createTestingModule({
  //       imports: [TestModule, AuthenticationModule.forRootAsync(null)],
  //     }).compile();
  //   } catch (err) {
  //     failed = true;
  //   }

  //   expect(failed).toBeTruthy();
  // });

  // it('AuthenticationModule.Authenticate.forRootAsyncInject', async () => {
  //   let failed = false;
  //   try {
  //     const module: TestingModule = await Test.createTestingModule({
  //       imports: [
  //         AuthenticationModule.forRootAsync({
  //           credentialLookupProvider: {
  //             imports: [],
  //             useFactory: async (injectTest: InjectTest) => {
  //               return new TestLookupInjected(injectTest);
  //             },
  //           },
  //         }),
  //       ],
  //     }).compile();

  //     module.get<TestLookupInjected>(TestLookupInjected);
  //   } catch (err) {
  //     failed = true;
  //   }
  //   expect(failed).toBeTruthy();
  // });

  // it('AuthenticationModule.Authenticate.forRootAsyncInject', async () => {
  //   let failed = false;
  //   try {
  //     const module: TestingModule = await Test.createTestingModule({
  //       imports: [
  //         AuthenticationModule.forRootAsync({
  //           credentialLookupProvider: {
  //             imports: null,
  //             useFactory: async (injectTest: InjectTest) => {
  //               return new TestLookupInjected(injectTest);
  //             },
  //           },
  //         }),
  //       ],
  //     }).compile();

  //     module.get<TestLookupInjected>(TestLookupInjected);
  //   } catch (err) {
  //     failed = true;
  //   }
  //   expect(failed).toBeTruthy();
  // });
});
