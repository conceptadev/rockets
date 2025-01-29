export interface AuthLocalRequestInterface {
  ip: string;
  headers: {
    'user-agent'?: string;
    [key: string]: string | undefined;
  };
}
