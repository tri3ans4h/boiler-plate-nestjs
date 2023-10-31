import { Injectable, NotFoundException } from '@nestjs/common';
import { Story } from '@prisma/client';
import { StoryRepository } from '../story.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { IStoryProps } from 'src/story/interfaces/story-props.interface';
import { PaginatedOutputDto } from 'src/common/paginated-output.dto';
import { IFindStoryFilters } from 'src/story/interfaces/find-story-filters.interface';
import { StoryOutputDto } from 'src/story/dto/story-output.dto';
import { QueryResponse } from 'nestjs-prisma-querybuilder';
import { PaginateFunction, paginator } from 'src/prisma/paginator';
import { AbilitiesFactory } from 'src/casl/abilities.factory';
import { accessibleBy } from '@casl/prisma';


import { map, size } from 'lodash';
import * as Mustache from 'mustache';
import { ForbiddenError, subject } from '@casl/ability';


@Injectable()
export class PrismaStoryRepository implements StoryRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private abilitiesFactory: AbilitiesFactory,
  ) { }

  private readonly prismaStory = this.prismaService.story;

  async create(story: IStoryProps): Promise<void> {
    await this.prismaStory.create({
      data: {
        title: story.title,
        content: story.content,
        user_id: story.user_id,
        org_id: story.org_id,
      },
    });
  }


  parseCondition(permissions: any, currentUser: any) {
    const data = map(permissions, (permission) => {
      if (size(permission.conditions)) {
        const parsedVal = Mustache.render(
          permission.conditions['created_by'],
          currentUser
        );
        return {
          ...permission,
          conditions: { created_by: +parsedVal }
        };
      }
      return permission;
    });
    return data;
  }



  /*ForbiddenError.from(ability).throwUnlessCan('read', subject(
    'Story', { id: 1, title: "", content: "", user_id: 1, org_id: 3 } //as unknown as StoryOutputDto
  ));*/
  // console.log(ability)

  /*SAMPLE PARSE BY DB*/
  /*
      const userPermissions = await this.prismaService.permission.findMany({
        where: {
          role_id: currentUser.role_id
        }
      });*/




  async createEx(
    story: IStoryProps,
    currentUser: any
  ): Promise<IStoryProps> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    let checkInput = { ...story, ...{ id: null } }
    ForbiddenError.from(ability)
      .throwUnlessCan('create', subject(
        'Story', checkInput
      ));
    // let createdStory: any
    //await this.prismaService.$queryRaw`ALTER SEQUENCE stories_id_seq RESTART WITH 1;`;
    //let r = await this.prismaService.$queryRaw`SELECT * FROM stories_id_seq;`;
    //console.log(r)
    const createdStory = await this.prismaStory.create({
      data: {
        title: story.title,
        content: story.content,
        user_id: story.user_id,
        org_id: story.org_id,
      },
    })

    return createdStory
    // return { data: [createdStory] }
  }


  async findEx(
    filters: IFindStoryFilters,
    queryBuiderResponse: Partial<QueryResponse>,
    currentUser: any
  ): Promise<PaginatedOutputDto<StoryOutputDto>> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    const whereByUser = accessibleBy(ability).Story
    //const paginatePrisma: PaginateFunction = paginator({ perPage: filters.perPage });
    const paginatePrisma: PaginateFunction = paginator({ perPage: queryBuiderResponse.take });
    //console.log(queryBuiderResponse)
    return paginatePrisma(
      this.prismaService.story,
      {
        where: { AND: [whereByUser, queryBuiderResponse.where] },
        orderBy: queryBuiderResponse.orderBy,
        select: queryBuiderResponse.select,
        include: queryBuiderResponse.include,
      },
      {
        perPage: queryBuiderResponse.take,
        page: filters.page ?? 1,
        skip: queryBuiderResponse.skip,
        take: queryBuiderResponse.take,
      },
    );
  }

  async findOne(
    id: number,
    queryBuiderResponse: Partial<QueryResponse>,
    currentUser: any
  )// : Promise<CustomOutputDto<StoryOutputDto>> 
  : Promise<IStoryProps> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    const whereByUser = accessibleBy(ability).Story
    const checkStory = await this.prismaStory.findUnique({ where: { id } })
    if (checkStory == null) { throw new NotFoundException() }
    ForbiddenError.from(ability).throwUnlessCan('read', subject(
      'Story', checkStory as unknown as Story
    ));
    const findOneResponse = await this.prismaStory.findFirst({
      select: queryBuiderResponse.select,
      where: { AND: [{ id }, whereByUser, queryBuiderResponse.where] },
    })
    return findOneResponse as unknown as IStoryProps
    //return { data: [findOneResponse as unknown as Story] }
  }


  async update(id: number, data: IStoryProps, currentUser: any)
    // : Promise<CustomOutputDto<StoryOutputDto>> 
    : Promise<IStoryProps> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    data.id = id
    const whereByUser = accessibleBy(ability).Story
    /*CHECK INPUT DATA*/
    ForbiddenError.from(ability).throwUnlessCan('update', subject(
      'Story', data as unknown as Story
    ));
    const checkStory = await this.prismaStory.findUnique({
      where: {
        id
      }
    })
    if (checkStory == null) { throw new NotFoundException() }
    /*CHECK EXISTING DATA IN DB*/
    ForbiddenError.from(ability).throwUnlessCan('update', subject(
      'Story', checkStory as unknown as Story
    ));
    const updateResponse = await this.prismaStory.update({
      where: {
        id
      },
      data: data,
    })
    return updateResponse
    //return { data: [updateResponse as StoryOutputDto] }
  }

  async remove(id: number, currentUser: any)
    //: Promise<CustomOutputDto<StoryOutputDto>> 
    : Promise<IStoryProps> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    const whereByUser = accessibleBy(ability).Story
    const checkStory = await this.prismaStory.findUnique({
      where: {
        id
      }
    })
    if (checkStory == null) { throw new NotFoundException() }
    /*CHECK EXISTING DATA IN DB*/
    ForbiddenError.from(ability).throwUnlessCan('delete', subject(
      'Story', checkStory as unknown as Story
    ));

    const removeResponse = await this.prismaStory.delete({ where: { id } })
    return removeResponse
    // return { data: [removeResponse] }
  }

}
