import { ArgumentMetadata, Injectable, PipeTransform, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';

@Injectable()
export class UserFromTokenPipe implements PipeTransform {
  public constructor(
    private readonly jsonWebTokenService: JwtService,
    private readonly usersService: UsersService
  ) { }

  public async transform(token: string, _metadata: ArgumentMetadata) {
    try {
      const payload = this.jsonWebTokenService.verify(token, { secret: process.env.JWT_ACCESS_SECRET });
      return payload
      
     // dont access
      const user = await this.usersService.findOne(payload.id);
      // console.log(payload)
      if (!user) {
        throw new UnauthorizedException("Invalid user");
      }
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException("Token Not Valid");
    }
  }
}
