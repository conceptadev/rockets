import { JwtIssueTokenService } from '@concepta/nestjs-jwt';
import {
  AuthenticatedUserInterface,
  AuthenticationResponseInterface,
} from '@concepta/ts-common';
import { randomUUID } from 'crypto';
import { mock } from 'jest-mock-extended';
import { IssueTokenService } from './issue-token.service';

describe(IssueTokenService, () => {
  const accessToken = 'accessToken';
  const refreshToken = 'refreshToken';
  const user: AuthenticatedUserInterface = {
    id: randomUUID(),
  };
  let issueTokenService: IssueTokenService;
  const response: AuthenticationResponseInterface = {
    accessToken,
    refreshToken,
  };

  beforeEach(async () => {
    const jwtIssueTokenService = mock<JwtIssueTokenService>({
      accessToken: (): Promise<string> => {
        return new Promise((resolve) => {
          resolve('accessToken');
        });
      },
      refreshToken: (): Promise<string> => {
        return new Promise((resolve) => {
          resolve('refreshToken');
        });
      },
    });
    issueTokenService = new IssueTokenService(jwtIssueTokenService);
  });

  describe(IssueTokenService.prototype.accessToken, () => {
    it('should return accessToken', async () => {
      const result = await issueTokenService.accessToken(user);
      expect(result).toBe(response.accessToken);
    });
  });

  describe(IssueTokenService.prototype.refreshToken, () => {
    it('should return refreshToken', async () => {
      const result = await issueTokenService.refreshToken(user);
      expect(result).toBe(response.refreshToken);
    });
  });

  describe(IssueTokenService.prototype.responsePayload, () => {
    it('should return responsePayload', async () => {
      const result = await issueTokenService.responsePayload(user.id);
      expect(result.accessToken).toBe(response.accessToken);
      expect(result.refreshToken).toBe(response.refreshToken);
    });
  });
});
