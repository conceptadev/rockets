import type { ExecutionContext } from '@nestjs/common';

export type RocketsAuthThrottlerResolvable<
  Value extends number | string | boolean,
> = Value | ((context: ExecutionContext) => Value | Promise<Value>);

export interface RocketsAuthThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

export interface RocketsAuthThrottlerStorage {
  increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<RocketsAuthThrottlerStorageRecord>;
}

export interface RocketsAuthThrottlerLimitDetail
  extends RocketsAuthThrottlerStorageRecord {
  ttl: number;
  limit: number;
  key: string;
  tracker: string;
}

export type RocketsAuthThrottlerGetTracker = (
  // `any` intentionally matches @nestjs/throttler's public callback contract.
  // Narrowing this to `unknown` would reject callbacks accepted before this
  // compatibility type stopped leaking the upstream Nest 11 declaration.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  request: Record<string, any>,
  context: ExecutionContext,
) => Promise<string> | string;

export type RocketsAuthThrottlerGenerateKey = (
  context: ExecutionContext,
  tracker: string,
  throttlerName: string,
) => string;

export interface RocketsAuthThrottlerOptions {
  name?: string;
  limit: RocketsAuthThrottlerResolvable<number>;
  ttl: RocketsAuthThrottlerResolvable<number>;
  blockDuration?: RocketsAuthThrottlerResolvable<number>;
  ignoreUserAgents?: RegExp[];
  skipIf?: (context: ExecutionContext) => boolean;
  getTracker?: RocketsAuthThrottlerGetTracker;
  generateKey?: RocketsAuthThrottlerGenerateKey;
  setHeaders?: boolean;
}

/** Public, Nest-12-compatible shape accepted by Rockets Auth throttling. */
export type RocketsAuthThrottlingOptions =
  | RocketsAuthThrottlerOptions[]
  | {
      ignoreUserAgents?: RegExp[];
      skipIf?: (context: ExecutionContext) => boolean;
      getTracker?: RocketsAuthThrottlerGetTracker;
      generateKey?: RocketsAuthThrottlerGenerateKey;
      errorMessage?:
        | string
        | ((
            context: ExecutionContext,
            detail: RocketsAuthThrottlerLimitDetail,
          ) => string);
      storage?: RocketsAuthThrottlerStorage;
      throttlers: RocketsAuthThrottlerOptions[];
      setHeaders?: boolean;
    };
