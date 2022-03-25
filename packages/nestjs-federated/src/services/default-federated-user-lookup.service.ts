import { Injectable } from '@nestjs/common';
import { FederatedUserLookupService } from './federated-user-lookup.service';


@Injectable()
export class DefaultFederatedUserLookupService extends FederatedUserLookupService {}
