import { Injectable } from '@nestjs/common';
import { JwtServiceInterface } from '../interfaces/jwt-service.interface';
import { NestJwtService } from '../jwt.externals';


@Injectable()
export class JwtService extends NestJwtService implements JwtServiceInterface {}
