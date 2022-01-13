import { Injectable } from '@nestjs/common';
import { IssueTokenService } from './issue-token.service';

@Injectable()
export class DefaultIssueTokenService extends IssueTokenService {}
