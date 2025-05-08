import { OtpModule, OtpService, OtpCreateDto } from './index';

describe('index', () => {
  it('should be an instance of Function', () => {
    expect(OtpModule).toBeInstanceOf(Function);
  });

  it('should be an instance of Function', () => {
    expect(OtpService).toBeInstanceOf(Function);
  });

  it('should be an instance of Function', () => {
    expect(OtpCreateDto).toBeInstanceOf(Function);
  });
});
