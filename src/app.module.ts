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
@Module({
  imports: [
    AuthModule,
    UsersModule,
    AbilitiesModule,
    MinioClientModule,
    ConfigModule.forRoot({ isGlobal: true }),
    ImageUploadModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService, UsersService, PrismaService, QueryBuilderService, Querybuilder],
})
export class AppModule { }
