import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import {
  SignController,
  SignDTOInterface,
} from '@rockts-org/nestjs-authentication';

describe('AppModule', () => {
  let signController: SignController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    signController = module.get<SignController>(SignController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listening', () => {
    it('Authenticate', async () => {
      const sign: SignDTOInterface = {
        username: 'first_user',
        password: 'AS12378',
      };
      const response = await signController.authenticate(sign);

      expect(response.accessToken).toBeDefined();
      expect(response.username).toBe(sign.username);
    });
  });
});
