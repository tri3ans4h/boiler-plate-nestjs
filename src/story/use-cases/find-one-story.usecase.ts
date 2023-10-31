import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { StoryOutputDto } from '../dto/story-output.dto';
import { StoryRepository } from '../repositories/story.repository';
import { CustomOutputDto } from '../dto/custom-output.dto';
import { QueryResponse } from 'nestjs-prisma-querybuilder';
import { IStoryProps } from '../interfaces/story-props.interface';

interface IFindOneStoryUseCaseOutput {
  //storyOutputDto: CustomOutputDto<StoryOutputDto>;
  storyOutputDto: IStoryProps;
}

@Injectable()
export class FindOneStoryUseCase {
  constructor(private readonly storyRepository: StoryRepository) { }
  async execute(
    id: number,
    queryBuiderResponse: Partial<QueryResponse>,
    currentUser: any
  ): Promise<IFindOneStoryUseCaseOutput> {
    if (currentUser == null) { throw new UnauthorizedException() }
    const story = await this.storyRepository.findOne(id, queryBuiderResponse, currentUser);
    return {
      storyOutputDto: story
    };

  }
}
