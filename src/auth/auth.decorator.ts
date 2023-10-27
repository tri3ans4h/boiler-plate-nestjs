import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

export const AuthenticationToken = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<Request>();

  const authorizationToken = request.headers.authorization;

  if (!authorizationToken) {
    throw new UnauthorizedException("Missing authorization token");
  }

  const [bearer, token] = authorizationToken.split(' ');

  if (bearer !== 'Bearer') {
    throw new UnauthorizedException("Invalid authorization token type");
  }

  return token;
});