import { mock } from 'jest-mock-extended';
import { SignService } from './services/sign.service';
import { SignController } from './sign.controller';

describe('SignController', () => {
  let controller: SignController;
  let signService: SignService;
  let spyAuthentication: jest.SpyInstance;
  let spyRefreshAccessToken: jest.SpyInstance;
  

  beforeEach(async () => {
    
    signService = mock<SignService>();
    controller = new SignController(signService);

    spyAuthentication = jest.spyOn(signService, 'authenticate');
    spyRefreshAccessToken = jest.spyOn(signService, 'refreshAccessToken');

    
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('SignController.Authenticate', async () => {
    
    await controller.authenticate(null);

    expect(spyAuthentication).toBeCalled();
  });

  it('SignController.refreshToken', async () => {
    
    await controller.refreshToken(null);

    expect(spyRefreshAccessToken).toBeCalled();
  });
});
