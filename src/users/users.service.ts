import { BadRequestException, ConflictException, ForbiddenException, HttpException, HttpStatus, Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserEntity } from './entities/user.entity';
import { AbilitiesFactory } from 'src/casl/abilities.factory';
import { ForbiddenError, subject } from '@casl/ability';
import { Prisma, User, UserProfile } from '@prisma/client';
import { accessibleBy } from '@casl/prisma';
import { PaginatedOutputDto } from 'src/common/paginated-output.dto';


import { PaginateFunction, PaginatedResult, paginator } from 'src/prisma/paginator';
import { UserDtoOutput } from 'src/common/dto/user.dto.output';
import { UserProfileDtoOutput } from 'src/common/dto/userprofile.dto.output';
import { UserUpdateDtoOutput } from 'src/common/dto/user-update.dto.output';
import { UserUpdateDtoInput } from 'src/common/dto/user-update.dto.input';
import { UserUpdatePutDtoInput } from 'src/common/dto/user-update-put.dto.input';
import { TUserProfileDtoOutput } from 'src/common/interface/userprofile.dto.output';

import { Request, Response } from 'express'
import { JwtService } from '@nestjs/jwt';
import { deepmerge } from 'deepmerge-ts';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { UpdateUsersProfileUseCase } from 'src/users-profile/use-cases/update-story.usecase';
import { ChangePasswordDtoInput, UserProfileDtoInput } from './users.controller';
import { compare } from 'bcrypt';

