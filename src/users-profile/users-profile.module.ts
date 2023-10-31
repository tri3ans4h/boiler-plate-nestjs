import { Module } from '@nestjs/common';
import { UsersProfileRepository } from './repositories/users-profile.repository';
import { PrismaUsersProfileRepository } from './repositories/prisma/prisma-users-profile.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUsersProfileUseCase } from './use-cases/create-story.usecase';
import { RemoveUsersProfileUseCase } from './use-cases/remove-story.usecase';
import { UsersProfileController } from './users-profile.controller';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { Querybuilder } from 'nestjs-prisma-querybuilder';
import { ListUsersProfileExpUseCase } from './use-cases/list-story-exp.usecase';
import { AbilitiesFactory } from 'src/casl/abilities.factory';
import { JwtService } from '@nestjs/jwt';
import { FindOneUsersProfileUseCase } from './use-cases/find-one-story.usecase';
import { UpdateUsersProfileUseCase } from './use-cases/update-story.usecase';

@Module({
  providers: [
    {
      provide: UsersProfileRepository,
      useClass: PrismaUsersProfileRepository,
    },
    CreateUsersProfileUseCase,
    ListUsersProfileExpUseCase,
    FindOneUsersProfileUseCase,
    UpdateUsersProfileUseCase,
    RemoveUsersProfileUseCase,
    PrismaService,
    QueryBuilderService, 
    Querybuilder,
    AbilitiesFactory,
    JwtService
  ],
  controllers: [UsersProfileController],
  exports:[UpdateUsersProfileUseCase]
  
})
export class UsersProfileModule {}
