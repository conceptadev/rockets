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

  // The one that matters. `Buffer.from(s, 'hex')` does NOT throw on
  // malformed input — it decodes leading valid pairs and stops at the
  // first non-hex character. So a VALID token with garbage appended
  // decoded to exactly the expected bytes, passed the length compare
  // (both 32 bytes), and verified TRUE: the function accepted a string
  // it had never minted. The shape gate before decoding is what fixes
  // it; delete the gate and this test goes red.
  it('rejects a valid token with garbage appended', () => {
    const token = generateCsrfToken('sess-1', 'secret');
    expect(verifyCsrfToken(token, 'sess-1', 'secret')).toBe(true);
    expect(verifyCsrfToken(`${token}!!!`, 'sess-1', 'secret')).toBe(false);
    expect(verifyCsrfToken(`${token}zzzz`, 'sess-1', 'secret')).toBe(false);
    expect(verifyCsrfToken(`${token} `, 'sess-1', 'secret')).toBe(false);
  });

  it('rejects a token whose 64 characters are not all hex', () => {
    const token = generateCsrfToken('sess-1', 'secret');
    // Same length, one character out of alphabet — Buffer.from would
    // have truncated to a shorter buffer, which the length compare
    // happened to catch; the shape gate states the rule outright.
    const tampered = `${token.slice(0, 63)}z`;
    expect(tampered).toHaveLength(64);
    expect(verifyCsrfToken(tampered, 'sess-1', 'secret')).toBe(false);
  });

  it('accepts the minted token in upper case — hex is case-insensitive', () => {
    const token = generateCsrfToken('sess-1', 'secret');
    expect(verifyCsrfToken(token.toUpperCase(), 'sess-1', 'secret')).toBe(true);
  });

  it('rejects an empty token', () => {
    expect(verifyCsrfToken('', 'sess-1', 'secret')).toBe(false);
  });

  it('different sessions mint different tokens', () => {
    const a = generateCsrfToken('sess-1', 'secret');
    const b = generateCsrfToken('sess-2', 'secret');
    expect(a).not.toBe(b);
  });
});
