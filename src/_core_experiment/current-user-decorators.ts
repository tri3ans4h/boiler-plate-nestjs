import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator((data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return data ? request.currentUser?.[data] : request.currentUser;
});
