import { parse, type Token } from 'path-to-regexp';

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

function segmentListsMayOverlap(
  a: readonly Segment[],
  b: readonly Segment[],
): RoutePatternOverlap {
  let unknown = false;
  const max = Math.max(a.length, b.length);
  for (let index = 0; index < max; index += 1) {
    const left = a[index];
    const right = b[index];
    if (left === undefined || right === undefined) {
      return false;
    }
    const overlap = segmentsMayOverlap(left, right);
    if (overlap === false) {
      return false;
    }
    if (overlap === 'unknown') {
      unknown = true;
    }
    if (left.kind === 'wildcard' || right.kind === 'wildcard') {
      return true;
    }
  }
  return unknown ? 'unknown' : true;
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
  return a.value === b.value;
}
