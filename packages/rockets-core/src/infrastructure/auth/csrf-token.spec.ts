import { describe, it, expect } from 'vitest';
import { generateCsrfToken, verifyCsrfToken } from './csrf-token';

describe('generateCsrfToken / verifyCsrfToken', () => {
  it('a freshly generated token verifies against its own session+secret', () => {
    const token = generateCsrfToken('sess-1', 'secret');
    expect(verifyCsrfToken(token, 'sess-1', 'secret')).toBe(true);
  });

  it('is deterministic — same session+secret always mints the same token', () => {
    const a = generateCsrfToken('sess-1', 'secret');
    const b = generateCsrfToken('sess-1', 'secret');
    expect(a).toBe(b);
  });

  it('rejects a token minted for a different session', () => {
    const token = generateCsrfToken('sess-1', 'secret');
    expect(verifyCsrfToken(token, 'sess-2', 'secret')).toBe(false);
  });

  it('rejects a token minted with a different secret', () => {
    const token = generateCsrfToken('sess-1', 'secret-a');
    expect(verifyCsrfToken(token, 'sess-1', 'secret-b')).toBe(false);
  });

  it('rejects a malformed (non-hex) token instead of throwing', () => {
    expect(verifyCsrfToken('not-hex!!', 'sess-1', 'secret')).toBe(false);
  });

  it('rejects a token of the wrong length instead of throwing', () => {
    expect(verifyCsrfToken('ab', 'sess-1', 'secret')).toBe(false);
  });

  it('different sessions mint different tokens', () => {
    const a = generateCsrfToken('sess-1', 'secret');
    const b = generateCsrfToken('sess-2', 'secret');
    expect(a).not.toBe(b);
  });
});
