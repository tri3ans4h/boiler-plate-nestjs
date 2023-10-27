import {
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BufferedFile } from 'src/minio-client/file.model';
import { MinioClientService } from './minio-client.service';

@Controller('minio')
export class MinioClientController {
  constructor(private minioClientService: MinioClientService) { }

  @Get('presignedUrl')
  async presignedUrl(
    @Query('name') name: string
  ): Promise<any> {
    return await this.minioClientService.presignedUrl(name);
  }

  @Get('presignedGetObject')
  async presignedGetObject(
    @Query('name') name: string
  ): Promise<any> {
    return  this.minioClientService.presignedGetObject(name);
  }



}