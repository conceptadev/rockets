import { JwtVerifyService } from './jwt-verify.service';
import { JwtSignService } from './jwt-sign.service';
import { mock } from 'jest-mock-extended';

describe(JwtVerifyService, () => {
  let jwtSignService: JwtSignService;
  let jwtVerifyService: JwtVerifyService;
  const token = 'token';
  beforeEach(() => {
    jwtSignService = mock<JwtSignService>();
    jwtVerifyService = new JwtVerifyService(jwtSignService);
  });
  describe(JwtVerifyService.prototype.accessToken, () => {
    it('should success', async () => {
      const spySignAsync = jest
        .spyOn(jwtSignService, 'verifyAsync')
        .mockResolvedValue(token);
      const result = await jwtVerifyService.accessToken(token);
      expect(result).toBe(token);
      expect(spySignAsync).toBeCalledWith('access', token);
    });
    it('should throw error', async () => {
      jest.spyOn(jwtSignService, 'verifyAsync').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtVerifyService.accessToken(token);
      await expect(t).rejects.toThrowError();
    });
  });

  describe(JwtVerifyService.prototype.refreshToken, () => {
    it('should success', async () => {
      const spySignAsync = jest
        .spyOn(jwtSignService, 'verifyAsync')
        .mockResolvedValue(token);
      const result = await jwtVerifyService.refreshToken(token);
      expect(result).toBe(token);
      expect(spySignAsync).toBeCalledWith('refresh', token);
    });

    it('should throw error', async () => {
      jest.spyOn(jwtSignService, 'verifyAsync').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtVerifyService.refreshToken(token);
      await expect(t).rejects.toThrowError();
    });
  });
});
