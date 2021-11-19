import { mock } from 'jest-mock-extended';
import { CustomAuthenticationService } from './services/custom-authentication.service';
import { AuthenticationController } from './authentication.controller';

describe('SignController', () => {
  let controller: AuthenticationController;
  let authService: CustomAuthenticationService;
  let spyAuthentication: jest.SpyInstance;
  let spyRefreshAccessToken: jest.SpyInstance;

  beforeEach(async () => {
    authService = mock<CustomAuthenticationService>();
    controller = new AuthenticationController(authService);

    spyAuthentication = jest.spyOn(authService, 'authenticate');
    spyRefreshAccessToken = jest.spyOn(authService, 'refreshAccessToken');
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
