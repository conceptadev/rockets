/**
  Thrown at module bootstrap when Firebase auth options are invalid
  (for example neither `firebaseApp` nor `verifier` is supplied).
 
  This is a configuration error, not an authentication failure — it must
  never be mapped to HTTP 401. Fail closed at boot instead.
 */
export class FirebaseAuthConfigurationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FirebaseAuthConfigurationException';
  }
}
