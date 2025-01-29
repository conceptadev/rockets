import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import {
  AuthenticatedUserInterface,
  AuthenticationResponseInterface,
} from '@concepta/nestjs-common';
import { EventDispatchService } from '@concepta/nestjs-event';
import { randomUUID } from 'crypto';
import { mock } from 'jest-mock-extended';
import { AuthLocalController } from './auth-local.controller';

describe(AuthLocalController, () => {
  const accessToken = 'accessToken';
  const refreshToken = 'refreshToken';
  let controller: AuthLocalController;
  let eventDispatchService: EventDispatchService;
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

      const result = await controller.login(user);
      expect(result.accessToken).toBe(response.accessToken);
    });
  });
});
