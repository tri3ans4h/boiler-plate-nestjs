import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Query, Put, Req, Sse } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserFromTokenPipe } from './users.pipe';
import { UserEntity } from './entities/user.entity';
import { AbilitiesFactory } from 'src/casl/abilities.factory';

import { Response, Request } from 'express';
import { UserUpdateDtoInput } from 'src/common/dto/user-update.dto.input';
import { UserUpdatePutDtoInput } from 'src/common/dto/user-update-put.dto.input';
import { AuthenticationToken } from 'src/auth/auth.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';


import { interval, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UpdateUserDto } from './dto/update-user.dto';


@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService,
    private abFactPrisma: AbilitiesFactory,
    private prisma: PrismaService,
    private queryBuilder: QueryBuilderService
  ) { }


  @Post()
  async create(
    @Res() response: Response,
    @Body() createUserDto: CreateUserDto,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    const result = await this.usersService.create(createUserDto, currentUser);

    return response.status(HttpStatus.OK).json(result)
  }

  @Get()
  async findManyWithPage(
    @Res() response: Response,
    @Query('page') page: number,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    //const result = await this.usersService.findMany({ where: {}, orderBy: { id: 'desc' }, page }, currentUser);
    //console.log("currentUser",currentUser)
    const result = await this.usersService.findManyWithPage({ orderBy: { id: 'desc' }, page }, currentUser);
    return response.status(HttpStatus.OK).json(result)
  }

  @Get('profile')
  async profile(
    @Res() response: Response,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    const result = await this.usersService.profile(currentUser);
    return response.status(HttpStatus.OK).json(result)
  }



  @Put('change-photo')
  async changePhoto(
    @Req() request: Request,
    @Res() response: Response,
    @Body() data: UpdateUserDto,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    const result = await this.usersService.changePhoto(request , data, currentUser);
    return response.status(HttpStatus.OK).json(result)
  }



  @Get('active-device')
  async activeDevice(
    @Req() request: Request,
    @Res() response: Response,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    const result = await this.usersService.activeDevice(request, currentUser);
    return response.status(HttpStatus.OK).json(result)
  }

  @Get('active-device-summary')
  async activeDeviceSummary(
    @Req() request: Request,
    @Res() response: Response,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    const result = await this.usersService.activeDeviceSummary(request, currentUser);
    return response.status(HttpStatus.OK).json(result)
  }

  @Post('active-device-osname')
  async activeDeviceOSName(
    @Req() request: Request,
    @Res() response: Response,
    @Body() data: any,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    const result = await this.usersService.activeDeviceOSName(request, data, currentUser);
    return response.status(HttpStatus.OK).json(result)
  }


  @Post('active-device-info')
  async activeDeviceInfo(
    @Req() request: Request,
    @Res() response: Response,
    @Body() data: any,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    const result = await this.usersService.activeDeviceInfo(request, data, currentUser);
    return response.status(HttpStatus.OK).json(result)
  }

  @Post('remove-device')
  async removeDevice(
    @Req() request: Request,
    @Res() response: Response,
    @Body() data: any,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    const result = await this.usersService.removeDevice(request, data, currentUser);
    return response.status(HttpStatus.OK).json(result)
  }


  @Post('remove-all-device')
  async removeAllDevice(
    @Req() request: Request,
    @Res() response: Response,
    @Body() data: any,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    const result = await this.usersService.removeAllDevice(request, data, currentUser);
    return response.status(HttpStatus.OK).json(result)
  }

  @Get('me')
  async me(
    @Req() request: Request,
    @Res() response: Response,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    const result = await this.usersService.me(request, currentUser);
    return response.status(HttpStatus.OK).json(result)
  }

  @Sse('sse')
  sse(): Observable<MessageEvent> {
    return interval(1000).pipe(
      map((_) => ({ data: { hello: 'world' } }) as MessageEvent),
    );
  }

  @Get('filter')
  async filter(
    @Res() response: Response,
    @Query() query: string,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    //http://localhost:3000/users/filter?q=or=(id.eq=1, id.eq=2)%26and=(id>1)
    // where 1=1 AND (id=1 OR id=2)
    let argm = query as unknown as any

    const args = await this.queryBuilder.query('User');
    //console.log(argm.take)
    const result = await this.usersService.findManyWithFilteringAndPage({
      where: args.where,
      skip: argm.skip,
      take: argm.take,
      page: argm.page,
      perPage: args.take,
      select: args.select,
      orderBy: args.orderBy
    }, currentUser)
    //  const args = processFindManyQuery(query);

    //console.log(args);
    /*const result = await this.prisma.user.findMany({
      where: args.where
    })*/
    /*
       /* const x = query as unknown as { where: { or: { first_name: string, last_name: string } } }
        console.log(x.where)
        const result = await this.prisma.user.findMany({
          select: {
            first_name: true,
            last_name: true
          },
          where: { OR: [{ first_name: 'aa' }, { last_name: 'bb' }] }
          // where: x.where 
        })*/

    //https://github.com/rgsk/prisma-query

    // https://github.com/HarielThums/nestjs-prisma-querybuilder
    /**
     * 
     * 
    
    Page and Limit
    
        By default the paginate always enable and if consumer don't send page and limit on query, will return page 1 and 10 items;
        on Response.headers will have the property count and page with total of items and page number;
        http://localhost:3000/posts?page=2&limit=10
    
    Sort
    
        To use sort needed two properties criteria and field;
        criteria is a enum with asc and desc;
        field is the field that sort will be applied;
        http://localhost:3000/posts?sort[criteria]=asc&sort[field]=title
    
    Select
    
        All the properties will be separeted by blank space;
    
        By default if you don't send any select the find just will return the id property;
    
        If it is necessary to take the whole object it is possible to use select=all;
    
        Exception: If you select a relationship field will be return all the object, to select a field in one relation you can use populate and to find just him id is possible to use authorId field;
    
        http://localhost:3000/posts?select=title published authorId
    
        To exclude fields from the return, you can use a dto on prisma response before return to the user;
            Exemple a user password or token informations;
    
    Populate
    
        Populate is an array and that allows you to select in the fields of relationships, him need two parameters path and select;
        path is the relationship reference (ex: author);
        select are the fields that will be returned;
        primaryKey is the reference to primary key of the relationship (optional) (default: 'id');
        The populate index is needed to link the properties path and select;
        http://localhost:3000/posts?populate[0][path]=author&populate[0][select]=name email
    
    Filter
    
        Can be used to filter the query with your requeriments
        path is a reference from the property that will applied the filter;
        value is the value that will be filtered;
        filterGroup can be used to make where with operators and, or and not or no operator (optional);
            accepted types: ['and', 'or, 'not’]
        operator can be used to personalize your filter (optional);
            accepted types: ['contains', 'endsWith', 'startsWith', 'equals', 'gt', 'gte', 'in', 'lt', 'lte', 'not', 'notIn', 'hasEvery', 'hasSome', 'has', 'isEmpty']
            hasEvery and hasSome are a unique string and values are separeted by ';'
                ?filter[0][path]=name&filter[0][operator]=hasSome&filter[0][value]=foo; bar; ula
        insensitive can be used to filter (optional);
            accepted types: ['true', 'false'] - default: 'false'
            (check prisma rules for more details - Prisma: Database collation and case sensitivity)
        type needs to be used if value don't is a string;
            accepted types: ['string', 'boolean', 'number', 'date'] - default: 'string'
        filter is an array and that allows you to append some filters to the same query;
        http://localhost:3000/posts?filter[0][path]=title&filter[0][value]=querybuilder&filter[1][path]=published&filter[1][value]=false
        http://localhost:3000/posts?filter[1][path]=published&filter[1][value]=false&filter[1][type]=boolean
        http://localhost:3000/posts?filter[0][path]=title&filter[0][value]=querybuilder&filter[0][filterGroup]=and&filter[1][path]=published&filter[1][value]=falsefilter[1][filterGroup]=and
    
    
     * 
     */
    return response.status(HttpStatus.OK).json(result)
  }

  /** 
   * @description 
   * for check security only
   */
  @Get('profile/:id')
  async profileById(
    @Param('id') id: string,
    @Res() response: Response,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    const result = await this.usersService.profileById(+id, currentUser);
    return response.status(HttpStatus.OK).json(result)
  }


  @Get('pagination')
  async findMany(
    @Res() response: Response,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity,
    @Query('page') page: number
  ): Promise<any> {
    const result = await this.usersService.findMany({ where: {}, orderBy: { id: 'desc' }, page }, currentUser);
    return response.status(HttpStatus.OK).json(result)
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Res() response: Response,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity
  ): Promise<any> {
    const result = await this.usersService.findOne(+id, currentUser);
    return response.status(HttpStatus.OK).json(result)
  }


  @Patch(':id')
  async updatePatch(
    @Param('id') id: string,
    @Body() data: UserUpdateDtoInput,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity) {
    return this.usersService.updatePatch(+id, data, currentUser);
  }


  @Put(':id')
  async updatePut(
    @Param('id') id: string,
    @Body() data: UserUpdatePutDtoInput,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity) {
    return this.usersService.updatePut(+id, data, currentUser);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @AuthenticationToken(UserFromTokenPipe) currentUser: UserEntity) {
    return this.usersService.remove(+id, currentUser);
  }

}
