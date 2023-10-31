import { ClassSerializerInterceptor, Injectable, NotFoundException, UseInterceptors } from '@nestjs/common';
import { UserProfile } from '@prisma/client';
import { UsersProfileRepository } from '../users-profile.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginatedOutputDto } from 'src/common/paginated-output.dto';
import { QueryResponse } from 'nestjs-prisma-querybuilder';
import { PaginateFunction, paginator } from 'src/prisma/paginator';
import { AbilitiesFactory } from 'src/casl/abilities.factory';
import { accessibleBy } from '@casl/prisma';


import { map, size } from 'lodash';
import * as Mustache from 'mustache';
import { ForbiddenError, subject } from '@casl/ability';
import { IUsersProfileProps } from 'src/users-profile/interfaces/users-profile-props.interface';
import { UserOutputDTO, UsersProfileOutputDto } from 'src/users-profile/dto/users-profile-output.dto';
import { IFindUsersProfileFilters } from 'src/users-profile/interfaces/find-users-profile-filters.interface';


@Injectable()
export class PrismaUsersProfileRepository implements UsersProfileRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private abilitiesFactory: AbilitiesFactory,
  ) { }

  private readonly prismaUsersProfile = this.prismaService.userProfile;

  async create(usersProfile: IUsersProfileProps): Promise<void> {
    await this.prismaUsersProfile.create({
      data: usersProfile,
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


  async createEx(
    usersProfile: IUsersProfileProps,
    currentUser: any
  ): Promise<IUsersProfileProps> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    let checkInput = { ...usersProfile, ...{ id: null } }
    ForbiddenError.from(ability)
      .throwUnlessCan('create', subject(
        'UserProfile', checkInput
      ));
    // let createdUsersProfile: any
    //await this.prismaService.$queryRaw`ALTER SEQUENCE stories_id_seq RESTART WITH 1;`;
    //let r = await this.prismaService.$queryRaw`SELECT * FROM stories_id_seq;`;
    //console.log(r)
    const createdUsersProfile = await this.prismaUsersProfile.create({
      data: usersProfile,
    })

    return createdUsersProfile
    // return { data: [createdUsersProfile] }
  }
  /*
     exclude<T, Key extends keyof T>(
      user: T,
      keys: Key[]
    ): Omit<T, Key> {
      return Object.fromEntries(
        Object.entries(user).filter(([key]) => !keys.includes(key))
      )
    }*/

  async findEx(
    filters: IFindUsersProfileFilters,
    queryBuiderResponse: Partial<QueryResponse>,
    currentUser: any
  ): Promise<PaginatedOutputDto<UsersProfileOutputDto>> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    const whereByUser = accessibleBy(ability).UserProfile
    const paginatePrisma: PaginateFunction = paginator({ perPage: queryBuiderResponse.take });
    return await paginatePrisma(
      this.prismaService.userProfile,
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
      }
    );// PaginatedOutputDto<UsersProfileOutputDto>;

    //  return xx;
  }

  async findOne(
    id: number,
    queryBuiderResponse: Partial<QueryResponse>,
    currentUser: any
  )// : Promise<CustomOutputDto<UsersProfileOutputDto>> 
    : Promise<IUsersProfileProps> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    const whereByUser = accessibleBy(ability).UserProfile
    const checkUsersProfile = await this.prismaUsersProfile.findUnique({ where: { id } })
    if (checkUsersProfile == null) { throw new NotFoundException() }
    ForbiddenError.from(ability).throwUnlessCan('read', subject(
      'UserProfile', checkUsersProfile as unknown as UserProfile
    ));
    const findOneResponse = await this.prismaUsersProfile.findFirst({
      select: queryBuiderResponse.select,
      where: { AND: [{ id }, whereByUser, queryBuiderResponse.where] },
    })
    return findOneResponse as unknown as IUsersProfileProps
    //return { data: [findOneResponse as unknown as UsersProfile] }
  }


  async update(id: number, data: IUsersProfileProps, currentUser: any)
    // : Promise<CustomOutputDto<UsersProfileOutputDto>> 
    : Promise<IUsersProfileProps> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    data.id = id
    const whereByUser = accessibleBy(ability).UserProfile
    /*CHECK INPUT DATA*/
    ForbiddenError.from(ability).throwUnlessCan('update', subject(
      'UserProfile', data as unknown as UserProfile
    ));
    const checkUsersProfile = await this.prismaUsersProfile.findUnique({
      where: {
        id
      }
    })
    if (checkUsersProfile == null) { throw new NotFoundException() }
    /*CHECK EXISTING DATA IN DB*/
    ForbiddenError.from(ability).throwUnlessCan('update', subject(
      'UserProfile', checkUsersProfile as unknown as UserProfile
    ));
    const updateResponse = await this.prismaUsersProfile.update({
      where: {
        id
      },
      data: data,
    })
    return updateResponse
    //return { data: [updateResponse as UsersProfileOutputDto] }
  }

  async remove(id: number, currentUser: any)
    //: Promise<CustomOutputDto<UsersProfileOutputDto>> 
    : Promise<IUsersProfileProps> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    const whereByUser = accessibleBy(ability).UserProfile
    const checkUsersProfile = await this.prismaUsersProfile.findUnique({
      where: {
        id
      }
    })
    if (checkUsersProfile == null) { throw new NotFoundException() }
    /*CHECK EXISTING DATA IN DB*/
    ForbiddenError.from(ability).throwUnlessCan('delete', subject(
      'UserProfile', checkUsersProfile as unknown as UserProfile
    ));

    const removeResponse = await this.prismaUsersProfile.delete({ where: { id } })
    return removeResponse
    // return { data: [removeResponse] }
  }

}
