import { describe, expect, it } from 'vitest';

import {
  parseStructuredRoutePattern,
  structuredRoutePatternsMayOverlap,
} from './route-pattern';

function overlaps(left: string, right: string): boolean | 'unknown' {
  return structuredRoutePatternsMayOverlap(
    parseStructuredRoutePattern(left),
    parseStructuredRoutePattern(right),
  );
}

describe('route-pattern', () => {
  it('treats different param names as overlapping route patterns', () => {
    expect(overlaps('pets/:id', 'pets/:petId')).toBe(true);
  });

  it('detects static routes that overlap dynamic params', () => {
    expect(overlaps('users/me', 'users/:id')).toBe(true);
  });

  it('does not overlap different static segments', () => {
    expect(overlaps('users/me', 'users/settings')).toBe(false);
  });

  it('expands optional groups before comparing', () => {
    expect(overlaps('users{/:id}', 'users')).toBe(true);
    expect(overlaps('users{/:id}', 'users/:slug')).toBe(true);
  });

  it('treats wildcard tails as overlapping matching suffixes', () => {
    expect(overlaps('files/*path', 'files/readme')).toBe(true);
  });

  it('does not overlap wildcard routes with different static prefixes', () => {
    expect(overlaps('files/*path', 'assets/readme')).toBe(false);
  });

  it('returns unknown for complex mixed segments instead of guessing', () => {
    expect(overlaps('files/file-:id', 'files/file-a')).toBe('unknown');
  });
});
