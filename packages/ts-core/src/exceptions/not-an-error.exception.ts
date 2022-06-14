import { format } from 'util';
import { ExceptionInterface } from './interfaces/exception.interface';

export class NotAnErrorException extends Error implements ExceptionInterface {
  errorCode = 'NOT_AN_ERROR';

  context: {
    originalError: unknown;
  };

  constructor(
    originalError: unknown,
    message = 'An error was caught that is not an Error object',
  ) {
    super(format(message));
    this.context = {
      originalError,
    };
  }
}
