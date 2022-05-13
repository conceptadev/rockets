import { ReferenceDomain } from '../../reference.types';
import { ReferenceIdInterface } from '../reference-id.interface';

export interface LookupDomainInterface<
  T = ReferenceDomain,
  U = ReferenceIdInterface,
> {
  byDomain: (domain: T) => Promise<U | undefined>;
}
