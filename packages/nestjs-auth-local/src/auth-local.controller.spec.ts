import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import {
  AuthenticatedUserInterface,
  AuthenticationResponseInterface,
  AuthHistoryLoginInterface,
} from '@concepta/nestjs-common';
import { randomUUID } from 'crypto';
import { mock } from 'jest-mock-extended';
import { AuthLocalController } from './auth-local.controller';
import { EventDispatchService } from '@concepta/nestjs-event';
import { AUTH_LOCAL_AUTHENTICATION_TYPE } from './auth-local.constants';
import { AuthLocalAuthenticatedEventAsync } from './events/auth-local-authenticated.event';

describe(AuthLocalController, () => {
  const accessToken = 'accessToken';
  const refreshToken = 'refreshToken';
  let controller: AuthLocalController;
  let eventDispatchService: EventDispatchService;
  let spyOnDispatchService: jest.SpyInstance;
  const response: AuthenticationResponseInterface = {
    accessToken,
    refreshToken,
  };

  beforeEach(async () => {
    const issueTokenService = mock<IssueTokenServiceInterface>({
      responsePayload: () => {
        return new Promise((resolve) => {
          resolve(response);
        });
      },
    });
    eventDispatchService = mock<EventDispatchService>();
    spyOnDispatchService = jest
      .spyOn(eventDispatchService, 'async')
      .mockResolvedValue([]);
    // eventDispatchService.async.
    controller = new AuthLocalController(
      issueTokenService,
      eventDispatchService,
    );
  });

  describe(AuthLocalController.prototype.login, () => {
    it('should return user', async () => {
      const user: AuthenticatedUserInterface = {
        id: randomUUID(),
      };
      const authLogin: AuthHistoryLoginInterface = {
        ipAddress: '127.0.0.1',
        deviceInfo: 'IOS',
      };
      const result = await controller.login(user, authLogin);
      expect(result.accessToken).toBe(response.accessToken);
      const authenticatedEventAsync = new AuthLocalAuthenticatedEventAsync({
        userInfo: {
          userId: user.id,
          authType: AUTH_LOCAL_AUTHENTICATION_TYPE,
          ...authLogin,
        },
      });
      expect(spyOnDispatchService).toBeCalledWith(authenticatedEventAsync);
    });
  });
});
