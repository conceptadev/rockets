import { InitOptions } from 'i18next';

/**
 * Interface extending InitOptions from i18next with generic type T.
 */
export interface I18nOptions<T = object> extends InitOptions<T> {}
