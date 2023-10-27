import { Controller, Post, Body, Get, Req, Res } from "@nestjs/common";
//import { CreateUserDto } from "src/users/dto/users.dto";
import { UsersService } from "src/users/users.service";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/auth.dto";
import { ApiTags } from "@nestjs/swagger";
import { Request, Response } from 'express'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) { }

  @Post('login')
  async login(@Req() request: Request, @Res() response: Response, @Body() dto: LoginDto) {
    let result = await this.authService.login(request, dto);
    response.cookie("refresh", result.backendTokens.refreshToken, {
      httpOnly: true,
      secure: false, // use true
      sameSite: 'lax',// use none
      maxAge: 24 * 60 * 60 * 1000
    });

    response.cookie("access", result.backendTokens.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    });

    response.cookie("__device_unique_id", result.device_unique_id, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 360 * 24 * 60 * 60 * 1000 //1 year
    });
    return response.status(200).json(result)
  }

  @Get('/refresh-token')
  async refreshToken(@Req() request, @Res() response: Response): Promise<any> {
    const result = await this.authService.refreshToken(request);
    response.cookie("refresh", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });
    response.cookie("access", result.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    return response.status(200).json({ accessToken: result.accessToken })
  }
  @Post('logout')
  async logout(
    @Req() request: Request,
    @Res() response: Response,
    @Body() dto: LoginDto) {
    //let result = await this.authService.login(dto);
    const result = await this.authService.logout(request);
    response.clearCookie("refresh")
    response.clearCookie("__device_unique_id")
    /*
    , {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    }
    */
    return response.status(200).json({ "status": "success" })
  }
}