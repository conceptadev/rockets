import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import {
  AuthenticationController,
  AuthenticationStrategyLocalInterface,
} from '@rockts-org/nestjs-authentication';

describe('AppModule', () => {
  let authController: AuthenticationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    authController = module.get<AuthenticationController>(
      AuthenticationController,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listening', () => {
    it('Authenticate', async () => {
      const sign: AuthenticationStrategyLocalInterface = {
        username: 'first_user',
        password: 'AS12378',
      };
      const response = await authController.authenticate(sign);

      expect(response.accessToken).toBeDefined();
      expect(response.username).toBe(sign.username);
    });
  });
});
