import { AbilityBuilder, PureAbility } from "@casl/ability";
import { PrismaQuery, Subjects, createPrismaAbility } from "@casl/prisma";
import { Injectable } from "@nestjs/common";
import { Story, User, UserProfile } from "@prisma/client";
import { TUserProfileDtoOutput } from "src/common/interface/userprofile.dto.output";
import { UserEntity } from "src/users/entities/user.entity";

type AppSubjects = 'all' | Subjects<{
    User: User,
    UserProfile: UserProfile,
    UserProfileOld: TUserProfileDtoOutput,
    Story: Story
}>
type AppAbility = PureAbility<[string, AppSubjects], PrismaQuery>;

@Injectable()
export class AbilitiesFactory {
    defineAbility(user: UserEntity) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(createPrismaAbility);
        //console.log("UserLogged ", user)
        //RULES
        switch (user.role_id) {
            case 1: {  //SUPERADMIN
                can('manage', 'all')
                break;
            }
            case 2: { //ADMIN
                can('create', 'User', { org_id: user.org_id })
                cannot('create', 'User', { NOT: { org_id: user.org_id } }).because("Cannot create user outside organization");
                can('read', 'User', { org_id: user.org_id })

                cannot('create', 'User', { role_id: 1 }).because("Cannot create upper user ");
                cannot('read', 'User', { role_id: 1 }).because("Cannot read upper user");
                cannot('read', 'User', { NOT: { org_id: user.org_id } }).because("Cannot read user outside organization");

                cannot('delete', 'User', { role_id: 1 }).because("Cannot delete upper user ");
                cannot('delete', 'User', { role_id: user.role_id }).because("Cannot delete same role ");
                can('delete', 'User', { org_id: user.org_id })
                can('update', 'User', { org_id: user.org_id })
                cannot('update', 'User', { NOT: { org_id: user.org_id } }).because("Cannot update user outside organization");

                can('read', 'UserProfileOld', { id: user.id })
                cannot('read', 'UserProfileOld', { NOT: { id: user.id } }).because('Cannot read other profile')

                can('manage', 'Story', { org_id: user.org_id })
                cannot('manage', 'Story', { NOT: { org_id: user.org_id } }).because("Cannot manage story outside your organization");
                cannot('read', 'Story', { NOT: { org_id: user.org_id } }).because("Cannot read story outside your organization");

                can('manage', 'UserProfile',{ user_id: user.id })
                can('read', 'UserProfile')

                break;
            }
            case 3: { //USER
                can('read', 'UserProfileOld', { id: user.id })
                cannot('read', 'UserProfileOld', { NOT: { id: user.id } }).because('Cannot read other profile')

                can('create', 'Story', { AND: { user_id: user.id, org_id: user.org_id } })
                cannot('create', 'Story', { NOT: [{ org_id: user.org_id, user_id: user.id }] }).because('Cannot create data outside your organization and other`s user')

                can('read', 'Story', { user_id: user.id })
                //cannot('read', 'Story', { NOT: [{ org_id: user.org_id, user_id: user.id }] }).because('Cannot read data outside your organization and other`s user')

                can('update', 'Story', { user_id: user.id })
                cannot('update', 'Story', { NOT: [{ org_id: user.org_id, user_id: user.id }] }).because('Cannot update data outside your organization and other`s user')

                can('delete', 'Story', { user_id: user.id })
                cannot('delete', 'Story', { NOT: [{ org_id: user.org_id, user_id: user.id }] }).because('Not your data and your org')
                break;
            }
        }
        return build();
    }


}