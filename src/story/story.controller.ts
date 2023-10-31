import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PaginatedOutputDto } from 'src/common/paginated-output.dto';
import { ApiPaginatedResponse } from 'src/common/paginated-response.decorator';
import { CreateStoryInputDto } from './dto/create-story-input.dto';
import { ListStoryInputDto } from './dto/list-story-input.dto';
import { StoryOutputDto } from './dto/story-output.dto';
import { CreateStoryUseCase } from './use-cases/create-story.usecase';
import { RemoveStoryUseCase } from './use-cases/remove-story.usecase';
import { ApiCustomOKResponse } from 'src/common/decorators/api-ok-response.decorator';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { ListStoryExpUseCase } from './use-cases/list-story-exp.usecase';
import { CurrentUserInterceptor } from 'src/_core_experiment/current-user-interceptors';
import { CurrentUser } from 'src/_core_experiment/current-user-decorators';
import { ForcedSubject, MongoAbility, RawRuleOf, createMongoAbility } from '@casl/ability';
import { FindOneStoryUseCase } from './use-cases/find-one-story.usecase';
import { UpdateStoryUseCase } from './use-cases/update-story.usecase';
import { IStoryProps } from './interfaces/story-props.interface';

@ApiTags('Story')
@Controller('story')
export class StoryController {
  constructor(
    private readonly createStoryUseCase: CreateStoryUseCase,
    private readonly listStoryExpUseCase: ListStoryExpUseCase,
    private readonly findOneStoryUseCase: FindOneStoryUseCase,
    private readonly updateStoryUseCase: UpdateStoryUseCase,
    private readonly removeStoryUseCase: RemoveStoryUseCase,
    private readonly queryBuilder: QueryBuilderService
  ) { }

  @Post()

  @UseInterceptors(CurrentUserInterceptor)
  async create(
    @Body() createStoryInputDto: CreateStoryInputDto,
    @CurrentUser() currentUser: any,
  ): Promise<IStoryProps> //Promise<CustomOutputDto<StoryOutputDto>> 
  {

    const { storyOutputDto } = await this.createStoryUseCase.execute({
      createStoryInputDto, currentUser
    });

    return storyOutputDto;
  }

  @Get()
  @ApiPaginatedResponse(StoryOutputDto)
  @UseInterceptors(CurrentUserInterceptor)
  async index(
    @Query() listStoryInputDto: ListStoryInputDto,
    @CurrentUser() currentUser: any,
  ): Promise<PaginatedOutputDto<StoryOutputDto>> {

    const queryBuiderResponse = await this.queryBuilder.query('Story')
    const { storyOutputDto } = await this.listStoryExpUseCase.execute({
      listStoryInputDto,
      queryBuiderResponse,
      currentUser
    }).catch(error => {
      throw new BadRequestException(error.message)
    });
    return storyOutputDto;
  }


  @Patch(':id')
  @ApiCustomOKResponse(StoryOutputDto)
  @UseInterceptors(CurrentUserInterceptor)
  async update(
    @Param('id') id: number,
    @Body() data: Partial<IStoryProps>,
    @CurrentUser() currentUser: any,
  ): Promise<IStoryProps> //: Promise<CustomOutputDto<StoryOutputDto>> 
  {
    const { storyOutputDto } = await this.updateStoryUseCase.execute(+id, data, currentUser);
    return storyOutputDto;
  }


  @Get(':id')
  @ApiCustomOKResponse(StoryOutputDto)
  @UseInterceptors(CurrentUserInterceptor)
  async findOne(
    @Param('id') id: number,
    @CurrentUser() currentUser: any,
  ): Promise<IStoryProps> //: Promise<CustomOutputDto<StoryOutputDto>> 
  {

    const queryBuiderResponse = await this.queryBuilder.query('Story')
    const { storyOutputDto } = await this.findOneStoryUseCase.execute(+id, queryBuiderResponse, currentUser);
    return storyOutputDto;
  }


  @Delete(':id')
  @ApiCustomOKResponse(StoryOutputDto)
  @UseInterceptors(CurrentUserInterceptor)
  async remove(
    @Param('id') id: number,
    @CurrentUser() currentUser: any,
  ): Promise<IStoryProps> //: Promise<CustomOutputDto<StoryOutputDto>> 
  {
    const { storyOutputDto } = await this.removeStoryUseCase.execute(+id, currentUser);
    return storyOutputDto;
  }
}


export const actions = ['manage', 'create', 'read', 'update', 'delete'] as const;
export const subjects = ['Story', 'all'] as const;

export type Abilities = [
  typeof actions[number],
  typeof subjects[number] | ForcedSubject<Exclude<typeof subjects[number], 'all'>>
];
export type AppAbility = MongoAbility<Abilities>;
export const createAbility = (rules: RawRuleOf<AppAbility>[]) => createMongoAbility<AppAbility>(rules);


/*EXPERIMENT
const raw_rule = JSON.stringify([
  { action: 'read', subject: 'Story' },
  { action: 'manage', subject: 'Story', conditions: { user_id: '${user.user_id}' } },
])

// const user = { user_id: 1 }
const permissions = interpolate(raw_rule, { user: { user_id: 1 } });

const ab = createAbility(Object(permissions))

try {
  ForbiddenError.from(ab).throwUnlessCan('create', subject('Story', { user_id: 1 }))
} catch (error) {
  if (error instanceof ForbiddenError) {
    throw new ForbiddenException(error.message)
  }
}*/