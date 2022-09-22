import { IssueTokenServiceInterface } from '@concepta/nestjs-authentication';
import {
  AuthenticatedUserInterface,
  AuthenticationResponseInterface,
} from '@concepta/ts-common';
import { randomUUID } from 'crypto';
import { mock } from 'jest-mock-extended';
import { AuthRefreshController } from './auth-refresh.controller';

describe(AuthRefreshController, () => {
  const accessToken = 'accessToken';
  const refreshToken = 'refreshToken';
  let controller: AuthRefreshController;
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
    controller = new AuthRefreshController(issueTokenService);
  });

  describe(AuthRefreshController.prototype.refresh, () => {
    it('should return user', async () => {
      const user: AuthenticatedUserInterface = {
        id: randomUUID(),
      };
      const result = await controller.refresh(user);
      expect(result.accessToken).toBe(response.accessToken);
    });
  });
});