import * as bcrypt from 'bcrypt';
const paginate: PaginateFunction = paginator({ perPage: 10 });

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private abilitiesFactory: AbilitiesFactory,
    private jwtService: JwtService,
    private minioClientService: MinioClientService,
    private updateUsersProfileUseCase: UpdateUsersProfileUseCase
  ) {

  }
  async create(dto: CreateUserDto, currentUser?: UserEntity) {
    //ABILITY CHECKER
    let checkInput = { ...dto, ...{ id: null } }
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    try {
      ForbiddenError.from(ability)
        .throwUnlessCan('create', subject(
          'User', checkInput
        ));

    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message)
    }

    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (user) throw new ConflictException('email duplicated');
    return this.prisma.user.create({
      data: dto
    })
  }

  async findAll(currentUser?: UserEntity): Promise<UserDtoOutput> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    try {
      const result = await this.prisma.user.findMany({
        where: accessibleBy(ability).User,
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          photo: true,
          address: true,
          birthDate: true,
          phone: true,
          org: {
            select: {
              id: true,
              name: true
            }
          },
          role: {
            select: {
              id: true,
              name: true
            }
          },
          UserTokens: {
            select: {
              id: true,
              userAgent: true
            }
          },
        }
      })
      return result as unknown as UserDtoOutput
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message)
    }
  }

  async findFirst(id: number, currentUser?: UserEntity): Promise<UserDtoOutput> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    try {
      const result = await this.prisma.user.findFirst({
        where: {
          AND: [,
            { id: currentUser.id },
            accessibleBy(ability).User
          ]
        },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          org_id: true,
          role_id: true,
          org: {
            select: {
              id: true,
              name: true
            }
          },
          role: {
            select: {
              id: true,
              name: true
            }
          },
        }
      })
      ForbiddenError.from(ability).throwUnlessCan('read', subject(
        'User', result as unknown as User
      ));
      if (!result)
        throw new NotFoundException();
      return result as unknown as UserDtoOutput
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message)
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message)
    }
  }

  async findOne(id: number, currentUser?: UserEntity): Promise<UserDtoOutput> {

    const ability = this.abilitiesFactory.defineAbility(currentUser)
    try {
      const result = await this.prisma.user.findUnique({
        where: { id: id },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          org_id: true,
          role_id: true,
          org: {
            select: {
              id: true,
              name: true
            }
          },
          role: {
            select: {
              id: true,
              name: true
            }
          },
        }
      })
      ForbiddenError.from(ability).throwUnlessCan('read', subject(
        'User', result as unknown as User
      ));
      if (!result)
        throw new NotFoundException();
      return result as unknown as UserDtoOutput
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message)
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message)
      throw new HttpException('Ada kesalahan', HttpStatus.BAD_REQUEST)
    }
  }

  async updatePatch(id: number, data: UserUpdateDtoInput, currentUser?: UserEntity): Promise<UserUpdateDtoOutput> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    try {
      data.id = id
      delete data.email
      const checkUser = await this.prisma.user.findUnique({
        where: {
          id
        }
      })
      //Double check
      //1. Check db data
      ForbiddenError.from(ability).throwUnlessCan('update', subject(
        'User', checkUser as unknown as User
      ));
      //2. Check data inputed if org_id exist
      if (data.org_id)
        ForbiddenError.from(ability).throwUnlessCan('update', subject(
          'User', data as unknown as User
        ));
      const updateUser = await this.prisma.user.update({
        where: {
          id
        },
        data: data,
      })

      return updateUser as UserUpdateDtoOutput
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message)
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotAcceptableException(error.message)
      }
      throw new Error("There some error")
    }

  }

  async updatePut(id: number, data: UserUpdatePutDtoInput, currentUser?: UserEntity): Promise<UserUpdateDtoOutput> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    try {
      data.id = id
      delete data.email
      const checkUser = await this.prisma.user.findUnique({
        where: {
          id
        }
      })
      ForbiddenError.from(ability).throwUnlessCan('update', subject(
        'User', checkUser as unknown as User
      ));
      if (data.org_id)
        ForbiddenError.from(ability).throwUnlessCan('update', subject(
          'User', data as unknown as User
        ));
      const updateUser = await this.prisma.user.update({
        where: {
          id
        },
        data: data
      })

      return updateUser as UserUpdateDtoOutput
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message)
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotAcceptableException(error.message)
      }
      throw new Error("There some error")
    }

  }



  async updatex(id: number, updateUserDto: UpdateUserDto, currentUser?: UserEntity): Promise<UserUpdateDtoOutput[]> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    const updateUser = await this.prisma.user.updateMany({
      where: {
        AND: [
          { id },
          accessibleBy(ability).User
        ]
      },
      data: updateUserDto,
    })

    if (updateUser.count > 0) {
      const updatedUser = await this.prisma.user.findMany({
        where: {
          AND: [
            { id },
            accessibleBy(ability).User
          ]
        },
        select: {
          id: true, email: true, first_name: true
        }
      })
      return updatedUser as UserUpdateDtoOutput[]
    }
    throw new NotFoundException()
  }

  async remove(id: number, currentUser?: UserEntity): Promise<any> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    const checkUser = await this.prisma.user.findUnique({
      where: {
        id
      }
    })
    if (!checkUser) throw new NotFoundException()
    try {
      ForbiddenError.from(ability).throwUnlessCan('delete', subject(
        'User', checkUser as unknown as User
      ));
      const result = await this.prisma.user.delete({ where: { id: id } });
      return result;
    } catch (error) {
      if (error instanceof ForbiddenError) throw new ForbiddenException(error.message)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotAcceptableException(error.message)
      }
    }
  }

  findCustom(id: number) {
    const user = new UserEntity()
    user.org_id = 2
    return user
  }

  async readWithPagination(currentUser: UserEntity): Promise<PaginatedOutputDto<CreateUserDto>> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)

    try {
      const result = await this.prisma.user.findMany({
        where: accessibleBy(ability).User
      })
      return
      //let rs = new PaginatedOutputDto<CreateUserDto>
      //return rs;

      /*return paginate(
        this.prisma.user,
        {
          where: {},
          orderBy: {
            id: 'desc',
          },
        },
        {
          page: 1,
        },
      );*/
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message)
    }

  }

  async findMany({ where, orderBy, page }: {
    where?: Prisma.UserWhereInput,
    orderBy?: Prisma.UserOrderByWithRelationInput,
    page?: number,
  }, currentUser?: UserEntity): Promise<PaginatedResult<User>> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    return paginate(
      this.prisma.user,
      {
        where: accessibleBy(ability).User,
        orderBy,
      },
      {
        page,
      },
    );
  }


  async findManyWithPage({ orderBy, page }: {
    orderBy?: Prisma.UserOrderByWithRelationInput,
    page?: number,
  }, currentUser?: UserEntity): Promise<PaginatedResult<User>> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    return paginate(
      this.prisma.user,
      {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          photo: true,
          address: true,
          birthDate: true,
          phone: true,
          org: {
            select: {
              id: true,
              name: true
            }
          },
          role: {
            select: {
              id: true,
              name: true
            }
          },
          UserTokens: {
            select: {
              id: true,
              userAgent: true
            }
          }
        },
        where: accessibleBy(ability).User,
        orderBy,
      },
      {
        page,
      },
    );
  }


  async findManyWithFilteringAndPage({ where, orderBy, perPage, page, skip, take, select }: {
    where?: Prisma.UserWhereUniqueInput,
    orderBy?: Prisma.UserOrderByWithRelationInput,
    perPage?: number,
    page?: number,
    skip?: number,
    take?: number,
    select?: Prisma.UserSelect
  }, currentUser?: UserEntity): Promise<PaginatedResult<User>> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    // const newWhere = { ...where, ...accessibleBy(ability).User }
    //console.log(where)
    const newWhere = deepmerge(where, accessibleBy(ability).User)

    const whereByUser = accessibleBy(ability).User

    //console.log('where', where, 'newhere',JSON.stringify (newWhere))
    //console.log(await accessibleBy(ability).User)
    return paginate(
      this.prisma.user,
      {
        where: { AND: [whereByUser, where] },
        //where,
        orderBy,
        select
      },
      {
        perPage,
        page,
        skip,
        take
      },
    );
  }

  async profile(currentUser: UserEntity): Promise<any> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    try {
      let result = await this.prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          id: true, email: true, photo: true,
          UserTokens: {},
          UserProfile: {},
          org: {},
          UserActivity: {}
        }
      });
      if (result.UserProfile?.photo != null) {
        const photo_presigned_url = await this.minioClientService.presignedGetObject(result.UserProfile?.photo)
        result.photo = photo_presigned_url.url
        result.UserProfile.photo = photo_presigned_url.url
      }
      ForbiddenError.from(ability).throwUnlessCan('read', subject(
        'UserProfile', result as unknown as UserProfile
      ));

      let userActivity = await this.prisma.userActivity.findFirst({ where: { AND: [{ user_id: currentUser.id }, { activity: 'change password' }] }, orderBy: { created_at: 'desc' } })
      // result.securityUserActivity = userActivity
      let response = { ...result, ...{ securityUserActivity: {lastChangePassword:userActivity?.created_at} } }
     return response
    } catch (error) {
      console.log(error)
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message)
    }
  }

  async profileOLD(currentUser: UserEntity): Promise<TUserProfileDtoOutput> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    try {
      let result = await this.prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          photo: true,
          address: true,
          birthDate: true,
          phone: true,
          org: {
            select: {
              id: true,
              name: true
            }
          },
          role: {
            select: {
              id: true,
              name: true
            }
          },
          UserTokens: {
            select: {
              id: true,
              userAgent: true
            }
          }
        }
      });


      //console.log(result)
      if (result.photo != null) {
        const photo_presigned_url = await this.minioClientService.presignedGetObject(result.photo)
        result.photo = photo_presigned_url.url
      }
      ForbiddenError.from(ability).throwUnlessCan('read', subject(
        'UserProfileOld', result as UserProfileDtoOutput
      ));
      return result
    } catch (error) {

      //console.log(error)
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message)
    }
  }

  async profileById(id: number, currentUser: UserEntity): Promise<TUserProfileDtoOutput> {
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    try {
      const result = await this.prisma.user.findUnique({
        where: { id: id },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          org: {
            select: {
              id: true,
              name: true
            }
          },
          role: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      ForbiddenError.from(ability).throwUnlessCan('read', subject(
        'UserProfileOld', result
      ));
      return result
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message)
    }
  }

  async me(request: Request, currentUser) {
    //check refresh token
    if (request.cookies.refresh == undefined || request.cookies.refresh == '') {
      throw new UnauthorizedException('cookie refresh not exist')
    }
    if (request.cookies.__device_unique_id == undefined || request.cookies.__device_unique_id == '') {
      throw new UnauthorizedException('cookie __device_unique_id not exist')
    }
    const deviceUniqueID = request.cookies.__device_unique_id
    let userToken = await this.prisma.userTokens.findFirst({ where: { deviceUniqueID: deviceUniqueID } })
    //console.log(userToken)
    if (!userToken) { //tidak ada device id di sistem
      throw new UnauthorizedException('__device_unique_id not exist')
    }
    const { id, role_id, org_id } = await this.jwtService.verifyAsync(request.cookies.refresh, {
      secret: process.env.JWT_REFRESH_SECRET
    })
    const payload = {
      id,
      role_id,
      org_id
    };
    return await this.profile(currentUser);
  }


  async changePhotoOLD(request: Request, data: UpdateUserDto, currentUser) {
    const result = await this.prisma.user.update({
      where: { id: currentUser.id },
      data
    })
    return result;
  }
  async changePhoto(request: Request, data: any, currentUser) {
    const checkUser = await this.prisma.user.findUnique({ where: { id: currentUser.id } })
    const checkProfile = await this.prisma.userProfile.findUnique({ where: { user_id: currentUser.id } })
    console.log(data, currentUser, checkProfile)
    const result = await await this.prisma.userProfile.upsert({
      where: {
        id: checkProfile?.id ? checkProfile.id : 0
      },
      create: {
        ...data,
        ...{ user_id: currentUser.id, email: checkUser.email, }
      },
      update: {
        ...data,
        ...{ user_id: currentUser.id, email: checkUser.email, }
      }
    });
    /*
        const result = await this.prisma.userProfile.upsert({
          where: { user_id: currentUser.id },
          data: { ...data, ...{ user_id: currentUser.id } }
        })*/
    return result;
  }


  async changeProfile(id: number, data: UserProfileDtoInput, currentUser?: UserEntity): Promise<UserUpdateDtoOutput> {
    const checkUser = await this.prisma.user.findUnique({ where: { id: currentUser.id } })
    const checkProfile = await this.prisma.userProfile.findUnique({ where: { user_id: currentUser.id } })
    const result = await await this.prisma.userProfile.upsert({
      where: {
        id: checkProfile?.id ? checkProfile.id : 0
      },
      create: {
        ...data,
        ...{ user_id: currentUser.id, email: checkUser.email, }
      },
      update: {
        ...data,
        ...{ user_id: currentUser.id, email: checkUser.email, }
      }
    });
    return result as UserUpdateDtoOutput
    /*const checkUser = await this.prisma.userProfile.findUnique({
      where: {
        user_id: id
      }
    })
    console.log(checkUser)*/
    //const { storyOutputDto } = await this.updateUsersProfileUseCase.execute(+id, data, currentUser);
    //console.log(storyOutputDto)
    /*
    return
    const ability = this.abilitiesFactory.defineAbility(currentUser)
    try {
      data.id = id
      const checkUser = await this.prisma.userProfile.findUnique({
        where: {
          user_id: id
        }
      })



      ForbiddenError.from(ability).throwUnlessCan('update', subject(
        'UserProfile', checkUser as unknown as UserProfile
      ));
      if (data.org_id)
        ForbiddenError.from(ability).throwUnlessCan('update', subject(
          'UserProfile', checkUser as unknown as UserProfile
        ));
      const updateUser = await this.prisma.user.update({
        where: {
          id
        },
        data: data,
      })

      return updateUser as UserUpdateDtoOutput
    } catch (error) {
      if (error instanceof ForbiddenError)
        throw new ForbiddenException(error.message)
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message)
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new NotAcceptableException(error.message)
      }
      throw new Error("There some error")
    }
*/
  }


  async validateUser(dto: any) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.username } });
    //console.log(user)
    if (user && (await compare(dto.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException();
  }

  async changePassword(request: Request, data: ChangePasswordDtoInput, currentUser?: UserEntity): Promise<any> {
    const userAgent = request.headers['user-agent'];
    const deviceUniqueID = request.cookies.__device_unique_id
    const user = await this.prisma.user.findUnique({ where: { id: currentUser.id } })
    if (!await compare(data.currentPassword, user.password)) {
      throw new BadRequestException("current password failed");
    }
    if (data.newPassword != data.verNewPassword) {
      throw new BadRequestException();
    }
    const result = await this.prisma.user.update({ where: { id: currentUser.id }, data: { password: await bcrypt.hash(data.newPassword as string, 10) } })
    await this.prisma.userActivity.create({ data: { user_id: currentUser.id, userAgent: userAgent, activity: "change password", deviceUniqueID: deviceUniqueID } })
    return { id: result.id, email: result.email }
    /*const checkUser = await this.prisma.user.findUnique({ where: { id: currentUser.id } })
    const checkProfile = await this.prisma.userProfile.findUnique({ where: { user_id: currentUser.id } })
    const result = await await this.prisma.userProfile.upsert({
      where: {
        id: checkProfile?.id ? checkProfile.id : 0
      },
      create: {
        ...data,
        ...{ user_id: currentUser.id, email: checkUser.email, }
      },
      update: {
        ...data,
        ...{ user_id: currentUser.id, email: checkUser.email, }
      }
    });
    return result as UserUpdateDtoOutput*/
  }

  async activeDevice(request: Request, currentUser) {
    if (request.cookies.__device_unique_id == undefined || request.cookies.__device_unique_id == '') {
      throw new UnauthorizedException()
    }
    const deviceUniqueID = request.cookies.__device_unique_id
    const result = await this.prisma.userTokens.findMany({ where: { user_id: currentUser.id } })
    return result;
  }

  async activeDeviceSummary(request: Request, currentUser) {
    if (request.cookies.__device_unique_id == undefined || request.cookies.__device_unique_id == '') {
      throw new UnauthorizedException()
    }
    const deviceUniqueID = request.cookies.__device_unique_id
    const result = await this.prisma.userTokens.groupBy({
      by: ['uaOSName'],
      _count: {
        uaOSName: true,
      },
      where: {
        user_id: currentUser.id
      }
    })
    return result;
  }

  async activeDeviceOSName(request: Request, data, currentUser) {
    if (request.cookies.__device_unique_id == undefined || request.cookies.__device_unique_id == '') {
      throw new UnauthorizedException()
    }
    const deviceUniqueID = request.cookies.__device_unique_id
    const result = await this.prisma.userTokens.findMany({ where: { uaOSName: data.ua_osname, user_id: currentUser.id } })
    const resultMyDevice = await this.prisma.userTokens.findFirst({ where: { deviceUniqueID: deviceUniqueID } })
    //console.log(result)
    return { "all_device": result, "my_device": resultMyDevice };
  }


  async activeDeviceInfo(request: Request, data, currentUser) {
    const result = await this.prisma.userTokens.findFirst({ where: { deviceUniqueID: data.device_unique_id } })
    return result;
  }

  async removeDevice(request: Request, data, currentUser) {
    /*if (request.cookies.__device_unique_id == undefined || request.cookies.__device_unique_id == '') {
      throw new UnauthorizedException()
    }
    const deviceUniqueID = request.cookies.__device_unique_id*/
    //console.log()
    const result = await this.prisma.userTokens.deleteMany({ where: { deviceUniqueID: data.device_unique_id, user_id: currentUser.id } })
    //console.log(result)
    return result;
  }

  async removeAllDevice(request: Request, data, currentUser) {
    if (request.cookies.__device_unique_id == undefined || request.cookies.__device_unique_id == '') {
      throw new UnauthorizedException()
    }
    const deviceUniqueID = request.cookies.__device_unique_id
    //console.log(currentUser)
    const result = await this.prisma.userTokens.deleteMany(
      {
        where: {
          AND:
            [
              {
                user_id: currentUser.id
              },
              {
                deviceUniqueID: {
                  not: deviceUniqueID
                }
              }
            ]

        }
      })
    //console.log(result)
    return result;
  }
}
