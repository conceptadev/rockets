import { JwtIssueService } from './jwt-issue.service';
import { JwtSignService } from './jwt-sign.service';
import { mock } from 'jest-mock-extended';

describe(JwtIssueService, () => {
  let jwtSignService: JwtSignService;
  let jwtIssueService: JwtIssueService;
  const token = 'token';
  beforeEach(() => {
    jwtSignService = mock<JwtSignService>();
    jwtIssueService = new JwtIssueService(jwtSignService);
  });
  describe(JwtIssueService.prototype.accessToken, () => {
    it('should success', async () => {
      const spySignAsync = jest
        .spyOn(jwtSignService, 'signAsync')
        .mockResolvedValue(token);
      const result = await jwtIssueService.accessToken(token);
      expect(result).toBe(token);
      expect(spySignAsync).toBeCalledWith('access', token);
    });
    it('should throw error', async () => {
      jest.spyOn(jwtSignService, 'signAsync').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtIssueService.accessToken(token);
      expect(t).rejects.toThrowError();
    });
  });

  describe(JwtIssueService.prototype.refreshToken, () => {
    it('should success', async () => {
      const spySignAsync = jest
        .spyOn(jwtSignService, 'signAsync')
        .mockResolvedValue(token);
      const result = await jwtIssueService.refreshToken(token);
      expect(result).toBe(token);
      expect(spySignAsync).toBeCalledWith('refresh', token);
    });

    it('should throw error', async () => {
      jest.spyOn(jwtSignService, 'signAsync').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtIssueService.refreshToken(token);
      expect(t).rejects.toThrowError();
    });
  });
});
