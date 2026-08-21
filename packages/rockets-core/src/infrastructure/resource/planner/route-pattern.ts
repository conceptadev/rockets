import { parse, type Token } from 'path-to-regexp';
// Version discipline: a RANGE (^8.4.2), matching @nestjs/core's own
// dependency, so npm keeps ONE copy — an exact pin guarantees a second
// copy the day Nest bumps, and two grammars is worse than semver-minor
// drift within the library the router itself trusts.

export type RoutePatternOverlap = boolean | 'unknown';

type Segment =
  | { readonly kind: 'static'; readonly value: string }
  | { readonly kind: 'param' }
  | { readonly kind: 'wildcard' }
  | { readonly kind: 'complex' };

interface SegmentAtom {
  readonly kind: 'text' | 'param' | 'wildcard';
  readonly value?: string;
}

export interface StructuredRoutePattern {
  readonly path: string;
  readonly alternatives: readonly (readonly Segment[])[];
}

export function parseStructuredRoutePattern(
  path: string,
): StructuredRoutePattern {
  const data = parse(normalizePath(path));
  return {
    path,
    alternatives: expandGroups(data.tokens).map(tokensToSegments),
  };
}

export function structuredRoutePatternsMayOverlap(
  a: StructuredRoutePattern,
  b: StructuredRoutePattern,
): RoutePatternOverlap {
  let unknown = false;
  for (const left of a.alternatives) {
    for (const right of b.alternatives) {
      const overlap = segmentListsMayOverlap(left, right);
      if (overlap === true) {
        return true;
      }
      if (overlap === 'unknown') {
        unknown = true;
      }
    }
  }
  return unknown ? 'unknown' : false;
}

function normalizePath(path: string): string {
  const parts = splitPath(path);
  return parts.join('/');
}

function splitPath(path: string): string[] {
  return path.split('/').filter((part) => part.length > 0);
}

function expandGroups(tokens: readonly Token[]): Token[][] {
  let results: Token[][] = [[]];
  for (const token of tokens) {
    if (token.type !== 'group') {
      results = results.map((result) => [...result, token]);
      continue;
    }

    const included = expandGroups(token.tokens);
    const next: Token[][] = [];
    for (const result of results) {
      next.push(result);
      for (const option of included) {
        next.push([...result, ...option]);
      }
    }
    results = next;
  }
  return results;
}

function tokensToSegments(tokens: readonly Token[]): readonly Segment[] {
  const atomSegments: SegmentAtom[][] = [[]];
  for (const token of tokens) {
    if (token.type === 'text') {
      appendText(atomSegments, token.value);
      continue;
    }
    if (token.type === 'param') {
      atomSegments[atomSegments.length - 1]?.push({ kind: 'param' });
      continue;
    }
    if (token.type === 'wildcard') {
      atomSegments[atomSegments.length - 1]?.push({ kind: 'wildcard' });
    }
  }
  return atomSegments
    .filter((atoms) => atoms.length > 0)
    .map((atoms) => atomsToSegment(atoms));
}

function appendText(segments: SegmentAtom[][], value: string): void {
  const parts = value.split('/');
  for (const [index, part] of parts.entries()) {
    if (index > 0) {
      segments.push([]);
    }
    if (part.length > 0) {
      segments[segments.length - 1]?.push({ kind: 'text', value: part });
    }
  }
}

function atomsToSegment(atoms: readonly SegmentAtom[]): Segment {
  if (atoms.length !== 1) {
    return { kind: 'complex' };
  }
  const atom = atoms[0];
  if (atom === undefined) {
    return { kind: 'complex' };
  }
  if (atom.kind === 'text') {
    return { kind: 'static', value: atom.value ?? '' };
  }
  return { kind: atom.kind };
}

/**
 * Whether two segment lists can describe the same concrete path.
 *
 * Wildcards make this a matching problem, not a positional walk: the
 * previous version returned `true` at the first wildcard and dropped
 * every remaining segment, so `a/*rest/x` was reported as overlapping
 * `a/y/z` even though the suffix `x` can never line up with `z`. A
 * false positive here rejects a valid configuration at boot.
 *
 * A wildcard is matched against zero-or-more segments on the other side,
 * and the suffix after it still has to align. The zero-length case is
 * where the framework's own semantics are ambiguous (`*name` matching
 * zero segments depends on the router version), so a match that relies
 * on it returns `'unknown'` — which the collision validator treats as
 * "not proven", i.e. accepts the routes.
 */
