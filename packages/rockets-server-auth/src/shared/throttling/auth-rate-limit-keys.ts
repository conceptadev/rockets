import { createHash } from 'node:crypto';
import type { ExecutionContext } from '@nestjs/common';

/**
 * Longest account value that goes into a counter key verbatim; anything
 * longer is replaced by a hash of itself.
 *
 * Guards run BEFORE pipes, so this value is whatever the client sent,
 * bounded only by the body parser (100 kB by default). Without this an
 * attacker inserts one multi-kilobyte store key per request — and every
 * request does, because a fresh account value is a fresh key, so the
 * per-IP ceiling admits 1000 of them a minute before rejecting anything.
 * Hashing keeps the key bounded while staying 1:1 with the input, so two
 * different long values still get separate counters.
 */
const MAX_ACCOUNT_KEY_LENGTH = 128;

interface NativeRequest {
  readonly ip?: string;
  readonly body?: unknown;
  readonly method?: string;
  readonly route?: { readonly path?: string };
  readonly originalUrl?: string;
}

/**
 * Counters are PER ROUTE, matching the engine this replaces: throttler
 * derived its storage key from the controller/handler pair plus the
 * tracker, so `/token/password` and `/otp` never shared a bucket. A
 * global counter would let ten failed logins consume the OTP route's
 * much smaller allowance.
 */
function routeScope(context: ExecutionContext): string {
  const request = context.switchToHttp().getRequest<NativeRequest>();
  const method = request.method ?? 'GET';
  const route = request.route?.path ?? request.originalUrl ?? 'unknown';
  return `${method}:${route}`;
}

function requestIp(context: ExecutionContext): string {
  const request = context.switchToHttp().getRequest<NativeRequest>();
  // The same `request.ip` Express resolves respecting
  // `app.set('trust proxy', ...)` — Rockets does not interpret forwarded
  // headers on the app's behalf (CONFIGURATION.md §7).
  return typeof request.ip === 'string' && request.ip.length > 0
    ? request.ip
    : 'unknown';
}

/** Coarse per-IP counter key — the volume ceiling dimension. */
export function authIpRateLimitKey(context: ExecutionContext): string {
  return `${routeScope(context)}:${requestIp(context)}`;
}

/**
 * Rate-limits on the IP **and** the targeted account combined, not one or
 * the other. Keying on the account alone lets one attacker lock a victim
 * out of login by naming their username; keying on IP alone misses
 * distributed attacks and collapses behind a load balancer. The composite
 * key limits the `(ip, account)` pair, so an attacker only ever throttles
 * themselves. Requests that name no account fall back to the IP alone.
 *
 * Reads the parsed body — Express body parsing is middleware and has run
 * before guards, which is the same ordering the previous engine's
 * tracker relied on.
 */
export function authAccountRateLimitKey(context: ExecutionContext): string {
  const ip = requestIp(context);
  const request = context.switchToHttp().getRequest<NativeRequest>();
  const body: unknown = request.body;
  if (typeof body === 'object' && body !== null) {
    const target =
      readStringField(body, 'email') ?? readStringField(body, 'username');
    if (target !== undefined) {
      return `${routeScope(context)}:${ip}::${boundAccount(target)}`;
    }
  }
  return `${routeScope(context)}:${ip}`;
}

function boundAccount(value: string): string {
  const normalized = value.toLowerCase();
  return normalized.length <= MAX_ACCOUNT_KEY_LENGTH
    ? normalized
    : `h:${createHash('sha256').update(normalized).digest('hex')}`;
}

function readStringField(source: object, key: string): string | undefined {
  const value: unknown = Reflect.get(source, key);
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
