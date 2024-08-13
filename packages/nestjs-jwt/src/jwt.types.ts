export {
  NestJwtSignOptions as JwtSignOptions,
  NestJwtSignStringOptions as JwtSignStringOptions,
} from './jwt.externals';

export type JwtTokenType = 'access' | 'refresh';

export type JwtVerifyTokenCallback<
  ErrorType extends Error = Error,
  DecodedTokenType extends unknown = unknown,
> = (
  token: string,
  done: (err?: ErrorType, decodedToken?: DecodedTokenType) => void,
) => void;