function segmentListsMayOverlap(
  a: readonly Segment[],
  b: readonly Segment[],
): RoutePatternOverlap {
  const memo = new Map<string, RoutePatternOverlap>();

  const walk = (i: number, j: number): RoutePatternOverlap => {
    const cacheKey = `${i}:${j}`;
    const cached = memo.get(cacheKey);
    if (cached !== undefined) return cached;
    const result = compute(i, j);
    memo.set(cacheKey, result);
    return result;
  };

  /**
   * A wildcard absorbing `k >= 1` segments is a definite match. Absorbing
   * zero depends on router semantics that vary by version, so a match
   * that can ONLY be reached that way is downgraded to `'unknown'` —
   * which the collision validator reads as "not proven" and accepts.
   */
  const throughWildcard = (
    restIndex: number,
    otherIndex: number,
    otherLength: number,
    step: (consumed: number) => RoutePatternOverlap,
  ): RoutePatternOverlap => {
    let accumulated: RoutePatternOverlap = false;
    for (
      let consumed = 1;
      otherIndex + consumed <= otherLength;
      consumed += 1
    ) {
      accumulated = combine(accumulated, step(consumed));
      if (accumulated === true) return true;
    }
    void restIndex;
    return combine(accumulated, downgrade(step(0)));
  };

  const compute = (i: number, j: number): RoutePatternOverlap => {
    const aDone = i >= a.length;
    const bDone = j >= b.length;
    if (aDone && bDone) return true;

    if (!aDone && !bDone) {
      const left = a[i];
      const right = b[j];
      if (left === undefined || right === undefined) return false;

      if (left.kind === 'wildcard') {
        return throughWildcard(i + 1, j, b.length, (consumed) =>
          walk(i + 1, j + consumed),
        );
      }
      if (right.kind === 'wildcard') {
        return throughWildcard(j + 1, i, a.length, (consumed) =>
          walk(i + consumed, j + 1),
        );
      }

      const here = segmentsMayOverlap(left, right);
      if (here === false) return false;
      const rest = walk(i + 1, j + 1);
      if (rest === false) return false;
      return here === 'unknown' || rest === 'unknown' ? 'unknown' : true;
    }

    // Exactly one side has segments left. It can still match only if
    // every one of them is a wildcard absorbing nothing — the ambiguous
    // zero-length case, so unproven rather than asserted.
    const rest = aDone ? b.slice(j) : a.slice(i);
    const allWildcards = rest.every((segment) => segment.kind === 'wildcard');
    return allWildcards ? 'unknown' : false;
  };

  return walk(0, 0);
}

/** `true` beats `'unknown'` beats `false`. */
function combine(
  left: RoutePatternOverlap,
  right: RoutePatternOverlap,
): RoutePatternOverlap {
  if (left === true || right === true) return true;
  if (left === 'unknown' || right === 'unknown') return 'unknown';
  return false;
}

/** A proven match that relies on a zero-length wildcard is not proven. */
function downgrade(value: RoutePatternOverlap): RoutePatternOverlap {
  return value === true ? 'unknown' : value;
}

function segmentsMayOverlap(a: Segment, b: Segment): RoutePatternOverlap {
  if (a.kind === 'complex' || b.kind === 'complex') {
    return 'unknown';
  }
  if (a.kind === 'wildcard' || b.kind === 'wildcard') {
    return true;
  }
  if (a.kind === 'param' || b.kind === 'param') {
    return true;
  }
  // Case-insensitive: Express's router matches paths with
  // `caseSensitive: false` by default, so `pets/Stats` and `pets/stats`
  // are ONE route on the wire. A case-sensitive comparison here
  // declared them disjoint and the app booted with the second handler
  // silently unreachable — the exact last-wins failure this validator
  // exists to reject.
  return a.value.toLowerCase() === b.value.toLowerCase();
}
