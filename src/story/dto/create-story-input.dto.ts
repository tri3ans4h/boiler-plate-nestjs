import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateStoryInputDto {
  @ApiProperty({ required:false })
  @IsString({ message: 'o campo nome deve ser uma string' })
  title: string;

  @ApiProperty({ required:false })
  @IsString({ message: 'o campo nome deve ser uma string' })
  content: string;
  
  @ApiProperty({ required:false })
  @IsString({ message: 'o campo tipo deve ser uma string' })
  user_id: number;

  @ApiProperty()
  @IsString({ message: 'o campo usuário id deve ser uma string' })
  @IsOptional()
  org_id: number;
}
