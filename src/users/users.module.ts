import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AbilitiesFactory } from 'src/casl/abilities.factory';
import { QueryBuilderService } from 'src/query-builder/query-builder.service';
import { Querybuilder } from 'nestjs-prisma-querybuilder';
import { MinioClientService } from 'src/minio-client/minio-client.service';
import { MinioClientModule } from 'src/minio-client/minio-client.module';

@Module({
  imports: [
    MinioClientModule
  ],
  controllers: [UsersController],
  providers: [UsersService, PrismaService, JwtService, AbilitiesFactory, QueryBuilderService, Querybuilder,

  ],
  exports: [UsersService]
})
export class UsersModule { }
