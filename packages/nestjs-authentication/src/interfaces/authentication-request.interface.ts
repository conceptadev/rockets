export interface AuthenticationRequestInterface {
  ip: string;
  headers: {
    'user-agent'?: string;
    [key: string]: string | undefined;
  };
}
