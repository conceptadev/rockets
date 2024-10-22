/**
 * Parameters for checking if a translation key exists.
 */
export interface I18nTranslationKeys {
  /**
   * The namespace of the translation key.
   * Optional.
   */
  namespace?: string;

  /**
   * The translation key to check.
   * Required.
   */
  key: string;

  /**
   * The language of the translation key.
   * Optional.
   */
  language?: string;
}
