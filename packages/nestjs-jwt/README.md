[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-jwt)](https://www.npmjs.com/package/@concepta/nestjs-jwt)
[![NPM Alpha](https://img.shields.io/npm/v/@concepta/nestjs-jwt/alpha)](https://www.npmjs.com/package/@concepta/nestjs-nestjscontrol)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-jwt)](https://www.npmjs.com/package/@concepta/nestjs-jwt)

[![GitHub Open Issues](https://img.shields.io/github/issues/conceptadev/rockets/nestjs-jwt)](https://github.com/conceptadev/rockets/labels/nestjs-jwt)
[![GitHub Closed Issues](https://img.shields.io/github/issues-closed/conceptadev/rockets/nestjs-jwt)](https://github.com/conceptadev/rockets/labels/nestjs-jwt)
[![GitHub Open PRs](https://img.shields.io/github/issues-pr/conceptadev/rockets/nestjs-jwt)](https://github.com/conceptadev/rockets/labels/nestjs-jwt)
[![GitHub Closed PRs](https://img.shields.io/github/issues-pr-closed/conceptadev/rockets/nestjs-jwt)](https://github.com/conceptadev/rockets/labels/nestjs-jwt)

# Rockets NestJS JWT

A flexible JWT utilities module for signing and validating tokens.

This module extends/wraps the [@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt) module.

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
