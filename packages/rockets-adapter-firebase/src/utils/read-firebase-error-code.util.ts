/**
  Reads the Firebase Admin SDK `code` field from a thrown error when present.
 
  Used by {@link FirebaseAuthAdapter} to distinguish
  `auth/id-token-revoked` from other verification failures.
 */
export function readFirebaseErrorCode(error: unknown): string | undefined {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  ) {
    return (error as { code: string }).code;
  }
  return undefined;
}
