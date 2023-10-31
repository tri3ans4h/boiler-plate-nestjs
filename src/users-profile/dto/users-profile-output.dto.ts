import { ApiProperty } from "@nestjs/swagger";
import { Exclude } from "class-transformer";

export class OrganizationOutputDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
}

export class UserOutputDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  email: string;
  @Exclude()
  password?: string;

  constructor(partial: Partial<UserOutputDTO>) {
    Object.assign(this, partial);
  }


}

export class UsersProfileOutputDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  user_id: number;
  @ApiProperty()
  email: string;
  @ApiProperty()
  firstName: string;
  @ApiProperty()
  lastName: string;
  @ApiProperty()
  photo: string;
  @ApiProperty()
  birthDate: Date;
  @ApiProperty()
  address: string;
  @ApiProperty()
  phone: string;
  @ApiProperty()
  created_at: Date;
  @ApiProperty()
  updated_at: Date;
  @ApiProperty()
  organization?: OrganizationOutputDTO
  @ApiProperty()
  user?: UserOutputDTO
  constructor(partial: Partial<UsersProfileOutputDto>) {
    //console.log(this.user)
    Object.assign(this, partial);
    //const keys = ["password"]
    //this.user = Object.fromEntries(Object.entries(this.user).filter(([key]) => !keys.includes(key))) as UserOutputDTO
  }

}
