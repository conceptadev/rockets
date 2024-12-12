import { OtpEntityNotFoundException } from './otp-entity-not-found.exception';

describe(OtpEntityNotFoundException.name, () => {
  it('should create an instance of EntityNotFoundException', () => {
    const exception = new OtpEntityNotFoundException('TestEntity');
    expect(exception).toBeInstanceOf(OtpEntityNotFoundException);
  });

  it('should have the correct error message', () => {
    const exception = new OtpEntityNotFoundException('TestEntity');
    expect(exception.message).toBe(
      'Entity TestEntity was not registered to be used.',
    );
  });

  it('should have the correct context', () => {
    const exception = new OtpEntityNotFoundException('TestEntity');
    expect(exception.context).toEqual({ entityName: 'TestEntity' });
  });

  it('should have the correct error code', () => {
    const exception = new OtpEntityNotFoundException('TestEntity');
    expect(exception.errorCode).toBe('OTP_ENTITY_NOT_FOUND_ERROR');
  });
});
