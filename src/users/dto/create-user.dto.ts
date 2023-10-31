export class CreateUserDto {
    id?: number
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    photo: string;
    birthDate: Date;
    address: string;
    phone: string;
    role_id: number;
    org_id: number;
}
