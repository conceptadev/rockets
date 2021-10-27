import { Injectable, Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticationModule } from './authentication.module';
import { AccessTokenInterface } from './interface/dto/access-token.interface';
import { CredentialLookupInterface } from './interface/dto/credential-lookup.interface';
import { CredentialLookupServiceInterface } from './interface/service/credential-lookup.service.interface';
import { SignController } from './sign.controller';

const USERNAME = 'TestLookupUsername';
const PASSWORD_MEDIUM = 'AS12378';
const ACCESS_TOKEN = 'TestLookup_AccessToken';

@Injectable()
class InjectTest {}

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
}

@Module({
  providers: [InjectTest, UserLookup, TestLookupInjected],
  exports: [InjectTest, UserLookup, TestLookupInjected],
})
export class TestModule {}

describe('AuthenticationModule', () => {
  let controller: SignController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestModule,
        AuthenticationModule.forRoot({
          credentialLookupService: new UserLookup(),
        }),
      ],
    }).compile();

    controller = module.get<SignController>(SignController);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('AuthenticationModule.Authenticate.ForRoot', async () => {
    const authResponse = await controller.authenticate({
      username: USERNAME,
      password: PASSWORD_MEDIUM,
    });

    expect(authResponse.accessToken).toBe(ACCESS_TOKEN);
  });

  it('AuthenticationModule.Authenticate.forRootAsync', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TestModule,
        AuthenticationModule.forRootAsync({
          credentialLookupProvider: {
            imports: [TestModule],
            inject: [InjectTest],
            useFactory: async (injectTest: InjectTest) => {
              return new TestLookupInjected(injectTest);
            },
          },
        }),
      ],
    }).compile();

    controller = module.get<SignController>(SignController);

    const authResponse = await controller.authenticate({
      username: USERNAME,
      password: PASSWORD_MEDIUM,
    });

    expect(authResponse.accessToken).toBe(ACCESS_TOKEN);
  });

  it('AuthenticationModule.Authenticate.forRootAsync.fail', async () => {
    let failed = false;
    try {
      await Test.createTestingModule({
        imports: [
          TestModule,
          AuthenticationModule.forRootAsync({
            credentialLookupProvider: {
              inject: [InjectTest],
              useFactory: async (injectTest: InjectTest) => {
                return new TestLookupInjected(injectTest);
              },
            },
          }),
        ],
      }).compile();
    } catch (err) {
      failed = true;
    }

    expect(failed).toBeTruthy();
  });

  it('AuthenticationModule.Authenticate.forRootAsync.fail_1', async () => {
    let failed = false;
    try {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          AuthenticationModule.forRootAsync({
            credentialLookupProvider: {
              useFactory: async (injectTest: InjectTest) => {
                return new TestLookupInjected(injectTest);
              },
            },
          }),
        ],
      }).compile();

      module.get<TestLookupInjected>(TestLookupInjected);
    } catch (err) {
      failed = true;
    }

    expect(failed).toBeTruthy();
  });

  it('AuthenticationModule.Authenticate.forRootAsync.fail_2', async () => {
    let failed = false;
    try {
      await Test.createTestingModule({
        imports: [
          AuthenticationModule.forRootAsync({
            credentialLookupProvider: null,
          }),
        ],
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
        imports: [
          TestModule,
          AuthenticationModule.forRootAsync({
            credentialLookupProvider: {
              imports: [],
              inject: [],
              useFactory: null,
            },
          }),
        ],
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
        imports: [
          TestModule,
          AuthenticationModule.forRootAsync({
            credentialLookupProvider: {
              imports: [],
              inject: null,
              useFactory: null,
            },
          }),
        ],
      }).compile();
    } catch (err) {
      failed = true;
    }

    expect(failed).toBeTruthy();
  });

  it('AuthenticationModule.Authenticate.forRootAsync.fail_7', async () => {
    let failed = false;

    try {
      await Test.createTestingModule({
        imports: [TestModule, AuthenticationModule.forRootAsync(null)],
      }).compile();
    } catch (err) {
      failed = true;
    }

    expect(failed).toBeTruthy();
  });

  it('AuthenticationModule.Authenticate.forRootAsyncInject', async () => {
    let failed = false;
    try {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          AuthenticationModule.forRootAsync({
            credentialLookupProvider: {
              imports: [],
              useFactory: async (injectTest: InjectTest) => {
                return new TestLookupInjected(injectTest);
              },
            },
          }),
        ],
      }).compile();

      module.get<TestLookupInjected>(TestLookupInjected);
    } catch (err) {
      failed = true;
    }
    expect(failed).toBeTruthy();
  });

  it('AuthenticationModule.Authenticate.forRootAsyncInject', async () => {
    let failed = false;
    try {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          AuthenticationModule.forRootAsync({
            credentialLookupProvider: {
              imports: null,
              useFactory: async (injectTest: InjectTest) => {
                return new TestLookupInjected(injectTest);
              },
            },
          }),
        ],
      }).compile();

      module.get<TestLookupInjected>(TestLookupInjected);
    } catch (err) {
      failed = true;
    }
    expect(failed).toBeTruthy();
  });
});
