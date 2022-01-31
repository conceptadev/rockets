import { Controller, Get, Post } from '@nestjs/common';
import {
  CrudBody,
  CrudController,
  CrudCreateOne,
  CrudReadOne,
  CrudRequest,
  CrudRequestInterface,
} from '@rockts-org/nestjs-crud';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UserCrudService } from './services/user-crud.service';
import { UserService } from './services/user.service';

@Controller('user')
@CrudController({ model: { type: User } })
export class UserController {
  constructor(
    private userService: UserService,
    private userCrudService: UserCrudService,
  ) {}

  @Get()
  @CrudReadOne()
  async getOne(@CrudRequest() req: CrudRequestInterface) {
    return this.userCrudService.getOne(req, {});
  }

  @Post()
  @CrudCreateOne()
  async createOne(
    @CrudRequest() crudRequest: CrudRequestInterface,
    @CrudBody() userDto: UserDto,
  ) {
    return this.userCrudService.createOne(crudRequest, userDto);
  }
}
