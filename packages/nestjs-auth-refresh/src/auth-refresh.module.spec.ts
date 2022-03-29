import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { JwtModule } from '@concepta/nestjs-jwt';
import { AuthRefreshModule } from './auth-refresh.module';
import { AuthRefreshStrategy } from './auth-refresh.strategy';
import { UserService } from './__fixtures__/user/user.service';

describe('AuthRefreshModuleTest', () => {
  //const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjQzMjk5MTk2fQ.1MDIk4b427f-Ju4jtxCg_Jd1NqE5OOzYKK90qnZEkik";

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is service defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
      imports: [
        AuthenticationModule.register(),
        AuthRefreshModule.register({
          userLookupService: new UserService(),
        }),
        JwtModule.register(),
      ],
    }).compile();

    const authRefreshStrategy = module.get(AuthRefreshStrategy);

    expect(authRefreshStrategy).toBeDefined();
  });
});
