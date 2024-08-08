// TODO: should we create a wrapper for this?
import i18next, { Callback } from 'i18next';
import {
  I18nCallback,
  I18nObjectModule,
  i18nextModuleType
} from './interfaces/i18n.types';
import { I18Settings } from './interfaces/i18n-settings.interface';
import { TranslateParams } from './interfaces/i18n-translate-params.interface';
import { LocalesInterface } from './interfaces/i18n-locales.interface';
import { KeyExistsParams } from './interfaces/i18n-key-exists-params.interface';
import { I18nextOptions } from './interfaces/i18n-options.interface';

export class I18n { 
  static instance = i18next.createInstance();
 
  /**
   * Adds a module to the i18next instance.
   * 
   * @template T - The type of the module.
   * @param module - The module to add.
   * @returns The i18next instance.
   * 
   * @example
   * // Example of adding a custom backend module
   * import Backend from 'i18next-custom-backend';
   * 
   * I18n.addModule(Backend);
   */
  static addModule = <T extends I18nObjectModule>(module: i18nextModuleType<T>) => { 
    return I18n.instance.use(module)
  }

  /**
   * Adds multiple modules to the i18next instance.
   * 
   * @template T - The type of the modules.
   * @param modules - An array of modules to add.
   * 
   * @example
   * // Example of adding multiple custom backend modules
   * import Backend1 from 'i18next-custom-backend1';
   * import Backend2 from 'i18next-custom-backend2';
   * 
   * I18n.addModules([Backend1, Backend2]);
   */
  static addModules = <T extends I18nObjectModule>(modules?: i18nextModuleType<T>[]) => { 
    try {
      if (modules && modules.length > 0 )
      modules.forEach((m) => {
        I18n.addModule(m)
      })
    } catch (e) { 
      console.error('Error adding module');
    }
  }

  /**
   * Retrieves the i18next instance.
   * 
   * @returns The i18next instance.
   * 
   * @example
   * const i18nInstance = I18n.getInstance();
   */
  static getInstance = () => {
    return I18n.instance;
  }

  /**
   * Changes the language. The callback will be called as soon translations were 
   * loaded or an error occurs while loading. HINT: For easy testing - setting 
   * lng to 'cimode' will set t function to always return the key.
   * 
   * @param language - The language to change to.
   * @returns A promise that resolves when the language change is complete.
   * 
   * @example
   * await I18n.changeLanguage('fr');
   */
  static changeLanguage = async (language: string, callback?: Callback): Promise<void> => {
    try {
      await I18n.instance.changeLanguage(language, callback);
      console.log(`Language changed to ${language}`);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  }

  /**
   * Resets the i18next instance by creating a new instance.
   * 
   * @example
   * I18n.reset();
   */
  static reset = () => {
    I18n.instance =  i18next.createInstance();
  }

  /**
   * Initializes the i18next instance with the provided settings.
   * 
   * @template T - The type of the settings.
   * @param settings - The settings to initialize i18next with.
   * @param callback - Optional callback to be called after initialization.
   * 
   * @example
   * const settings = {
   *   modules: [Backend],
   *   options: {
   *     lng: 'en',
   *     resources: {
   *       en: {
   *         translation: {
   *           hello: "hello world"
   *         }
   *       }
   *     }
   *   }
   * };
   * I18n.init(settings);
   */
  static init = <T>(settings?: I18Settings<T>, callback?: I18nCallback) => {
    I18n.addModules(settings?.modules)
  
    const i18nextOptions: I18nextOptions<T> = {
      debug: true,
      preload: ['en'],
      fallbackLng: 'en',
      ns: ['translation'],
      defaultNS: 'translation',
      ...settings?.options
    };
  
    I18n.instance.init<T>(i18nextOptions, callback);
  }
  
  /**
   * Translates a given key using the provided parameters.
   * 
   * @param params - The parameters for translation.
   * @returns The translated string.
   * 
   * @example
   * const translation = I18n.translate({
   *   key: 'hello',
   *   namespace: 'common',
   *   language: 'fr',
   *   defaultMessage: 'Bonjour',
   * });
   */
  static translate = (params: TranslateParams): string => {
    const {
      namespace = I18n.getDefaultNamespace(),
      language = I18n.getCurrentLanguage(),
      options = {},
      key,
      defaultMessage = ''
    } = params;
    const doesKeyExists = I18n.keyExists({
      namespace,
      key,
      language
    })
  
    const t = I18n.instance.getFixedT(language);
    const result = doesKeyExists ? t(`${namespace}:${key}`, options) : defaultMessage; 
    return result;
  } 
  
  /**
   * Retrieves the default namespace from the i18next instance options.
   * 
   * @returns The default namespace as a string.
   * 
   * @example
   * const defaultNamespace = I18n.getDefaultNamespace();
   */
  static getDefaultNamespace = (): string => {
    // TODO: need to validate what to do if defaultNS is set to false
    const defaultNS = I18n.instance.options.defaultNS;
    if (typeof defaultNS === 'string') {
      return defaultNS;
    } else if (Array.isArray(defaultNS) && defaultNS.length > 0) {
      return defaultNS[0];
    } else {
      return 'translation'; // Fallback to a default namespace
    }
  }

  /**
   * Retrieves the current language detected from the i18next instance.
   *
   * @returns The default language as a string.
   * 
   * @example
   * const defaultLanguage = I18n.getDefaultLanguage();
   */
  static getCurrentLanguage = (): string => {
    return I18n.instance.language;
  }
  
   /**
   * Adds translations to the i18next instance.
   * Adds a complete bundle. Setting deep param to true will extend existing 
   * translations in that file. Setting overwrite to true it will overwrite 
   * existing key translations in that file.
   * 
   * @param locales - An array of locale objects containing translation data.
   * 
   * @example
   * const locales = [
   *   {
   *     namespace: 'common',
   *     resource: { key: 'value' },
   *     language: 'en',
   *     deep: true,
   *     overwrite: true
   *   }
   * ];
   * I18n.addTranslations(locales);
   */
  static addTranslations = (locales: LocalesInterface[]) => {
    
    if (!I18n.instance.isInitialized) {
      console.error('i18next was not isInitialized, please call init');
      return;
    }
    locales.forEach(locale => {
      const { namespace = I18n.getDefaultNamespace(), resource, language = I18n.getCurrentLanguage(), deep, overwrite } = locale;
      I18n.instance.addResourceBundle(language, namespace, resource, deep, overwrite ); 
    });
  };
  
  /**
   * Checks if a translation key exists in the i18next instance.
   * 
   * @param params - The parameters to check if the key exists.
   * @returns A boolean indicating whether the key exists.
   * 
   * @example
   * const exists = I18n.keyExists({
   *   key: 'hello',
   *   namespace: 'common',
   *   language: 'fr'
   * });
   */
  static keyExists = (params: KeyExistsParams): boolean => {
    const { namespace = I18n.getDefaultNamespace(), key, language = I18n.getCurrentLanguage() } = params;
    return I18n.instance.exists(`${namespace}:${key}`, { lng: language });
  }
}