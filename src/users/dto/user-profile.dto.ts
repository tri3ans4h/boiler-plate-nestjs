import { ApiProperty } from "@nestjs/swagger";
import { RoleDTO } from "./role-dto";

export class UserProfileDTO {
    id: number
    email: string
    role: RoleDTO
}
