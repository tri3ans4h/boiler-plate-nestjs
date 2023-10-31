import { PaginatedOutputDto } from "src/common/paginated-output.dto";
import { StoryOutputDto } from "../dto/story-output.dto";
import { IFindStoryFilters } from "../interfaces/find-story-filters.interface";
import { IStoryProps } from "../interfaces/story-props.interface";
import { CustomOutputDto } from "../dto/custom-output.dto";
import { QueryResponse } from "nestjs-prisma-querybuilder";


export abstract class StoryRepository {
  abstract create(category: IStoryProps): Promise<void>;

  abstract createEx(
    category: IStoryProps,
    currentUser: any): Promise<IStoryProps>;

  abstract findEx(
    filters: any,
    queryBuiderResponse: Partial<QueryResponse>,
    currentUser: any
  ): Promise<PaginatedOutputDto<StoryOutputDto>>;

  abstract findOne(
    id: number,
    queryBuiderResponse: Partial<QueryResponse>,
    currentUser: any
  ): Promise<IStoryProps>;
  //: Promise<CustomOutputDto<StoryOutputDto>>;

  abstract update(
    id: number,
    data: Partial<IStoryProps>,
    currentUser: any
  ): Promise<IStoryProps>;
  //: Promise<CustomOutputDto<StoryOutputDto>>;

  abstract remove(
    id: number,
    currentUser: any
  ): Promise<IStoryProps>;
  //: Promise<CustomOutputDto<StoryOutputDto>>;




}
