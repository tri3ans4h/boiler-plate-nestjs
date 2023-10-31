import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import { UsersService } from "src/users/users.service";
import { AbilitiesModule } from "src/casl/abilities.module";
import { MinioClientModule } from "src/minio-client/minio-client.module";
import { UsersProfileModule } from "src/users-profile/users-profile.module";

@Module({
    controllers: [AuthController],
    providers: [AuthService, UsersService, PrismaService, JwtService],
    imports: [AbilitiesModule, MinioClientModule,UsersProfileModule]
})
export class AuthModule { }
