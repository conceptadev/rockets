import { NotAnErrorException } from '../exceptions/not-an-error.exception';

export function mapNonErrorToException(error: unknown): Error {
  return error instanceof Error ? error : new NotAnErrorException(error);
}
