import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateUsersProfileInputDto {
  @ApiProperty()
  @IsString({ message: 'user_id is number' })
  user_id: number;

  @ApiProperty()
  @IsString({ message: 'o campo nome deve ser uma string' })
  email: string;

  @ApiProperty({ required: false })
  @IsString({ message: 'o campo nome deve ser uma string' })
  firstName: string;


  @ApiProperty({ required: false })
  @IsString({ message: 'o campo nome deve ser uma string' })
  lastName: string;


  @ApiProperty({ required: false })
  @IsString({ message: 'o campo nome deve ser uma string' })
  photo: string;


  @ApiProperty({ required: false })
  @IsString({ message: 'o campo nome deve ser uma string' })
  birthDate: Date;

  @ApiProperty({ required: false })
  @IsString({ message: 'o campo tipo deve ser uma string' })
  address: string;


  @ApiProperty({ required: false })
  @IsString({ message: 'o campo tipo deve ser uma string' })
  phone: string;

  @ApiProperty({ required: false })
  @IsString({ message: 'o campo nome deve ser uma string' })
  created_at: Date;


  @ApiProperty({ required: false })
  @IsString({ message: 'o campo nome deve ser uma string' })
  updated_at: Date;


}
