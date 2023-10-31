import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AbilitiesModule } from './casl/abilities.module';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users/users.service';
import { PrismaService } from './prisma/prisma.service';
import { Querybuilder } from 'nestjs-prisma-querybuilder';
import { QueryBuilderService } from './query-builder/query-builder.service';
import { MinioClientModule } from './minio-client/minio-client.module';
import { ConfigModule } from '@nestjs/config';
import { ImageUploadModule } from './image-upload/image-upload.module';
import { StoryModule } from './story/story.module';
import { UsersProfileModule } from './users-profile/users-profile.module';
import { UpdateUsersProfileUseCase } from './users-profile/use-cases/update-story.usecase';
@Module({
  imports: [
    AuthModule,
    UsersModule,
    AbilitiesModule,
    MinioClientModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ImageUploadModule,
    StoryModule,
    UsersProfileModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtService, UsersService, PrismaService, QueryBuilderService, Querybuilder],
})
export class AppModule { }
