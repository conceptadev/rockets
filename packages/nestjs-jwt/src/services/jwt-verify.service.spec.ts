import { JwtVerifyService } from './jwt-verify.service';
import { JwtService } from './jwt.service';
import { mock } from 'jest-mock-extended';

describe(JwtVerifyService, () => {
  let jwtService: JwtService;
  let jwtVerifyService: JwtVerifyService;
  const token = 'token';

  beforeEach(() => {
    jwtService = mock<JwtService>();
    jwtVerifyService = new JwtVerifyService(jwtService, jwtService);
  });

  describe(JwtVerifyService.prototype.accessToken, () => {
    it('should success', async () => {
      const spyAccessToken = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ foo: 'bar' });
      const result = await jwtVerifyService.accessToken('{"foo": "bar"}');
      expect(result).toEqual({ foo: 'bar' });
      expect(spyAccessToken).toBeCalledWith('{"foo": "bar"}');
    });

    it('should throw error', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtVerifyService.accessToken(token);
      await expect(t).rejects.toThrowError();
    });
  });

  describe(JwtVerifyService.prototype.refreshToken, () => {
    it('should success', async () => {
      const spyRefreshToken = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ man: 'chu' });
      const result = await jwtVerifyService.refreshToken('{"man": "chu"}');
      expect(result).toEqual({ man: 'chu' });
      expect(spyRefreshToken).toBeCalledWith('{"man": "chu"}');
    });

    it('should throw error', async () => {
      jest.spyOn(jwtService, 'verifyAsync').mockImplementationOnce(() => {
        throw new Error();
      });
      const t = async () => await jwtVerifyService.refreshToken(token);
      await expect(t).rejects.toThrowError();
    });
  });
});
