import { PlainLiteralObject } from '@nestjs/common';
import { AppContextHost } from '@concepta/nestjs-core';

/**
 * Upstream `@concepta/nestjs-common` `getAppContext()` stores a different
 * `AppContextHost` class on the request. `@conceptadev/rockets-repository`
 * expects the conceptadev host at runtime. For auth flows that only need
 * repository I/O, a fresh conceptadev host is sufficient.
 */
export function resolveConceptadevAppContext(
  explicit?: PlainLiteralObject | AppContextHost | null,
): AppContextHost {
  if (explicit instanceof AppContextHost) {
    return explicit;
  }
  return new AppContextHost();
}
