<div align="center">
  <h1 align="center">Rockets Nest.js Authentication Module Sample</h1>

<p align="center">
    <a href="https://github.com"><strong>Explore the docs »</strong></a>
    <br />
    <br />
  </p>
</div>

## Description

A sample implementation of the [Nest.js](https://nestjs.com) Rockets API Authentication Module. With this library you can establish an user's identity receiving an JWT access token and refresh token.

</br>

## Libraries Documentation

A list of all the necessary Rockets libraries that the Authentication Module Sample relies on.

- [@rockts-org/nestjs-authentication](https://www.google.com)
- [@rockts-org/nestjs-user](https://www.google.com)
- [@rockts-org/nestjs-nestjs-typeorm-ext](https://www.google.com)
- [@rockts-org/nestjs-nestjs-password](https://www.google.com)
- [@rockts-org/nestjs-nestjs-jwt](https://www.google.com)
- [@rockts-org/nestjs-common](https://www.google.com)
- [@rockts-org/nestjs-auth-local](https://www.google.com)

</br>

## Getting Started

### Setup a new Nest.js project

```bash
$ npm i -g @nestjs/cli
$ nest new project-name
```

### Prerequisites

These libraries are necessary for the Authentication Module to run:

```bash
# install necessary 3rd party libraries
$ yarn add @rockts-org/nestjs-user @rockts-org/nestjs-typeorm-ext @rockts-org/nestjs-password @rockts-org/nestjs-jwt @rockts-org/nestjs-common @rockts-org/nestjs-authentication @rockts-org/nestjs-auth-local @golevelup/nestjs-modules
```

### Basic Sample Implementation

#### app.module.ts

- [app.module.ts example](https://gitlab.com/concepta/rockets/rockets/-/blob/develop/packages/nestjs-samples/src/03-authentication/app.module.ts)

#### Auth endpoint

```
http://localhost:3000/auth/login
```

#### Auth/login payload

```json
{
  "username": "user",
  "password": "my_password",
  "salt": "$32nfuh21fewrga231@#@#*E@esjow221"
}
```

#### Auth/login response example

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY0MjUyMjE0OH0.kEWxG1h4--82cso5y42DxQzx6Sbdvrte568xNf5FfJE",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImlhdCI6MTY0MjUyMjE0OH0.kEWxG1h4--82cso5y42DxQzx6Sbdvrte568xNf5FfJE"
}
```

📝 License

Copyright © 2022 Rockets.
