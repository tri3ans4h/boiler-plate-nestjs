import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateStoryInputDto } from '../dto/create-story-input.dto';
import { StoryOutputDto } from '../dto/story-output.dto';
import { IStoryProps } from '../interfaces/story-props.interface';
import { StoryRepository } from '../repositories/story.repository';
import { CustomOutputDto } from '../dto/custom-output.dto';

interface ICreateStoryUseCaseInput {
  createStoryInputDto: CreateStoryInputDto;
  currentUser: any
}
/*
interface ICreateStoryUseCaseOutput {
  storyOutputDto: CustomOutputDto<StoryOutputDto>;
}*/
interface ICreateStoryUseCaseOutput {
  storyOutputDto: IStoryProps
}
@Injectable()
export class CreateStoryUseCase {
  constructor(private readonly storyRepository: StoryRepository) { }

  async execute({
    createStoryInputDto,
    currentUser
  }: ICreateStoryUseCaseInput): Promise<ICreateStoryUseCaseOutput> {
    if (currentUser == null) { throw new UnauthorizedException() }
    /* const story: IStoryProps = {
       title: createStoryInputDto.title,
       content: createStoryInputDto.content,
       user_id: createStoryInputDto.user_id,
       org_id: createStoryInputDto.org_id,
     };*/
   
    const story = await this.storyRepository.createEx(createStoryInputDto, currentUser);
   
    return {
      storyOutputDto: story
    };
  }
}
