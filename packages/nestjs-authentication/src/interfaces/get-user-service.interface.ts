export interface GetUserServiceInterface<T> {
  getUser(...args: string[]): Promise<T>;
}
