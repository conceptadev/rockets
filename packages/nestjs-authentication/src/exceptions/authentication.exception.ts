import { BadRequestException } from '@nestjs/common';

/**
 * Exception for authentication
 */
export class AuthenticationException extends BadRequestException {
  constructor(objectOrError?: string | Record<string, unknown>) {
    super(objectOrError, 'Credentials are incorrect.');
  }
}
