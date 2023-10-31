import { PaginatedOutputDto } from "src/common/paginated-output.dto";
import { UsersProfileOutputDto } from "../dto/users-profile-output.dto";
import { IFindUsersProfileFilters } from "../interfaces/find-users-profile-filters.interface";
import { IUsersProfileProps } from "../interfaces/users-profile-props.interface";
import { CustomOutputDto } from "../dto/custom-output.dto";
import { QueryResponse } from "nestjs-prisma-querybuilder";


export abstract class UsersProfileRepository {
  abstract create(category: IUsersProfileProps): Promise<void>;

  abstract createEx(
    category: IUsersProfileProps,
    currentUser: any): Promise<IUsersProfileProps>;

  abstract findEx(
    filters: any,
    queryBuiderResponse: Partial<QueryResponse>,
    currentUser: any
  ): Promise<PaginatedOutputDto<UsersProfileOutputDto>>;

  abstract findOne(
    id: number,
    queryBuiderResponse: Partial<QueryResponse>,
    currentUser: any
  ): Promise<IUsersProfileProps>;
  //: Promise<CustomOutputDto<UsersProfileOutputDto>>;

  abstract update(
    id: number,
    data: Partial<IUsersProfileProps>,
    currentUser: any
  ): Promise<IUsersProfileProps>;
  //: Promise<CustomOutputDto<UsersProfileOutputDto>>;

  abstract remove(
    id: number,
    currentUser: any
  ): Promise<IUsersProfileProps>;
  //: Promise<CustomOutputDto<UsersProfileOutputDto>>;




}
