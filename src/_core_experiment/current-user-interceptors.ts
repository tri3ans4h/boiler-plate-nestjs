import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from 'express';
import { PrismaService } from "src/prisma/prisma.service";

interface IPayload {
    id: number,
    role_id: number,
    org_id: number
};


@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
    constructor(
        private readonly jsonWebTokenService: JwtService,
        private readonly prismaService: PrismaService
    ) { }

    async intercept(context: ExecutionContext, handler: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request)
        let payload: IPayload;
        try {
            payload = this.jsonWebTokenService.verify(token, { secret: process.env.JWT_ACCESS_SECRET });
        } catch (error) {
            throw new UnauthorizedException();
        }
        try {
            const user = await this.prismaService.user.findUnique({ where: { id: payload.id } })
            request.currentUser = user;
        } catch (error) {
            throw new BadRequestException();
        }
        return handler.handle();
    }

    private extractTokenFromHeader(request: Request) {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}