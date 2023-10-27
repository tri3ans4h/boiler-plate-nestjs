import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import { BufferedFile } from './file.model';
import * as crypto from 'crypto';
import { ItemBucketMetadata } from 'minio';

@Injectable()
export class MinioClientService {
    constructor(private readonly minio: MinioService) {
        this.logger = new Logger('MinioService');
    }

    private readonly logger: Logger;
    private readonly bucketName = process.env.MINIO_BUCKET_NAME;

    public get client() {
        return this.minio.client;
    }

    public async upload(
        file: BufferedFile,
        bucketName: string = this.bucketName,
    ) {
        if (!(file.mimetype.includes('jpeg') || file.mimetype.includes('png'))) {
            throw new HttpException(
                'File type not supported',
                HttpStatus.BAD_REQUEST,
            );
        }
        const timestamp = Date.now().toString();
        const hashedFileName = crypto
            .createHash('md5')
            .update(timestamp)
            .digest('hex');
        const extension = file.originalname.substring(
            file.originalname.lastIndexOf('.'),
            file.originalname.length,
        );
        const metaData: any = {
            'Content-Type': file.mimetype,

        }
        // We need to append the extension at the end otherwise Minio will save it as a generic file
        const fileName = hashedFileName + extension;
        //this.client.presignedUrl
        this.client.putObject(
            bucketName,
            fileName,
            file.buffer,
            metaData,
            function (err, res) {
                if (err) {
                    throw new HttpException(
                        'Error uploading file',
                        HttpStatus.BAD_REQUEST,
                    );
                }
            },
        );

        return {
            url: `${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${process.env.MINIO_BUCKET_NAME}/${fileName}`,
        };
    }

    async delete(objetName: string, bucketName: string = this.bucketName) {
        const resp = await this.client.removeObject(bucketName, objetName);
    }

    async presignedUrl(name: string) {
        return {
            "key": "1234",
            "presigned_upload_url": await this.client.presignedUrl('PUT', this.bucketName, name)
        };
    }

    hdlCallback(err: Error | null, presignedUrl: string) {
        /*
        function (err, _presignedUrl) {
                    console.log(_presignedUrl)
                    if (err) return
                    presignedUrl = _presignedUrl
                }
        */
    }
    async presignedGetObject(name: string) {
        /* await this.client.presignedGetObject(this.bucketName, name, 0.25 * 60 * 60, (err, presignedUrl) => {
             if(err) throw Error()
             return presignedUrl
         })*/
        return { "url": await this.client.presignedGetObject(this.bucketName, name, 0.25 * 60 * 60) }

    }


}