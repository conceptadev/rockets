# Rockets NestJS Core

The core module is a dependency of all Rockets modules.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-core)](https://www.npmjs.com/package/@concepta/nestjs-core)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-core)](https://www.npmjs.com/package/@concepta/nestjs-core)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Installation

`yarn add @concepta/nestjs-core`

## Configuration

Available configuration options:

1. [Deferred Registration](#deferred-registration)

### Deferred Registration

By default, modules that are registered using `.deferred()` do not have a timeout set.

If you module wirings make some asynchronous calls that may experience significant delays during start up,
it is a good idea to set the global `ROCKETS_MODULE_DEFERRED_TIMEOUT` environment variable to the number of
milliseconds that each module should timeout at.

#### Examples

Your .env file:

```zsh
# global deferred timeout
ROCKETS_MODULE_DEFERRED_TIMEOUT=5000
```

Your shell:

```zsh
export ROCKETS_MODULE_DEFERRED_TIMEOUT=5000;
```
