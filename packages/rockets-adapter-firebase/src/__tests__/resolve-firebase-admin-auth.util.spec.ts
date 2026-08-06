import { vi, describe, it, expect, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

import { FirebaseAuthConfigurationException } from '../exceptions/firebase-auth-configuration.exception';
import { resolveFirebaseAdminAuth } from '../utils/resolve-firebase-admin-auth.util';

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn(),
}));

import { getAuth } from 'firebase-admin/auth';

describe('resolveFirebaseAdminAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses legacy `.auth()` when present', () => {
    const auth = {
      verifyIdToken: vi.fn(),
    };
    const app = { auth: () => auth };

    expect(resolveFirebaseAdminAuth(app)).toBe(auth);
    expect(getAuth).not.toHaveBeenCalled();
  });

  it('falls back to modular `getAuth(app)` when `.auth` is absent', () => {
    const auth = {
      verifyIdToken: vi.fn(),
    };
    (getAuth as Mock).mockReturnValue(auth);
    const app = { name: '[DEFAULT]' };

    expect(resolveFirebaseAdminAuth(app)).toBe(auth);
    expect(getAuth).toHaveBeenCalledWith(app);
  });

  it('wraps modular `getAuth` failures in FirebaseAuthConfigurationException', () => {
    (getAuth as Mock).mockImplementation(() => {
      throw new Error('app not found');
    });

    expect(() => resolveFirebaseAdminAuth({})).toThrow(
      FirebaseAuthConfigurationException,
    );
    expect(() => resolveFirebaseAdminAuth({})).toThrow(/not a usable/i);
  });
});
