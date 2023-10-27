import { Body, Controller, ForbiddenException, Get, HttpStatus, Res } from '@nestjs/common';
import { AppService } from './app.service';

import { Response } from 'express';
import { ForbiddenError, subject } from '@casl/ability';
import { UsersService } from './users/users.service';
import { UserEntity } from './users/entities/user.entity';
import { UserFromTokenPipe } from './users/users.pipe';
import { CreateUserDto } from './users/dto/create-user.dto';
import { AbilitiesFactory } from './casl/abilities.factory';
import { AuthenticationToken } from './auth/auth.decorator';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private abFactPrisma: AbilitiesFactory,
    private userService: UsersService

  ) { }



  @Get()

  getHello(): string {
    return this.appService.getHello();
  }


  @Get('create-user')
  async createUserCASL(
    @Res() response: Response,
    @Body() createUserDto: CreateUserDto,
    @AuthenticationToken(UserFromTokenPipe) user: UserEntity
  ): Promise<any> {
    //v1
    /* const ability = this.abilitiesFactory.defineAbility(user)
     let userEntity = new UserEntity()
     userEntity = { ...createUserDto }
 
     console.log(ability.rules)
     try {
       ForbiddenError.from(ability).throwUnlessCan(Action.Create, userEntity as UserEntity)
       //aksi update user
     } catch (error) {
       if (error instanceof ForbiddenError)
         throw new ForbiddenException(error.message)
     }
 */

    let checkInput = { ...createUserDto, ...{ id: null } }
    const ability = this.abFactPrisma.defineAbility(user)
    try {
      ForbiddenError.from(ability).throwUnlessCan('create', subject(
        'User', checkInput
      ));
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message)
    }
    return response.status(HttpStatus.OK).json({ "d": "success" })
  }


}
