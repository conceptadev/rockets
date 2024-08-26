import { Callback, Module, Newable, NewableModule, TOptions } from 'i18next';

/**
 * Represents an i18n module object.
 */
export type I18nObjectModule = Module;

/**
 * Options for i18n translation.
 */
export type I18nTranslationOptions = TOptions;

/**
 * Callback function for i18n operations.
 */
export type I18nCallback = Callback;

/**
 * Type representing an i18next module, which can be an instance of the module,
 * a newable module, or a newable type.
 */
export type I18nextModuleType<T extends I18nObjectModule> =
  | T
  | NewableModule<T>
  | Newable<T>;
