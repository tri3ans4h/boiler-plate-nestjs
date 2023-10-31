import { Module } from '@nestjs/common';
import { StoryRepository } from './repositories/story.repository';
import { PrismaStoryRepository } from './repositories/prisma/prisma-story.repository';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoryUseCase } from './use-cases/create-story.usecase';
import { RemoveStoryUseCase } from './use-cases/remove-story.usecase';
import { StoryController } from './story.controller';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { Querybuilder } from 'nestjs-prisma-querybuilder';
import { ListStoryExpUseCase } from './use-cases/list-story-exp.usecase';
import { AbilitiesFactory } from 'src/casl/abilities.factory';
import { JwtService } from '@nestjs/jwt';
import { FindOneStoryUseCase } from './use-cases/find-one-story.usecase';
import { UpdateStoryUseCase } from './use-cases/update-story.usecase';

@Module({
  providers: [
    {
      provide: StoryRepository,
      useClass: PrismaStoryRepository,
    },
    CreateStoryUseCase,
    ListStoryExpUseCase,
    FindOneStoryUseCase,
    UpdateStoryUseCase,
    RemoveStoryUseCase,
    PrismaService,
    QueryBuilderService, 
    Querybuilder,
    AbilitiesFactory,
    JwtService
  ],
  controllers: [StoryController],
  
})
export class StoryModule {}
