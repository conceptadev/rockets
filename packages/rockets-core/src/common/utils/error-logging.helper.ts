import { Logger } from '@nestjs/common';

// Deliberately mutable. `@concepta/rockets-auth` published this shape without
// `readonly` before core became the single owner and now re-exports core's
// declaration, so adding `readonly` here would narrow an already-published
// type. Widening it for core consumers is the safe direction.
export interface ErrorDetails {
  errorMessage: string;
  errorStack?: string;
}

export function getErrorDetails(error: unknown): ErrorDetails {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;

  return { errorMessage, errorStack };
}

export function logAndGetErrorDetails(
  error: unknown,
  logger: Logger,
  customMessage: string,
  context?: Record<string, unknown>,
): ErrorDetails {
  const details = getErrorDetails(error);

  logger.error(
    `${customMessage}: ${details.errorMessage}`,
    details.errorStack,
    context,
  );

  return details;
}
