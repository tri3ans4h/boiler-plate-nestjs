import { TOrganizationDtoOutput } from "./organization.dto.output"
import { TRoleDtoOutput } from "./role.dto.output"

export type TUserProfileDtoOutput = {
    id: number
    email: string
    first_name: string
    last_name: string
    org: TOrganizationDtoOutput
    role: TRoleDtoOutput
}
