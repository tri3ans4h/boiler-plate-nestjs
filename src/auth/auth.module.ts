import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "src/users/users.service";
import { AbilitiesModule } from "src/casl/abilities.module";
import { MinioClientService } from "src/minio-client/minio-client.service";
import { MinioClientModule } from "src/minio-client/minio-client.module";

@Module({
    controllers: [AuthController],
    providers: [
        AuthService, UsersService, PrismaService, JwtService],
    imports: [AbilitiesModule,MinioClientModule]
})
export class AuthModule { }
