import { BadRequestException } from '@nestjs/common';
import { AuthenticationException } from './authentication.exception';

describe(AuthenticationException.name, () => {
  it('should extend BadRequestException', () => {
    const exception = new AuthenticationException();
    expect(exception).toBeInstanceOf(BadRequestException);
  });

  it('should have default message "Credentials are incorrect."', () => {
    const exception = new AuthenticationException();
    const data = exception.getResponse() as { message: string };
    expect(data.message).toEqual('Credentials are incorrect.');
  });

  it('should pass a string error message to the BadRequestException', () => {
    const errorMessage = 'Specific error message';
    const exception = new AuthenticationException(errorMessage);
    const data = exception.getResponse() as { message: string };
    expect(data.message).toContain(errorMessage);
  });
});
