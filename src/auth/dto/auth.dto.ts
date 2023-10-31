import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({example:"admin01@mail.com"})
  @IsString()
  @IsEmail()
  username: string;

  @ApiProperty({example:"123456"})
  @IsString()
  password: string;
}