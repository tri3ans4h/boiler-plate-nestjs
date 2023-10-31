import { ForbiddenError } from '@casl/ability';
import {
    ArgumentsHost,
    Catch,
    HttpCode,
    HttpException,
    HttpServer,
    HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';


@Catch(ForbiddenError)
export class CaslExceptionFilter extends BaseExceptionFilter {
    constructor(
        applicationRef?: HttpServer,
    ) {
        super(applicationRef);
    }

    catch(
        exception: any,
        host: ArgumentsHost,
    ) {
        if (exception instanceof ForbiddenError) {
            return this.catchForbiddenError(exception, host);
        }
        if (exception instanceof TypeError) {
           // super.catch(new HttpException({ statusCode: HttpStatus.BAD_REQUEST, message: exception.message }, HttpStatus.BAD_REQUEST), host);
        }
        //console.log(exception)
        //super.catch
        super.catch(new HttpException(exception.response, exception.status), host);
    }

    private catchForbiddenError(
        exception: any,
        host: ArgumentsHost,
    ) {
        const statusCode = HttpStatus.FORBIDDEN
        //const message = `${this.exceptionShortMessage(exception.message)}`;
        const message = `${exception.message}`;
        //console.log(exception)
        super.catch(new HttpException({ statusCode, message }, statusCode), host);
    }

    private exceptionShortMessage(message: string): string {
        const shortMessage = message.substring(message.indexOf('→'));
        return shortMessage
            .substring(shortMessage.indexOf('\n'))
            .replace(/\n/g, '')
            .trim();
    }
}

