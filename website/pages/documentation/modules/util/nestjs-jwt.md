# Rockets NestJS JWT

A flexible JWT utilities module for signing and validating tokens.

This module extends/wraps the [@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt) module.

## Overview

The module exports three services: `JwtSignService`, `JwtIssueService`, and `JwtVerifyService`.

The `JwtSignService` maintains two separate `JwtService` instances from the `@nestjs/jwt` module,
one for managing *access* tokens and one for managing *refresh* tokens.
Each one can be configured separately at registration time for maximum flexibility.

The `JwtIssueService` and `JwtVerifyService` use the `JwtSignService` internally for generating
and validating tokens.

## Installation

`yarn add @concepta/nestjs-jwt`

## Advanced Configuration

It is possible to override all services at registration time with a custom service that
meets their respective interfaces.
