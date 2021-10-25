import { BadRequestException } from "@nestjs/common";

/**
 * Exception for authentication
 */
export class AuthenticationException extends BadRequestException {
    constructor(objectOrError?: string | object | any) {
      super(objectOrError, "Credentials are incorrect.");
    }
  }