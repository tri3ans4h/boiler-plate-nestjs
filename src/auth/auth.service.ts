import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginDto } from "./dto/auth.dto";
import { UsersService } from "src/users/users.service";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcrypt";
import { Request, Response } from 'express'
import { PrismaService } from "src/prisma/prisma.service";

import { UAParser } from 'ua-parser-js';
import { parse } from "path";
const EXPIRE_TIME = 20 * 1000;
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService
  ) { }

  async validateUser(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.username } });
    //console.log(user)
    if (user && (await compare(dto.password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    throw new UnauthorizedException();
  }

  async login(request: Request, dto: LoginDto) {
    const userAgent = request.headers['user-agent'];

    //const user = await this.prisma.user.findUnique({ where: { email: dto.username  } })
    const user = await this.validateUser(dto);
    /*const user = await this.prisma.user.findUnique({ where: { email: dto.username  } })
    if (!user) {
      throw new UnauthorizedException();
    }*/

    const parser = new UAParser(userAgent);
    const uaDevice = parser.getDevice();
    const uaOS = parser.getOS();
    const uaBrowser = parser.getBrowser();


    const payload = {
      id: user.id,
      role_id: user.role_id,
      org_id: user.org_id,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
      secret: process.env.JWT_ACCESS_SECRET,
    })

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
      secret: process.env.JWT_REFRESH_SECRET,
    })

    let deviceUniqueID = request.cookies.__device_unique_id
    if (deviceUniqueID == undefined || deviceUniqueID == null) {
      deviceUniqueID = uuidv4()
    }

    const userToken = await this.prisma.userTokens.findFirst({ where: { deviceUniqueID: deviceUniqueID } })
    if (userToken) {
      //delete many
      await this.prisma.userTokens.deleteMany({ where: { deviceUniqueID: deviceUniqueID } })
    }
    //lalu create baru

    const userTokenCreate = await this.prisma.userTokens.create({
      data: {
        deviceUniqueID: deviceUniqueID,
        access: "",
        refresh: "",
        userAgent: userAgent,
        user_id: user.id,
        uaDeviceModel: uaDevice.model ? uaDevice.model : '',
        uaDeviceType: uaDevice.type ? uaDevice.type : '',
        uaDeviceVendor: uaDevice.vendor ? uaDevice.vendor : '',
        uaBrowserName: uaBrowser.name ? uaBrowser.name : '',
        uaBrowserVersion: uaBrowser.version ? uaBrowser.version : '',
        uaOSName: uaOS.name,
        uaOSVersion: uaOS.version

      }
    })

    await this.prisma.userActivity.create({ data: { user_id: user.id, userAgent: userAgent, activity: "login", deviceUniqueID: deviceUniqueID } })


    return {
      user,
      device_unique_id: deviceUniqueID,
      backendTokens: {
        accessToken: accessToken,
        refreshToken: refreshToken,
        expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
      },
    };
  }

  async refreshToken(request: Request) {
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

    try {
      const { id, role_id, org_id } = await this.jwtService.verifyAsync(request.cookies.refresh, {
        secret: process.env.JWT_REFRESH_SECRET
      })
      const payload = {
        id,
        role_id,
        org_id
      };

      return {
        accessToken: await this.jwtService.signAsync(payload, {
          expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
          secret: process.env.JWT_ACCESS_SECRET,
        }),
        refreshToken: await this.jwtService.signAsync(payload, {
          expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
          secret: process.env.JWT_REFRESH_SECRET,
        }),
        expiresIn: new Date().setTime(new Date().getTime() + EXPIRE_TIME),
      };
    } catch (error) {
      throw new BadRequestException("Token expired")
    }
  }

  async logout(request: Request) {
    if (request.cookies.__device_unique_id == undefined || request.cookies.__device_unique_id == '') {
      throw new UnauthorizedException()
    }
    const deviceUniqueID = request.cookies.__device_unique_id
    let userToken = await this.prisma.userTokens.deleteMany({ where: { deviceUniqueID: deviceUniqueID } })
    return {};
  }
}