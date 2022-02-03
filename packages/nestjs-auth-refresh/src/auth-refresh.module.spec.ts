import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import { JwtModule } from '@rockts-org/nestjs-jwt';
import { AuthRefreshModule } from './auth-refresh.module';
import { AuthRefreshStrategy } from './auth-refresh.strategy';

describe('AuthRefreshModuleTest', () => {
  //const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjQzMjk5MTk2fQ.1MDIk4b427f-Ju4jtxCg_Jd1NqE5OOzYKK90qnZEkik";

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is service defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthenticationModule.register(),
        AuthRefreshModule.register(),
        JwtModule.register(),
      ],
    }).compile();

    const authRefreshStrategy = module.get(AuthRefreshStrategy);

    expect(authRefreshStrategy).toBeDefined();
  });
});
