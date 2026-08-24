import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { verifyWebhookSignature } from './verify-webhook-signature';

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

describe('verifyWebhookSignature', () => {
  const secret = 'whsec_test';
  const payload = JSON.stringify({ event: 'charge.succeeded', id: 'ch_1' });

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

  it('rejects a signature of the wrong length instead of throwing', () => {
    expect(
      verifyWebhookSignature({
        payload,
        signature: 'ab',
        secret,
      }),
    ).toBe(false);
  });
});
