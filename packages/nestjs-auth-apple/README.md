# Rockets NestJS Google Federated Authentication

Authenticate requests using apple OAuth2

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-auth-google)](https://www.npmjs.com/package/@concepta/nestjs-auth-google)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-auth-google)](https://www.npmjs.com/package/@concepta/nestjs-auth-google)
[![GH Last Commit](https://img.shields.io/google/last-commit/conceptadev/rockets?logo=google)](https://google.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/google/contributors/conceptadev/rockets?logo=google)](https://google.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/google/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Installation

`yarn add @concepta/nestjs-auth-apple`

## Prerequisites

Before using this package, ensure you have:

1. Enrolled in the [Apple Developer Program](https://developer.apple.com/programs/).
2. Familiarized yourself with Apple's ["Sign in with Apple" documentation](https://developer.apple.com/sign-in-with-apple/).
3. Created an App ID and Service ID in your Apple Developer Account.
4. Generated a private key for your Service ID in your Apple Developer Account.

## Setup

For detailed setup instructions, refer to the following resources:

- [What the Heck is Sign In with Apple?](https://developer.okta.com/blog/2019/06/04/what-the-heck-is-sign-in-with-apple)
  - A comprehensive blog post explaining the feature and setup process.
- [Apple Auth Setup Guide](https://github.com/ananay/apple-auth/blob/master/SETUP.md)
  - Step-by-step instructions for configuring Apple Sign In.

## Environment Variables

To configure Apple authentication, you need to set the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `APPLE_CLIENT_ID` | Your Apple Service ID (also known as the Services ID in Apple's Developer Portal). Typically in reverse domain name notation. | `com.conceptatech.rockets` |
| `APPLE_CALLBACK_URL` | The OAuth Redirect URI for Apple authentication. | `/auth/apple/callback` |
| `APPLE_SCOPE` | The requested scope(s) for Apple Sign In. | `'email'` |
| `APPLE_TEAM_ID` | Your Apple Developer Team ID. Found in the top right corner of the Apple Developer account page. | `'A1B2C3D4E5'` |
| `APPLE_KEY_ID` | The identifier for the private key on the Apple Developer Account page. | `'ABCDEF1234'` |
| `APPLE_PRIVATE_KEY_LOCATION` | The file path to your Apple private key (.p8 file). | `'./src/config/AuthKey.p8'` |
| `APPLE_PRIVATE_KEY_STRING` | The contents of your Apple private key as a string. Use this instead of `APPLE_PRIVATE_KEY_LOCATION` if you prefer to store the key directly in the environment. | `'-----BEGIN PRIVATE KEY-----\nMIGTAgEA...\n-----END PRIVATE KEY-----'` |

Example `.env` file: