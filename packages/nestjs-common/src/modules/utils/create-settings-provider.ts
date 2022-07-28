import { InjectionToken, Provider } from '@nestjs/common';
import { ModuleOptionsSettingsInterface } from '@concepta/nestjs-core';

export function createSettingsProvider<
  ModuleSettingsType,
  ModuleOptionsType extends ModuleOptionsSettingsInterface<ModuleSettingsType>,
>(options: {
  settingsKey: string;
  settingsToken: string;
  optionsToken: InjectionToken;
  optionsOverrides?: ModuleOptionsType;
}): Provider {
  // break out the options
  const { optionsOverrides, settingsToken, optionsToken, settingsKey } =
    options;

  // return the settings provider
  return {
    provide: settingsToken,
    inject: [optionsToken, settingsKey],
    useFactory: async (
      moduleOptions: ModuleOptionsType,
      defaultSettings: ModuleSettingsType,
    ) => {
      return (
        optionsOverrides?.settings ?? moduleOptions.settings ?? defaultSettings
      );
    },
  };
}
