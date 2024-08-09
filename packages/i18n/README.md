
# i18n Module for React

An advanced i18n (internationalization) utility for managing multiple languages in React applications with seamless integration and modularity.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/i18n)](https://www.npmjs.com/package/@concepta/i18n)  
[![NPM Downloads](https://img.shields.io/npm/dw/@concepta/i18n)](https://www.npmjs.com/package/@concepta/i18n)  
[![GH Last Commit](https://img.shields.io/github/last-commit/yourorg/i18n?logo=github)](https://github.com/yourorg/i18n)  
[![GH Contrib](https://img.shields.io/github/contributors/yourorg/i18n?logo=github)](https://github.com/yourorg/i18n/graphs/contributors)

# Table of Contents

1. [Tutorials](#tutorials)
   - [Getting Started with i18n](#getting-started-with-i18n)
     - [Installation](#installation)
   - [Basic Setup](#basic-setup)
   - [Example](#example)
     - [Adding a Custom Backend Module](#adding-a-custom-backend-module)
     - [Changing Language Dynamically](#changing-language-dynamically)
     - [Adding Translations](#adding-translations)
2. [How-To Guides](#how-to-guides)
   - [Creating a Custom Translation Module](#creating-a-custom-translation-module)
   - [Handling Missing Translations](#handling-missing-translations)
   - [Using i18n in Tests](#using-i18n-in-tests)
3. [Reference](#reference)
   - [i18n API Methods](#i18n-api-methods)
   - [Supported i18n Modules](#supported-i18n-modules)
4. [Explanation](#explanation)
   - [What is i18n?](#what-is-i18n)
   - [How i18n Module Works](#how-i18n-module-works)
   - [Benefits of Using i18n](#benefits-of-using-i18n)
   - [Common i18n Pitfalls](#common-i18n-pitfalls)

# Tutorials

## Getting Started with i18n

### Installation

Install the `@concepta/i18n` package using yarn or npm:

yarn add @concepta/i18n

npm install @concepta/i18n

## Basic Setup

To set up the i18n module, you need to initialize it with your desired settings and add your translations. For more detailed settings documentation, check [i18next](https://www.i18next.com/).

```ts
// i18nSetup.js
import { I18n, t } from '@concepta/i18n';

export function initI18n() {
  I18n.init({
    options: {
      fallbackLng: 'en',
      resources: {
        en: {
          'translation': {
            hello: "Hi"
          }
        },
        pt: {
          'translation': {
            hello: "Olá"
          }
        }
      }
    }
  });
  // initialized and ready to go!
  // i18n is already initialized, because the translation resources were passed via init function
}

export { t };
```
```ts
import { initI18n, t } from './i18nSetup';

// Initialize i18n when the application loads
initI18n();

// result: Hi
console.log(t({ key: 'hello' }));

// result: Olá
console.log(t({ 
  key: 'hello', 
  language: 'pt' 
}));
```
## Example

These are basic examples to help you get started with the i18n module.

### Adding a Custom Backend Module with typescript 

To add a custom backend module for fetching translations:
```json
//./locales/en/translation.json
{
  "hello": "Hi"
}
```
```json
//./locales/pt/translation.json
{
  "hello": "Olá"
}
```
```ts
import I18NexFsBackend, { FsBackendOptions } from 'i18next-fs-backend';
import { I18n, t } from '@concepta/i18n';

//...
I18n.init<FsBackendOptions>({
  modules: [I18NexFsBackend],
  options: {
    initImmediate: false,
    ns: ['translation'],
    backend: {
      loadPath: join(__dirname, './locales/{{lng}}/{{ns}}.json')
    },
    supportedLngs: ['en', 'pt'],
    preload: ['en', 'pt'],
    fallbackLng: 'en'
  }
});
//...
```

# How-To Guides

## Changing Language Dynamically

You can change the language at runtime:

```ts
//...
I18n.init({
  options: {
    resources: {
      en: {
        'translation': {
          hello: "Hi"
        }
      },
      pt: {
        'translation': {
          hello: "Olá"
        }
      }
    }
  }
});
// result: Hi
console.log(t({ key: 'hello' }));

I18n.changeLanguage('pt');

// result: Olá
console.log(t({ key: 'hello' }));
```

## Adding Translations

To add translations dynamically, you can initialize the I18n instance first and add 
translation resources at a later time. This approach is useful in scenarios where 
translations are fetched from an external source or need to be updated without 
reinitializing the entire i18n setup.

This method is particularly beneficial in the following situations:

- **Fetching Translations from an API**: When translations are retrieved from a 
  remote server, you can initialize i18n once and update translations as they 
  become available.
- **Modular Applications**: In large applications with multiple modules, 
  translations can be added as each module is loaded, reducing the initial load 
  time.
- **Real-time Updates**: If your application supports real-time updates, you can 
  dynamically add new translations without disrupting the user experience.
```ts
//...
I18n.init();

const locales = [
  {
    namespace: 'common',
    language: 'en',
    resource: { welcome: 'Welcome' },
  },
  {
    namespace: 'common',
    language: 'fr',
    resource: { welcome: 'Bienvenue' },
  },
];

I18n.addTranslations(locales);

// Welcome
console.log(t({ 
  namespace: 'common', 
  key: 'welcome', 
  language: 'en' 
}));

// Bienvenue
console.log(t({ 
  namespace: 'common', 
  key: 'welcome', 
  language: 'fr' 
}));
```
## Creating a Custom Translation Module

You can create custom translation modules to extend the i18n functionality. Here’s how:

### **Define the Module**: Add modules on initialization

```ts
import { MyCustomModule } from './my-custom-module';
import { I18n } from '@concepta/i18n';

I18n.init({
  modules: [MyCustomModule],
  options: {
    //...
  }
});
```

## Handling Missing Translations

To handle missing translations gracefully:
```ts
import { I18n, t } from '@concepta/i18n';
I18n.translate({
  key: 'missing_key',
  namespace: 'common',
  defaultMessage: 'This is the default text',
});

// or
t({
  key: 'missing_key',
  namespace: 'common',
  defaultMessage: 'This is the default text',
});
```

# Reference

Please check (API Reference)[] for more information.

# Explanation

## What is i18n?

i18n, short for internationalization, refers to the process of designing software applications that can be adapted to various languages and regions without engineering changes.

## How i18n Module Works

The i18n module in this package provides a wrapper around i18next, allowing seamless integration of translation modules and dynamic language switching.

### Benefits of Using i18n

- **Flexibility**: Supports multiple languages and dynamic translation updates.
- **Modularity**: Easily extendable with custom modules for translation management.
- **Ease of Use**: Simple API to manage translations and switch languages.

### Common i18n Pitfalls

- **Missing Translations**: Ensure all necessary translations are provided for each language.
- **Performance Overheads**: Avoid loading unnecessary translation files by using modular imports.
