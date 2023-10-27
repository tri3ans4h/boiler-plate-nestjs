import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({example:"admin@mail.com"})
  @IsString()
  @IsEmail()
  username: string;

  @ApiProperty({example:""})
  @IsString()
  password: string;
}