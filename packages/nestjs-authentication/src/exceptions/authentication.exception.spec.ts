import { AuthenticationException } from './authentication.exception';
import { RuntimeException } from '@concepta/nestjs-exception';

describe(AuthenticationException.name, () => {
  it('should extend BadRequestException', () => {
    const exception = new AuthenticationException();
    expect(exception).toBeInstanceOf(RuntimeException);
  });

  it('should have default message "Credentials are incorrect."', () => {
    const exception = new AuthenticationException();

    expect(exception.message).toEqual('Runtime Exception');
  });

  it('should pass a string error message to the BadRequestException', () => {
    const errorMessage = 'Specific error message';
    const exception = new AuthenticationException({ message: errorMessage });

    expect(exception.message).toContain(errorMessage);
  });
});
