import { ApiProperty } from "@nestjs/swagger";

export class UserEntity {
    id?: number;
    first_name: string;
    last_name: string;
    email: string;
    role_id: number;
    org_id?:number
}
