import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticationModule } from '@rockts-org/nestjs-authentication';
import { JwtModule } from '@rockts-org/nestjs-jwt';

import { RefreshTokenModule } from './refresh-token.module';


describe('RefreshTokenModuleTest', () => {
  //const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNjQzMjk5MTk2fQ.1MDIk4b427f-Ju4jtxCg_Jd1NqE5OOzYKK90qnZEkik";

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('is controller defined', async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        RefreshTokenModule.register(),
        JwtModule.register(),
        AuthenticationModule.register(),
        //PasswordModule.register(),
      ],
    }).compile();

    //const jwtStrategy = module.get(RefreshTokenStrategy);

    //expect(jwtStrategy).toBeDefined();
  });
});
