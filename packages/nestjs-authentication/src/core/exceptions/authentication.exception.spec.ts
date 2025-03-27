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
});
