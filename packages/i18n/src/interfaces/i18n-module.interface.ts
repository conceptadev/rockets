import { Newable, NewableModule } from 'i18next';
import { I18nObjectModule } from './i18n.types';

/**
 * Interface representing an I18n module.
 */
export interface I18nModule<T extends I18nObjectModule> {
  /**
   * The module property can be of type T, NewableModule<T>, or Newable<T>.
   */
  module: T | NewableModule<T> | Newable<T>;
}
