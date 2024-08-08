import { Callback, Module, Newable, NewableModule, TOptions } from "i18next";

export type I18nObjectModule = Module;
export type I18nTranslationOptions = TOptions;
export type I18nCallback = Callback;
export type i18nextModuleType<T extends I18nObjectModule> = T | NewableModule<T> | Newable<T>;

