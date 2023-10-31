import { BadRequestException, Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginatedOutputDto } from 'src/common/paginated-output.dto';
import { ApiPaginatedResponse } from 'src/common/paginated-response.decorator';
import { CreateUsersProfileInputDto } from './dto/create-users-profile-input.dto';
import { ListUsersProfileInputDto } from './dto/list-users-profile-input.dto';
import { UsersProfileOutputDto } from './dto/users-profile-output.dto';
import { CreateUsersProfileUseCase } from './use-cases/create-story.usecase';
import { RemoveUsersProfileUseCase } from './use-cases/remove-story.usecase';
import { ApiCustomOKResponse } from 'src/common/decorators/api-ok-response.decorator';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { ListUsersProfileExpUseCase } from './use-cases/list-story-exp.usecase';
import { CurrentUserInterceptor } from 'src/_core_experiment/current-user-interceptors';
import { CurrentUser } from 'src/_core_experiment/current-user-decorators';
import { ForcedSubject, MongoAbility, RawRuleOf, createMongoAbility } from '@casl/ability';
import { FindOneUsersProfileUseCase } from './use-cases/find-one-story.usecase';
import { UpdateUsersProfileUseCase } from './use-cases/update-story.usecase';
import { IUsersProfileProps } from './interfaces/users-profile-props.interface';

@ApiTags('UsersProfile')
@ApiBearerAuth()
@Controller('users-profile')
export class UsersProfileController {
  constructor(
    private readonly createUsersProfileUseCase: CreateUsersProfileUseCase,
    private readonly listUsersProfileExpUseCase: ListUsersProfileExpUseCase,
    private readonly findOneUsersProfileUseCase: FindOneUsersProfileUseCase,
    private readonly updateUsersProfileUseCase: UpdateUsersProfileUseCase,
    private readonly removeUsersProfileUseCase: RemoveUsersProfileUseCase,
    private readonly queryBuilder: QueryBuilderService
  ) { }

  @Post()

  @UseInterceptors(CurrentUserInterceptor)
  async create(
    @Body() createUsersProfileInputDto: CreateUsersProfileInputDto,
    @CurrentUser() currentUser: any,
  ): Promise<IUsersProfileProps> //Promise<CustomOutputDto<UsersProfileOutputDto>> 
  {

    const { storyOutputDto } = await this.createUsersProfileUseCase.execute({
      createUsersProfileInputDto, currentUser
    });

    return storyOutputDto;
  }

  @Get()
  @ApiPaginatedResponse(UsersProfileOutputDto)
  @UseInterceptors(CurrentUserInterceptor)
  @UseInterceptors(ClassSerializerInterceptor)
  async index(
    @Query() listUsersProfileInputDto: ListUsersProfileInputDto,
    @CurrentUser() currentUser: any,
  ): Promise<PaginatedOutputDto<UsersProfileOutputDto>> {
    const queryBuiderResponse = await this.queryBuilder.query('UserProfile')
    const { storyOutputDto } = await this.listUsersProfileExpUseCase.execute({
      listUsersProfileInputDto,
      queryBuiderResponse,
      currentUser
    }).catch(error => {
      throw new BadRequestException(error.message)
    });
    
    return storyOutputDto;
  }


  @Patch(':id')
  @ApiCustomOKResponse(UsersProfileOutputDto)
  @UseInterceptors(CurrentUserInterceptor)
  async update(
    @Param('id') id: number,
    @Body() data: Partial<IUsersProfileProps>,
    @CurrentUser() currentUser: any,
  ): Promise<IUsersProfileProps> //: Promise<CustomOutputDto<UsersProfileOutputDto>> 
  {
    const { storyOutputDto } = await this.updateUsersProfileUseCase.execute(+id, data, currentUser);
    return storyOutputDto;
  }


  @Get(':id')
  @ApiCustomOKResponse(UsersProfileOutputDto)
  @UseInterceptors(CurrentUserInterceptor)
  async findOne(
    @Param('id') id: number,
    @CurrentUser() currentUser: any,
  ): Promise<IUsersProfileProps> //: Promise<CustomOutputDto<UsersProfileOutputDto>> 
  {

    const queryBuiderResponse = await this.queryBuilder.query('UserProfile')
    const { storyOutputDto } = await this.findOneUsersProfileUseCase.execute(+id, queryBuiderResponse, currentUser);
    return storyOutputDto;
  }


  @Delete(':id')
  @ApiCustomOKResponse(UsersProfileOutputDto)
  @UseInterceptors(CurrentUserInterceptor)
  async remove(
    @Param('id') id: number,
    @CurrentUser() currentUser: any,
  ): Promise<IUsersProfileProps> //: Promise<CustomOutputDto<UsersProfileOutputDto>> 
  {
    const { storyOutputDto } = await this.removeUsersProfileUseCase.execute(+id, currentUser);
    return storyOutputDto;
  }
}


export const actions = ['manage', 'create', 'read', 'update', 'delete'] as const;
export const subjects = ['UsersProfile', 'all'] as const;

export type Abilities = [
  typeof actions[number],
  typeof subjects[number] | ForcedSubject<Exclude<typeof subjects[number], 'all'>>
];
export type AppAbility = MongoAbility<Abilities>;
export const createAbility = (rules: RawRuleOf<AppAbility>[]) => createMongoAbility<AppAbility>(rules);


/*EXPERIMENT
const raw_rule = JSON.stringify([
  { action: 'read', subject: 'UsersProfile' },
  { action: 'manage', subject: 'UsersProfile', conditions: { user_id: '${user.user_id}' } },
])

// const user = { user_id: 1 }
const permissions = interpolate(raw_rule, { user: { user_id: 1 } });

const ab = createAbility(Object(permissions))

try {
  ForbiddenError.from(ab).throwUnlessCan('create', subject('UsersProfile', { user_id: 1 }))
} catch (error) {
  if (error instanceof ForbiddenError) {
    throw new ForbiddenException(error.message)
  }
}*/