import { FirebaseAuthConfigurationException } from '../exceptions/firebase-auth-configuration.exception';
import { resolveFirebaseAdminAuth } from '../utils/resolve-firebase-admin-auth.util';

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(),
}));

import { getAuth } from 'firebase-admin/auth';

describe('resolveFirebaseAdminAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses legacy `.auth()` when present', () => {
    const auth = {
      verifyIdToken: jest.fn(),
    };
    const app = { auth: () => auth };

    expect(resolveFirebaseAdminAuth(app)).toBe(auth);
    expect(getAuth).not.toHaveBeenCalled();
  });

  it('falls back to modular `getAuth(app)` when `.auth` is absent', () => {
    const auth = {
      verifyIdToken: jest.fn(),
    };
    (getAuth as jest.Mock).mockReturnValue(auth);
    const app = { name: '[DEFAULT]' };

    expect(resolveFirebaseAdminAuth(app)).toBe(auth);
    expect(getAuth).toHaveBeenCalledWith(app);
  });

  it('wraps modular `getAuth` failures in FirebaseAuthConfigurationException', () => {
    (getAuth as jest.Mock).mockImplementation(() => {
      throw new Error('app not found');
    });

    expect(() => resolveFirebaseAdminAuth({})).toThrow(
      FirebaseAuthConfigurationException,
    );
    expect(() => resolveFirebaseAdminAuth({})).toThrow(/not a usable/i);
  });
});
