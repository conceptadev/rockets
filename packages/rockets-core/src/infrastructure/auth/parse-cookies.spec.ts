import { describe, it, expect } from 'vitest';
import { extractCookie, parseCookies } from './parse-cookies';
import type { AuthRequest } from '../../domain/interfaces/auth-adapter.interface';

describe('parseCookies', () => {
  it('returns {} for undefined', () => {
    expect(parseCookies(undefined)).toEqual({});
  });

  it('parses a single cookie', () => {
    expect(parseCookies('a=1')).toEqual({ a: '1' });
  });

  it('parses multiple cookies separated by "; "', () => {
    expect(parseCookies('a=1; b=2; c=3')).toEqual({ a: '1', b: '2', c: '3' });
  });

  it('trims whitespace around names and values', () => {
    expect(parseCookies('  a = 1 ;  b=2')).toEqual({ a: '1', b: '2' });
  });

  it('URI-decodes values', () => {
    expect(parseCookies('a=hello%20world')).toEqual({ a: 'hello world' });
  });

  it('falls back to the raw value on a bad %-encoding rather than throwing', () => {
    expect(parseCookies('a=100%')).toEqual({ a: '100%' });
  });

  it('skips a segment with no "="', () => {
    expect(parseCookies('a=1; garbage; b=2')).toEqual({ a: '1', b: '2' });
  });

  it('skips a segment with an empty name', () => {
    expect(parseCookies('=1; a=1')).toEqual({ a: '1' });
  });

  it('joins an array header with "; " before parsing', () => {
    expect(parseCookies(['a=1', 'b=2'])).toEqual({ a: '1', b: '2' });
  });

  // Duplicate names are FIRST-wins, matching the `cookie` npm package
  // every other Node cookie reader is built on:
  //   cookie.parse('__session=attacker; __session=victim')
  //     -> { __session: 'attacker' }
  // A last-wins parser here made this guard and any other cookie-reading
  // layer in the same stack resolve one request to two different
  // sessions, which is what cookie tossing from a sibling subdomain
  // exploits. Flip the `if (name in cookies) continue` and this goes red.
  it('resolves a duplicate cookie name to the FIRST occurrence', () => {
    expect(parseCookies('__session=first; __session=second')).toEqual({
      __session: 'first',
    });
  });

  it('keeps first-wins across an array header too', () => {
    expect(parseCookies(['__session=first', '__session=second'])).toEqual({
      __session: 'first',
    });
  });

  it('first-wins does not swallow other cookies around the duplicate', () => {
    expect(parseCookies('a=1; __session=first; b=2; __session=second')).toEqual(
      {
        a: '1',
        __session: 'first',
        b: '2',
      },
    );
  });

  // The map is null-prototype, so a cookie whose NAME collides with an
  // Object.prototype key is data like any other — with a plain `{}` the
  // first-wins `in` check would see inherited `toString` and drop the
  // real cookie, and `__proto__` would not survive assignment at all.
  it('handles cookie names that collide with Object.prototype keys', () => {
    expect(parseCookies('toString=1; __session=ok')).toEqual({
      toString: '1',
      __session: 'ok',
    });
    const parsed = parseCookies('__proto__=polluted; __session=ok');
    expect(parsed['__proto__']).toBe('polluted');
    expect(parsed['__session']).toBe('ok');
    // Nothing leaked onto the real Object prototype.
    expect({}.constructor).toBe(Object);
  });

  // EVERY return path, not just the parsing one. The no-header early
  // return used to hand back a plain `{}`, so `cookies['constructor']`
  // was a Function and `extractCookie` — declared `string | null` —
  // could return one for a request with no Cookie header at all.
  it('returns a null-prototype map on every path, including no header', () => {
    for (const parsed of [
      parseCookies(undefined),
      parseCookies(''),
      parseCookies('a=1'),
    ]) {
      expect(Object.getPrototypeOf(parsed)).toBeNull();
      expect(parsed['constructor']).toBeUndefined();
      expect(parsed['toString']).toBeUndefined();
    }
  });
});

describe('extractCookie', () => {
  function request(cookie: string | undefined): AuthRequest {
    return {
      headers: cookie === undefined ? {} : { cookie },
      query: {},
      raw: undefined,
    };
  }

  it('returns null when the cookie header is absent', () => {
    expect(extractCookie(request(undefined), '__session')).toBeNull();
  });

  it('returns null when the named cookie is not present', () => {
    expect(extractCookie(request('other=1'), '__session')).toBeNull();
  });

  it('returns null for an empty cookie value', () => {
    expect(extractCookie(request('__session='), '__session')).toBeNull();
  });

  it('returns the cookie value when present', () => {
    expect(extractCookie(request('__session=abc123'), '__session')).toBe(
      'abc123',
    );
  });

  // The signature says `string | null`. With a plain-object cookie map
  // this returned `Object.prototype.constructor` — a Function — for a
  // request carrying no Cookie header, which a caller would then have
  // treated as a session value.
  it('returns null, never an inherited Object.prototype member', () => {
    for (const name of ['constructor', 'toString', 'hasOwnProperty']) {
      expect(extractCookie(request(undefined), name)).toBeNull();
      expect(extractCookie(request('__session=abc'), name)).toBeNull();
    }
  });
});
