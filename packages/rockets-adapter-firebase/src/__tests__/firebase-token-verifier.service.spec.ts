import { vi, describe, it, expect } from 'vitest';

import { FirebaseTokenVerifierService } from '../services/firebase-token-verifier.service';
import * as firebaseAdminAuthUtils from '../utils/resolve-firebase-admin-auth.util';

describe(FirebaseTokenVerifierService.name, () => {
  it('delegates to firebase-admin auth() and forwards `checkRevoked`', async () => {
    const verifyIdToken = vi.fn().mockResolvedValue({
      uid: 'fb-1',
      email: 'a@b.com',
      iat: 1234,
    });
    const fakeApp = { auth: () => ({ verifyIdToken }) };

    const verifier = new FirebaseTokenVerifierService(fakeApp);

    const decoded = await verifier.verifyIdToken('a.b.c', {
      checkRevoked: true,
    });

    expect(verifyIdToken).toHaveBeenCalledWith('a.b.c', true);
    expect(decoded.uid).toBe('fb-1');
    expect(decoded.sub).toBe('fb-1');
    expect(decoded.email).toBe('a@b.com');
  });

  it('defaults `checkRevoked` to false when not supplied', async () => {
    const verifyIdToken = vi.fn().mockResolvedValue({ uid: 'fb-1' });
    const fakeApp = { auth: () => ({ verifyIdToken }) };

    const verifier = new FirebaseTokenVerifierService(fakeApp);

    await verifier.verifyIdToken('a.b.c');

    expect(verifyIdToken).toHaveBeenCalledWith('a.b.c', false);
  });

  it('uses getAuth() for modular firebase-admin/app instances', async () => {
    const verifyIdToken = vi.fn().mockResolvedValue({ uid: 'modular-1' });
    const resolveAuthSpy = vi
      .spyOn(firebaseAdminAuthUtils, 'resolveFirebaseAdminAuth')
      .mockReturnValue({
        verifyIdToken,
        verifySessionCookie: vi.fn(),
        createSessionCookie: vi.fn(),
      });

    const modularApp = { name: '[DEFAULT]' };
    const verifier = new FirebaseTokenVerifierService(modularApp);

    const decoded = await verifier.verifyIdToken('a.b.c');

    expect(resolveAuthSpy).toHaveBeenCalledWith(modularApp);
    expect(verifyIdToken).toHaveBeenCalledWith('a.b.c', false);
    expect(decoded.uid).toBe('modular-1');

    resolveAuthSpy.mockRestore();
  });

  it('propagates firebase-admin errors verbatim', async () => {
    const fakeApp = {
      auth: () => ({
        verifyIdToken: vi.fn().mockRejectedValue(
          Object.assign(new Error('expired'), {
            code: 'auth/id-token-expired',
          }),
        ),
      }),
    };

    const verifier = new FirebaseTokenVerifierService(fakeApp);

    await expect(verifier.verifyIdToken('expired.jwt')).rejects.toMatchObject({
      code: 'auth/id-token-expired',
    });
  });

  describe('verifySessionCookie (issue #58)', () => {
    it('delegates to firebase-admin auth() and forwards `checkRevoked`', async () => {
      const verifySessionCookie = vi.fn().mockResolvedValue({
        uid: 'fb-1',
        email: 'a@b.com',
      });
      const fakeApp = { auth: () => ({ verifySessionCookie }) };

      const verifier = new FirebaseTokenVerifierService(fakeApp);
      const decoded = await verifier.verifySessionCookie('cookie-value', {
        checkRevoked: true,
      });

      expect(verifySessionCookie).toHaveBeenCalledWith('cookie-value', true);
      expect(decoded.uid).toBe('fb-1');
      expect(decoded.sub).toBe('fb-1');
    });

    it('defaults `checkRevoked` to false when not supplied', async () => {
      const verifySessionCookie = vi.fn().mockResolvedValue({ uid: 'fb-1' });
      const fakeApp = { auth: () => ({ verifySessionCookie }) };

      const verifier = new FirebaseTokenVerifierService(fakeApp);
      await verifier.verifySessionCookie('cookie-value');

      expect(verifySessionCookie).toHaveBeenCalledWith('cookie-value', false);
    });

    it('propagates firebase-admin errors verbatim', async () => {
      const fakeApp = {
        auth: () => ({
          verifySessionCookie: vi.fn().mockRejectedValue(
            Object.assign(new Error('revoked'), {
              code: 'auth/session-cookie-revoked',
            }),
          ),
        }),
      };

      const verifier = new FirebaseTokenVerifierService(fakeApp);
      await expect(
        verifier.verifySessionCookie('cookie-value'),
      ).rejects.toMatchObject({ code: 'auth/session-cookie-revoked' });
    });
  });

  describe('createSessionCookie (issue #58)', () => {
    it('delegates to firebase-admin auth() with the expiresIn option', async () => {
      const createSessionCookie = vi.fn().mockResolvedValue('minted-cookie');
      const fakeApp = { auth: () => ({ createSessionCookie }) };

      const verifier = new FirebaseTokenVerifierService(fakeApp);
      const cookie = await verifier.createSessionCookie('id-token', {
        expiresIn: 60_000,
      });

      expect(createSessionCookie).toHaveBeenCalledWith('id-token', {
        expiresIn: 60_000,
      });
      expect(cookie).toBe('minted-cookie');
    });
  });
});
