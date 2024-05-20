import { OtpTypeNotDefinedException } from './otp-type-not-defined.exception';

describe(OtpTypeNotDefinedException.name, () => {
  it('should create an instance of OtpTypeNotDefinedException', () => {
    const exception = new OtpTypeNotDefinedException('test');
    expect(exception).toBeInstanceOf(OtpTypeNotDefinedException);
  });

  it('should have the correct error code', () => {
    const exception = new OtpTypeNotDefinedException('test');
    expect(exception.errorCode).toBe('OTP_TYPE_NOT_DEFINED_ERROR');
  });

  it('should have the correct context', () => {
    const exception = new OtpTypeNotDefinedException('test');
    expect(exception.context).toEqual({ type: 'test' });
  });

  it('should have the correct message', () => {
    const exception = new OtpTypeNotDefinedException('test');
    expect(exception.message).toBe(
      'Type test was not defined to be used. please check config.',
    );
  });
});
