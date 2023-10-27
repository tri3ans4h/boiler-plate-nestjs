import { OrganizationDtoOutput } from "./organization.dto.output"
import { RoleDtoOutput } from "./role.dto.output"


export type UserDtoOutput = {
    id: number
    email: string
    first_name: string
    last_name: string
    role_id?: number
    org_id?: number
    org: OrganizationDtoOutput
    role: RoleDtoOutput
}