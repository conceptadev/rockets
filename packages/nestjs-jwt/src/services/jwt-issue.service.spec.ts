import { JwtIssueService } from './jwt-issue.service';
import { JwtService } from './jwt.service';
import { mock } from 'jest-mock-extended';

describe(JwtIssueService, () => {
  let jwtService: JwtService;
  let jwtIssueService: JwtIssueService;
  const token = 'token';

  beforeEach(() => {
    jwtService = mock<JwtService>();
    jwtIssueService = new JwtIssueService(jwtService, jwtService);
  });

  describe(JwtIssueService.prototype.accessToken, () => {
    it('should success', async () => {
      const spySignAsync = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue(token);
      const result = await jwtIssueService.accessToken(token);
      expect(result).toBe(token);
      expect(spySignAsync).toBeCalledWith(token, undefined);
    });
    it('should throw error', async () => {
      jest.spyOn(jwtService, 'signAsync').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtIssueService.accessToken(token);
      await expect(t).rejects.toThrowError();
    });
  });

  describe(JwtIssueService.prototype.refreshToken, () => {
    it('should success', async () => {
      const spySignAsync = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValue(token);
      const result = await jwtIssueService.refreshToken(token);
      expect(result).toBe(token);
      expect(spySignAsync).toBeCalledWith(token, undefined);
    });

    it('should throw error', async () => {
      jest.spyOn(jwtService, 'signAsync').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtIssueService.refreshToken(token);
      await expect(t).rejects.toThrowError();
    });
  });
});
