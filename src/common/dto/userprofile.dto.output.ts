import { TUserProfileDtoOutput } from "../interface/userprofile.dto.output"
import { OrganizationDtoOutput } from "./organization.dto.output"
import { RoleDtoOutput } from "./role.dto.output"

export class UserProfileDtoOutput implements TUserProfileDtoOutput {
    id: number
    email: string
    first_name: string
    last_name: string
    org: OrganizationDtoOutput
    role: RoleDtoOutput

}