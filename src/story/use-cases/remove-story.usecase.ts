import { Injectable } from '@nestjs/common';
import { StoryOutputDto } from '../dto/story-output.dto';
import { StoryRepository } from '../repositories/story.repository';
import { CustomOutputDto } from '../dto/custom-output.dto';
import { IStoryProps } from '../interfaces/story-props.interface';

interface IRemoveStoryUseCaseOutput {
  //storyOutputDto: CustomOutputDto<StoryOutputDto>;
  storyOutputDto: IStoryProps
}

@Injectable()
export class RemoveStoryUseCase {
  constructor(private readonly storyRepository: StoryRepository) { }
  async execute(
    id: number,
    currentUser: any
  ): Promise<IRemoveStoryUseCaseOutput> {
    const story = await this.storyRepository.remove(id, currentUser);
    return {
      storyOutputDto: story
    };

  }
}
