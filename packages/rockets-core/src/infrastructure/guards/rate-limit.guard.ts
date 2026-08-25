import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  ROCKETS_RATE_LIMIT_TOKEN,
  type RateLimitOptions,
} from '../../decorators/rate-limit.decorator';
import {
  RATE_LIMIT_STORE_TOKEN,
  type RateLimitStoreInterface,
} from '../../domain/interfaces/rate-limit.interface';

interface NativeRequest {
  readonly ip?: string;
  readonly method?: string;
  readonly route?: { readonly path?: string };
  readonly originalUrl?: string;
}

interface NativeResponse {
  readonly setHeader?: (name: string, value: string) => unknown;
}

/**
 * Enforces `@RateLimit()` (issue #56) — a no-op on every route without
 * the decorator, so registering this guard globally does not change
 * behavior for routes that never opt in.
 *
 * Fails CLOSED: if the store throws (the backing DB/cache is down), the
 * request is rejected with `503`, never let through unlimited — a rate
 * limiter that fails open during exactly the degraded conditions an
 * abuser might be causing defeats its own purpose.
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(RATE_LIMIT_STORE_TOKEN)
    private readonly store: RateLimitStoreInterface,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(
      ROCKETS_RATE_LIMIT_TOKEN,
      [context.getHandler(), context.getClass()],
    );
    if (options === undefined) {
      return true;
    }

    const key = options.key
      ? options.key(context)
      : defaultRateLimitKey(context);

    let result;
    try {
      result = await this.store.consume(key, options.limit, options.windowMs);
    } catch (error) {
      this.logger.error(
        `Rate limit store failed for key "${key}": ${
          error instanceof Error ? error.message : String(error)
        }`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new ServiceUnavailableException('Rate limiter unavailable');
    }

    const response = context.switchToHttp().getResponse<NativeResponse>();
    response.setHeader?.('X-RateLimit-Limit', String(result.limit));
    response.setHeader?.('X-RateLimit-Remaining', String(result.remaining));
    response.setHeader?.(
      'X-RateLimit-Reset',
      String(Math.ceil(result.resetAt / 1000)),
    );

    if (!result.allowed) {
      const retryAfterSeconds = Math.max(
        0,
        Math.ceil((result.resetAt - Date.now()) / 1000),
      );
      response.setHeader?.('Retry-After', String(retryAfterSeconds));
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}

/**
 * `ip:METHOD:route`. Same `request.ip` Express resolves respecting
 * `app.set('trust proxy', ...)` that auth throttling already depends on
 * (`CONFIGURATION.md` §7 — a host behind a reverse proxy must configure
 * its own topology; Rockets does not trust forwarded headers on the
 * app's behalf).
 */
function defaultRateLimitKey(context: ExecutionContext): string {
  const request = context.switchToHttp().getRequest<NativeRequest>();
  const ip = request.ip ?? 'unknown';
  const method = request.method ?? 'GET';
  const route = request.route?.path ?? request.originalUrl ?? 'unknown';
  return `${ip}:${method}:${route}`;
}
