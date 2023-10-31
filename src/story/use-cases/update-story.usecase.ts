import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { StoryOutputDto } from '../dto/story-output.dto';
import { StoryRepository } from '../repositories/story.repository';
import { CustomOutputDto } from '../dto/custom-output.dto';
import { IStoryProps } from '../interfaces/story-props.interface';

/*
interface IUpdateStoryUseCaseOutput {
  storyOutputDto: CustomOutputDto<StoryOutputDto>;
}*/

interface IUpdateStoryUseCaseOutput {
  storyOutputDto: IStoryProps;
}

@Injectable()
export class UpdateStoryUseCase {
  constructor(private readonly storyRepository: StoryRepository) { }
  async execute(
    id: number,
    data: Partial<IStoryProps>,
    currentUser: any
  ): Promise<IUpdateStoryUseCaseOutput> {
    if (currentUser == null) { throw new UnauthorizedException() }
    const story = await this.storyRepository.update(id, data, currentUser);
    return {
      storyOutputDto: story
    };

  }
}
