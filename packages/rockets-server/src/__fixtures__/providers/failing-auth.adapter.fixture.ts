import { Injectable } from '@nestjs/common';
import type {
  AuthAdapterInterface,
  AuthAttemptResult,
  AuthRequest,
} from '@concepta/rockets-core';
import { extractBearerToken } from '@concepta/rockets-core';

@Injectable()
export class FailingAuthAdapterFixture implements AuthAdapterInterface {
  async authenticate(request: AuthRequest): Promise<AuthAttemptResult> {
    const token = extractBearerToken(request);
    if (token === null) return { matched: false };

    // Always throws an unexpected error for testing error scenarios
    throw new Error('Invalid token');
  }
}
