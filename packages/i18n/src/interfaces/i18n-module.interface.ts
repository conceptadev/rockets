import { Newable, NewableModule } from "i18next";
import { I18nObjectModule } from "./i18n.types";

export interface i18nextModule<T extends I18nObjectModule> {
  module: (T | NewableModule<T> | Newable<T>)
}