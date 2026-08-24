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
});
