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

  // Returning `true` at the first wildcard dropped every remaining
  // segment, so a mid-route wildcard reported overlaps that
  // `path-to-regexp` disagrees with: `/a/*rest/x` does not match
  // `/a/y/z`. A false positive here rejects a valid configuration.
  it('is suffix-aware for a mid-route wildcard', () => {
    expect(overlaps('a/*rest/x', 'a/y/z')).toBe(false);
  });

  it('still overlaps when the suffix after the wildcard lines up', () => {
    expect(overlaps('a/*rest/x', 'a/y/x')).toBe(true);
    expect(overlaps('a/*rest/x', 'a/y/z/x')).toBe(true);
  });

  // A match that needs the wildcard to absorb ZERO segments depends on
  // router semantics that vary by version, so it is reported as
  // unproven rather than asserted either way.
  it('reports a zero-length wildcard match as unproven', () => {
    expect(overlaps('a/*rest', 'a')).toBe('unknown');
  });

  // Express routes case-insensitively by default: `pets/Stats` and
  // `pets/stats` are one wire route, and calling them disjoint let the
  // second handler ship silently unreachable.
  it('treats segments differing only by case as overlapping', () => {
    expect(
      structuredRoutePatternsMayOverlap(
        parseStructuredRoutePattern('pets/Stats'),
        parseStructuredRoutePattern('pets/stats'),
      ),
    ).toBe(true);
  });
});
