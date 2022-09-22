import { ReferenceDomain } from '../../reference.types';
import { ReferenceIdInterface } from '../reference-id.interface';
import { ReferenceQueryOptionsInterface } from '../reference-query-options.interface';

export interface LookupDomainInterface<
  T = ReferenceDomain,
  U = ReferenceIdInterface,
  O extends ReferenceQueryOptionsInterface = ReferenceQueryOptionsInterface,
> {
  byDomain: (domain: T, options?: O) => Promise<U | undefined>;
}
