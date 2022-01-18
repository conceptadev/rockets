export interface UserLookupServiceInterface<T> {
  getUser(...args: string[]): Promise<T>;
}
