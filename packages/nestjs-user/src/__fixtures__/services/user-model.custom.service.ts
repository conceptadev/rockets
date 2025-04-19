import { Injectable } from '@nestjs/common';
import { UserModelService } from '../../services/user-model.service';

@Injectable()
export class UserModelCustomService extends UserModelService {
  /**
   * Dummy property for easily identifying service override.
   */
  hello? = 'world';
}
