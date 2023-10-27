import { IsNotEmpty, IsNumber, IsString } from "class-validator"

export class UserUpdatePutDtoInput {
    @IsNumber()
    @IsNotEmpty()
    id: number
    @IsString()
    @IsNotEmpty()
    email: string
    @IsString()
    @IsNotEmpty()
    first_name: string
    @IsString()
    @IsNotEmpty()
    last_name: string
    @IsNumber()
    @IsNotEmpty()
    org_id: number
    @IsNumber()
    @IsNotEmpty()
    role_id: number
}