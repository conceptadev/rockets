import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `timingSafeEqual` is SPIED, not stubbed: the mock delegates to the
 * real implementation, so behaviour is unchanged and the spy exists
 * only so a test can assert WHICH comparison ran. Every other
 * assertion in this file — accept, reject, prefix, malformed — is
 * equally satisfied by a plain `===`, so without this the constant-time
 * property could be deleted with the suite still green.
 */
vi.mock('node:crypto', async (importOriginal) => {
  const actual = await importOriginal<typeof import('node:crypto')>();
  return { ...actual, timingSafeEqual: vi.fn(actual.timingSafeEqual) };
});

import { createHmac, timingSafeEqual } from 'node:crypto';

import {
  createWebhookSignatureVerifier,
  verifyWebhookSignature,
} from './verify-webhook-signature';

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * `timingSafeEqual` accepts any `ArrayBufferView`, so its recorded
 * arguments are not statically Buffers. Asserting that they ARE is part
 * of the check: comparing anything else would not be a byte compare.
 */
function asHex(view: unknown): string {
  if (!Buffer.isBuffer(view)) {
    throw new Error(`expected a Buffer, received ${typeof view}`);
  }
  return view.toString('hex');
}

describe('verifyWebhookSignature', () => {
  const secret = 'whsec_test';
  const payload = JSON.stringify({ event: 'charge.succeeded', id: 'ch_1' });

  beforeEach(() => {
    vi.mocked(timingSafeEqual).mockClear();
  });

  it('accepts a correctly signed payload', () => {
    const signature = sign(payload, secret);

    expect(verifyWebhookSignature({ payload, signature, secret })).toBe(true);
  });

  it('rejects a payload signed with the wrong secret', () => {
    const signature = sign(payload, 'wrong-secret');

    expect(verifyWebhookSignature({ payload, signature, secret })).toBe(false);
  });

  it('rejects a tampered payload even with a validly-formatted signature', () => {
    const signature = sign(payload, secret);
    const tampered = JSON.stringify({ event: 'charge.succeeded', id: 'ch_2' });

    expect(
      verifyWebhookSignature({ payload: tampered, signature, secret }),
    ).toBe(false);
  });

  it('strips a provider prefix before comparing (GitHub/Stripe-style)', () => {
    const signature = `sha256=${sign(payload, secret)}`;

    expect(
      verifyWebhookSignature({
        payload,
        signature,
        secret,
        prefix: 'sha256=',
      }),
    ).toBe(true);
  });

  it('rejects a malformed signature header instead of throwing', () => {
    expect(
      verifyWebhookSignature({
        payload,
        signature: 'not-hex!!',
        secret,
      }),
    ).toBe(false);
  });

  /**
   * `Buffer.from(x, 'hex')` decodes greedily and stops at the first
   * invalid pair, so a VALID digest with garbage appended decoded to
   * exactly the valid bytes and verified TRUE. Not forgeable — the
   * attacker still needs the real digest — but a signature that accepts
   * infinitely many spellings of itself is malleable, and downstream
   * replay/dedupe keyed on the header value inherits that.
   */
  describe('malleability: a valid digest with garbage appended', () => {
    it('rejects trailing non-hex characters', () => {
      const signature = sign(payload, secret);

      expect(
        verifyWebhookSignature({
          payload,
          signature: `${signature}ZZZZ`,
          secret,
        }),
      ).toBe(false);
    });

    it('rejects trailing whitespace', () => {
      const signature = sign(payload, secret);

      expect(
        verifyWebhookSignature({ payload, signature: `${signature} `, secret }),
      ).toBe(false);
    });

    it('rejects an odd-length digest that would truncate to a valid one', () => {
      const signature = sign(payload, secret);

      expect(
        verifyWebhookSignature({
          payload,
          signature: `${signature}a`,
          secret,
        }),
      ).toBe(false);
    });

    it('still accepts the same digest in upper case (hex is case-insensitive)', () => {
      const signature = sign(payload, secret).toUpperCase();

      expect(verifyWebhookSignature({ payload, signature, secret })).toBe(true);
    });
  });

  it('rejects a signature of the wrong length instead of throwing', () => {
    expect(
      verifyWebhookSignature({
        payload,
        signature: 'ab',
        secret,
      }),
    ).toBe(false);
  });

  describe('constant-time comparison', () => {
    it('compares the digests with crypto.timingSafeEqual, not ===', () => {
      const signature = sign(payload, secret);

      expect(verifyWebhookSignature({ payload, signature, secret })).toBe(true);

      expect(timingSafeEqual).toHaveBeenCalledTimes(1);
      const [providedBuf, expectedBuf] =
        vi.mocked(timingSafeEqual).mock.calls[0];
      expect(asHex(providedBuf)).toBe(signature);
      expect(asHex(expectedBuf)).toBe(signature);
    });

    it('still uses timingSafeEqual for a same-length WRONG signature', () => {
      const signature = sign(payload, 'wrong-secret');

      expect(verifyWebhookSignature({ payload, signature, secret })).toBe(
        false,
      );
      expect(timingSafeEqual).toHaveBeenCalledTimes(1);
    });

    it('never reaches timingSafeEqual with mismatched lengths (it throws there)', () => {
      expect(verifyWebhookSignature({ payload, signature: 'ab', secret })).toBe(
        false,
      );
      expect(timingSafeEqual).not.toHaveBeenCalled();
    });
  });

  /**
   * A bad secret or algorithm is a DEPLOYMENT fault, not a forged
   * request. Answering it with `false` turned every legitimate delivery
   * into a permanent 401 with nothing in the logs naming the cause.
   */
  describe('configuration faults throw instead of returning false', () => {
    it('throws on an empty secret', () => {
      expect(() =>
        verifyWebhookSignature({
          payload,
          signature: sign(payload, secret),
          secret: '',
        }),
      ).toThrow(/non-empty string/);
    });

    it('throws on a missing secret (the `process.env.X!` shape)', () => {
      const missing: string | undefined = undefined;

      expect(() =>
        verifyWebhookSignature({
          payload,
          signature: sign(payload, secret),
          // Reproduces the documented `process.env.WEBHOOK_SECRET!`
          // pattern with the variable unset — the assertion the type
          // system cannot check.
          secret: missing as unknown as string,
        }),
      ).toThrow(/non-empty string/);
    });

    it('throws on an unsupported algorithm', () => {
      expect(() =>
        verifyWebhookSignature({
          payload,
          signature: sign(payload, secret),
          secret,
          algorithm: 'not-a-digest',
        }),
      ).toThrow(/unsupported HMAC algorithm "not-a-digest"/);
    });
  });
});

