import { Injectable } from '@nestjs/common';
import { JwtIssueService } from './jwt-issue.service';

@Injectable()
export class DefaultJwtIssueService extends JwtIssueService {}
