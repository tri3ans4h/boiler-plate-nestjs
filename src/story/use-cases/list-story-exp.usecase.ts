import { Injectable } from '@nestjs/common';
import { PaginatedOutputDto } from 'src/common/paginated-output.dto';
import { ListStoryInputDto } from '../dto/list-story-input.dto';
import { StoryRepository } from '../repositories/story.repository';
import { StoryOutputDto } from '../dto/story-output.dto';
import { QueryResponse } from 'nestjs-prisma-querybuilder';

interface IListStoryExpUseCaseInput {
  listStoryInputDto: ListStoryInputDto;
  queryBuiderResponse: Partial<QueryResponse>
  currentUser: any
}
interface IListStoryUseCaseOutput {
  storyOutputDto: PaginatedOutputDto<StoryOutputDto>;
}

@Injectable()
export class ListStoryExpUseCase {
  constructor(private readonly storyRepository: StoryRepository) { }

  async execute(
    {
      listStoryInputDto,
      queryBuiderResponse,
      currentUser
    }: IListStoryExpUseCaseInput

  ): Promise<IListStoryUseCaseOutput> {
    const story = await this.storyRepository.findEx(
      listStoryInputDto, queryBuiderResponse, currentUser
    );
    return {
      storyOutputDto: story,
    };
  }
}
