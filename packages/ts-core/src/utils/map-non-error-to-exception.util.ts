import { NotAnErrorException } from '../exceptions/not-an-error.exception';

export function mapNonErrorToException(originalError: unknown) {
  return originalError instanceof Error
    ? originalError
    : new NotAnErrorException(originalError);
}
