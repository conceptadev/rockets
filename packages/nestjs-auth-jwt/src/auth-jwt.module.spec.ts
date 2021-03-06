import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '@concepta/nestjs-authentication';
import { JwtModule } from '@concepta/nestjs-jwt';
import { AuthJwtModule } from './auth-jwt.module';
import { AuthJwtStrategy } from './auth-jwt.strategy';
import { UserLookupServiceFixture } from './__fixtures__/user/user-lookup.service.fixture';

describe('AuthLocalModuleTest', () => {
  //const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjQzMjk5MTk2fQ.1MDIk4b427f-Ju4jtxCg_Jd1NqE5OOzYKK90qnZEkik";

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        AuthJwtModule.register({
          userLookupService: new UserLookupServiceFixture(),
        }),
        JwtModule.register(),
        AuthenticationModule.register(),
      ],
    }).compile();

    const jwtStrategy = module.get(AuthJwtStrategy);

    expect(jwtStrategy).toBeDefined();
  });
});
