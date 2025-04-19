import { ReferenceIdInterface } from './interfaces/reference-id.interface';

export type ReferenceIdRequired<T> = T extends Partial<
  ReferenceIdInterface<infer Z>
>
  ? T & ReferenceIdInterface<Z>
  : T;
