import { FirebaseAuthConfigurationException } from '../exceptions/firebase-auth-configuration.exception';
import { FirebaseAuthException } from '../exceptions/firebase-auth.exception';
import {
  FirebaseTokenInvalidException,
  FirebaseTokenMissingSubjectException,
  FirebaseTokenRevokedException,
} from '../exceptions/firebase-token-invalid.exception';

describe('Firebase auth exceptions', () => {
  it('preserves cause on FirebaseAuthException without putting it in the message', () => {
    const cause = new Error('sdk detail');
    const error = new FirebaseAuthException('public message', cause);

    expect(error.message).toBe('public message');
    expect(error.cause).toBe(cause);
    expect(error.getStatus()).toBe(401);
  });

  it('uses static messages for token invalid / revoked', () => {
    const invalid = new FirebaseTokenInvalidException({ code: 'x' });
    const revoked = new FirebaseTokenRevokedException({ code: 'y' });

    expect(invalid.message).toBe('Firebase ID token is invalid or expired');
    expect(revoked.message).toBe('Firebase ID token has been revoked');
    expect(invalid.cause).toEqual({ code: 'x' });
    expect(revoked.cause).toEqual({ code: 'y' });
  });

  it('omits cause on FirebaseTokenMissingSubjectException by design', () => {
    const error = new FirebaseTokenMissingSubjectException();

    expect(error.message).toMatch(/uid/);
    expect(error.cause).toBeUndefined();
  });

  it('names FirebaseAuthConfigurationException distinctly from auth failures', () => {
    const error = new FirebaseAuthConfigurationException('bad wiring');
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(FirebaseAuthException);
    expect(error.name).toBe('FirebaseAuthConfigurationException');
    expect(error.message).toBe('bad wiring');
  });
});
