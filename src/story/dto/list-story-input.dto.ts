import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ListStoryInputDto {
  @ApiProperty({ required:false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  })
  page?: number;

  @ApiProperty({ required:false })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return parseInt(value, 10);
    }
    return value;
  })

  @ApiProperty({ required:false })
  perPage?: number;

  @ApiProperty({ required:false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required:false })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiProperty({ required:false })
  @IsString()
  @IsOptional()
  userId?: string;
}
