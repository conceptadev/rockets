import { JwtIssueTokenService } from './jwt-issue-token.service';

import { mock } from 'jest-mock-extended';
import { JwtService } from './jwt.service';

describe(JwtIssueTokenService, () => {
  let jwtService: JwtService;
  let jwtIssueTokenService: JwtIssueTokenService;
  const token = 'token';

  beforeEach(() => {
    jwtService = mock<JwtService>();
    jwtIssueTokenService = new JwtIssueTokenService(jwtService, jwtService);
  });

  describe(JwtIssueTokenService.prototype.accessToken, () => {
    it('should success', async () => {
      const spySignAsync = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue(token);
      const result = await jwtIssueTokenService.accessToken(token);
      expect(result).toBe(token);
      expect(spySignAsync).toBeCalledWith(token, undefined);
    });
    it('should throw error', async () => {
      jest.spyOn(jwtService, 'signAsync').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtIssueTokenService.accessToken(token);
      await expect(t).rejects.toThrowError();
    });
  });

  describe(JwtIssueTokenService.prototype.refreshToken, () => {
    it('should success', async () => {
      const spySignAsync = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue(token);
      const result = await jwtIssueTokenService.refreshToken(token);
      expect(result).toBe(token);
      expect(spySignAsync).toBeCalledWith(token, undefined);
    });

    it('should throw error', async () => {
      jest.spyOn(jwtService, 'signAsync').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtIssueTokenService.refreshToken(token);
      await expect(t).rejects.toThrowError();
    });
  });
});
