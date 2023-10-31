import {
    ArgumentsHost,
    Catch,
    HttpException,
    HttpServer,
    HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

export type ErrorCodesStatusMapping = {
    [key: string]: number;
};

/**
 * {@link PrismaClientExceptionFilter}
 * catches {@link Prisma.PrismaClientKnownRequestError}
 * and {@link Prisma.NotFoundError} exceptions.
 */
@Catch(Prisma?.PrismaClientKnownRequestError, Prisma?.PrismaClientValidationError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
    /**
     * default error codes mapping
     *
     * Error codes definition for Prisma Client (Query Engine)
     * @see https://www.prisma.io/docs/reference/api-reference/error-reference#prisma-client-query-engine
     */
    private errorCodesStatusMapping: ErrorCodesStatusMapping = {
        P2000: HttpStatus.BAD_REQUEST,
        P2002: HttpStatus.CONFLICT,
        P2003: HttpStatus.BAD_REQUEST,
        P2005: HttpStatus.BAD_REQUEST,
        P2006: HttpStatus.BAD_REQUEST,
        P2025: HttpStatus.NOT_FOUND,
    };

    /**
     * @param applicationRef
     * @param errorCodesStatusMapping
     */
    constructor(
        applicationRef?: HttpServer,
        errorCodesStatusMapping?: ErrorCodesStatusMapping,
    ) {
        super(applicationRef);

        if (errorCodesStatusMapping) {
            this.errorCodesStatusMapping = Object.assign(
                this.errorCodesStatusMapping,
                errorCodesStatusMapping,
            );
        }
    }

    /**
     * @param exception
     * @param host
     * @returns
     */
    catch(
        exception: Prisma.PrismaClientKnownRequestError | Prisma.PrismaClientValidationError | any, // | Prisma.PrismaClientValidationError 
        host: ArgumentsHost,
    ) {
        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            return this.catchClientKnownRequestError(exception, host);
        }
        if (exception instanceof Prisma.PrismaClientValidationError) {
            return this.catchClientValidationError(exception, host);
        }
    }

    private catchClientKnownRequestError(
        exception: Prisma.PrismaClientKnownRequestError,
        host: ArgumentsHost,
    ) {
        const statusCode = this.errorCodesStatusMapping[exception.code];
        const message = `[${exception.code}]: ${this.exceptionShortMessage(exception.message)}`;

        if (!Object.keys(this.errorCodesStatusMapping).includes(exception.code)) {
            return super.catch(exception, host);
        }

        super.catch(new HttpException({ statusCode, message }, statusCode), host);
    }


    private catchClientValidationError(
        exception: Prisma.PrismaClientValidationError,
        host: ArgumentsHost,
    ) {
        //const statusCode = this.errorCodesStatusMapping[exception.code];
        //const message = `[${exception.code}]: ${this.exceptionShortMessage(exception.message)}`;

        //if (!Object.keys(this.errorCodesStatusMapping).includes(exception.code)) {
        //  return super.catch(exception, host);
        // }
        const statusCode = 400
        const message = this.exceptionShortMessage(exception.message)

        const pos = message.indexOf('Argument') + ('Argument').length + 1;
        const shortMessage = message.substring(pos)
        super.catch(new HttpException({ statusCode, message:shortMessage }, HttpStatus.BAD_REQUEST), host);
    }


    private catchNotFoundError(
        { message }: Prisma.NotFoundError,
        host: ArgumentsHost,
    ) {
        const statusCode = HttpStatus.NOT_FOUND;

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


/*import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        console.error('EXVEPTION',exception.code);
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const message = exception.message.replace(/\n/g, '');
        switch (exception.code) {
            case 'P2002': {
                const status = HttpStatus.CONFLICT;
                response.status(status).json({
                    statusCode: status,
                    message: message,
                });
                break;
            }
            case 'P2005': {
                const status = HttpStatus.CONFLICT;
                response.status(status).json({
                    statusCode: status,
                    message: message,
                });
                break;
            }

            default:
                // default 500 error code
                super.catch(exception, host);
                break;

        }
    }
}*/


/*import { AbstractHttpAdapter } from '@nestjs/core';

import {
    Catch,
    HttpException,
    ArgumentsHost,
    ExceptionFilter,
} from '@nestjs/common';
import { PrismaClientRustPanicError, PrismaClientValidationError, PrismaClientKnownRequestError, PrismaClientUnknownRequestError, PrismaClientInitializationError } from '@prisma/client/runtime/library';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: AbstractHttpAdapter) { }
    catch(exception: HttpException, host: ArgumentsHost): void {
        let errorMessage: unknown;
        let httpStatus: number;
        const statusCode = exception.getStatus()
        const httpAdapter = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        if (exception instanceof PrismaClientRustPanicError) {
            httpStatus = 400;
            errorMessage = exception.message;
        } else if (exception instanceof PrismaClientValidationError) {
            httpStatus = 422;
            errorMessage = exception.message;
        } else if (exception instanceof PrismaClientKnownRequestError) {
            httpStatus = 400;
            errorMessage = exception.message;
        } else if (exception instanceof PrismaClientUnknownRequestError) {
            httpStatus = 400;
            errorMessage = exception.message;
        } else if (exception instanceof PrismaClientInitializationError) {
            httpStatus = 400;
            errorMessage = exception.message;
        } else if (
            statusCode &&
            statusCode >= 400 &&
            statusCode <= 499
        ) {
            httpStatus = statusCode;
            errorMessage = exception.message;
        } else {
            httpStatus = 500;
            errorMessage = [
                'Sorry! something went to wrong on our end, Please try again later',
            ];
        }
        const errorResponse = {
            errors: typeof errorMessage === 'string' ? [errorMessage] : errorMessage,
        };
        httpAdapter.reply(ctx.getResponse(), errorResponse, httpStatus);
    }
}*/