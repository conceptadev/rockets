import { readFirebaseErrorCode } from '../utils/read-firebase-error-code.util';

describe('readFirebaseErrorCode', () => {
  it('returns the string `code` from Error-like objects', () => {
    expect(
      readFirebaseErrorCode(
        Object.assign(new Error('revoked'), { code: 'auth/id-token-revoked' }),
      ),
    ).toBe('auth/id-token-revoked');
  });

  it('returns undefined when `code` is missing or not a string', () => {
    expect(readFirebaseErrorCode(new Error('nope'))).toBeUndefined();
    expect(readFirebaseErrorCode({ code: 123 })).toBeUndefined();
    expect(readFirebaseErrorCode(null)).toBeUndefined();
    expect(readFirebaseErrorCode('auth/id-token-revoked')).toBeUndefined();
  });
});
