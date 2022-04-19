# Rockets NestJS JWT

A flexible JWT utilities module for signing and validating tokens.

This module extends/wraps the [@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt) module.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-jwt)](https://www.npmjs.com/package/@concepta/nestjs-jwt)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-jwt)](https://www.npmjs.com/package/@concepta/nestjs-jwt)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-common%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Overview

The module exports three services: `JwtSignService`, `JwtIssueService`, and `JwtVerifyService`.

The `JwtSignService` maintains two separate `JwtService` instances from the `@nestjs/jwt` module,
one for managing _access_ tokens and one for managing _refresh_ tokens.
Each one can be configured separately at registration time for maximum flexibility.

The `JwtIssueService` and `JwtVerifyService` use the `JwtSignService` internally for generating
and validating tokens.

## Installation

`yarn add @concepta/nestjs-jwt`

## Advanced Configuration

It is possible to override all services at registration time with a custom service that
meets their respective interfaces.