describe('createWebhookSignatureVerifier', () => {
  const secret = 'whsec_test';
  const payload = JSON.stringify({ event: 'charge.succeeded', id: 'ch_1' });

  it('verifies with the bound secret', () => {
    const verify = createWebhookSignatureVerifier({ secret });

    expect(verify(payload, sign(payload, secret))).toBe(true);
    expect(verify(payload, sign(payload, 'other'))).toBe(false);
  });

  it('applies the bound prefix', () => {
    const verify = createWebhookSignatureVerifier({
      secret,
      prefix: 'sha256=',
    });

    expect(verify(payload, `sha256=${sign(payload, secret)}`)).toBe(true);
  });

  /**
   * The point of the factory: this throw happens while Nest builds the
   * module, so the app refuses to boot rather than 401-ing every real
   * delivery once it is live.
   */
  it('fails at construction on a missing secret, before any request', () => {
    const missing: string | undefined = undefined;

    // No cast needed: the factory ACCEPTS `string | undefined`, which is
    // what `process.env.X` actually is — that is the point of the seam.
    expect(() => createWebhookSignatureVerifier({ secret: missing })).toThrow(
      /non-empty string/,
    );
  });

  it('fails at construction on an unsupported algorithm', () => {
    expect(() =>
      createWebhookSignatureVerifier({ secret, algorithm: 'not-a-digest' }),
    ).toThrow(/unsupported HMAC algorithm/);
  });
});
