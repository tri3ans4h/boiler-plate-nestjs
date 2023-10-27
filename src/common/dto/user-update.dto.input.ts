import {
    IsNotEmpty, IsNumber, IsString,
    IsOptional
} from "class-validator"

export class UserUpdateDtoInput {
    @IsNumber()
    id: number
    @IsString()
    @IsOptional()
    email?: string
    @IsString()
    @IsOptional()
    first_name?: string
    @IsString()
    @IsOptional()
    last_name?: string
    @IsNumber()
    @IsOptional()
    org_id?: number
    @IsNumber()
    @IsOptional()
    role_id?: number
}