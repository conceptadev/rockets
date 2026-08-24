import { Injectable } from '@nestjs/common';
import { AbstractRocketsGetRolesByIdsHandler } from './abstract-rockets-get-roles-by-ids.handler';

@Injectable()
export class RocketsGetRolesByIdsHandler extends AbstractRocketsGetRolesByIdsHandler {}
