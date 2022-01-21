<div align="center">
  <h1 align="center">Rockets Nest.js Auth Local</h1>

  <p align="center">
    <a href="https://travis-ci.org"><img src="https://img.shields.io/travis" alt="Build Status" /></a>
    <a href="https://coveralls.io/github/onury/accesscontrol?branch=master"><img src="https://img.shields.io/coveralls" alt="Coverage Status" /></a>
    <a href="https://www.npmjs.com/package/accesscontrol"><img src="http://img.shields.io/npm/v" alt="npm" /></a>
    <a href="https://github.com/"><img src="http://img.shields.io/npm/l/" alt="License" /></a>
</p>
<br />

<p align="center">
    <a href="https://github.com"><strong>Explore the docs »</strong></a>
    <br />
    <br />
  </p>
</div>

## Description

A Nest.js local strategy for authentication.

<table>
  <thead>
    <tr>
      <th><a href="#installation">Install</a></th>
      <th><a href="#guide">Examples</a></th>
      <th><a href="#changelog">Changelog</a></th>
    </tr>
  </thead>
</table>

## Core Features

- Local stategy for setting up a Database
- Follow best practices for password storage, encryption and salting.
- Sign in using email and password.
- Follow NIST password guidelines, and storage

## Installation

with [**npm**](https://www.npmjs.com/package): `npm i @rockts-org/nestjs-auth-local --save`  
with [**yarn**](https://yarn.pm): `yarn add @rockts-org/nestjs-auth-local`

## Guide

### Prerequisites

- [@rockts-org/nestjs-authentication](https://github.com)
- [@rockts-org/nestjs-common](https://github.com)
- [@rockts-org/nestjs-password](https://github.com)
- [@rockts-org/nestjs-user](https://github.com)

### Basic Example

- You can find a basic usage of the Rockets Auth Local Module in this [Sample](https://github.com)

### Default Configuration

- You can find the default configuration of the Rockets Auth Local Module [HERE](https://gitlab.com/concepta/rockets/rockets/blob/48b9b2758fe2916a03b5e7fd1414d70f15d1237e/packages/nestjs-auth-local/src/config/auth-local-default.config.ts)

### Unit Tests

```bash

yarn test

```

### E2E Tests

```bash

yarn test:e2e

```

## Changelog

See [CHANGELOG](https://github.com).

## Documentation

You can read the full [**API reference**](https://github.com)

And you can see an implementation sample at [Authentication Module Sample](https://github.com)

📝 License

Copyright © 2022 Rockets.
