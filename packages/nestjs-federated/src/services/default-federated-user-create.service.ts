import { Injectable } from '@nestjs/common';
import { FederatedUserCreateService } from './federated-user-create.service';



@Injectable()
export class DefaultFederatedUserCreateService extends FederatedUserCreateService {}
