/**
 * Helper to split log level string and assign to correct log level type.
 *
 * @internal
 * @param scopes - Log levels to split
 */
export function authGoogleScopeParse(scopes: string): string[] {
  // trim the string
  const levelsTrimmed = scopes.trim();

  // is there any length?
  if (!scopes.length) {
    // no, return empty array
    return [];
  }

  // get raw strings
  const levelTypes: string[] = levelsTrimmed.split(',');

  // map all to log level enum
  return levelTypes.map((levelType) => {
    // trim the log level
    return levelType.trim();
  });
}
