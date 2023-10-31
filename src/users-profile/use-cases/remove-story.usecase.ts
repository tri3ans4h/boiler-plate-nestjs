import { Injectable } from '@nestjs/common';
import { UsersProfileRepository } from '../repositories/users-profile.repository';
import { IUsersProfileProps } from '../interfaces/users-profile-props.interface';

interface IRemoveUsersProfileUseCaseOutput {
  storyOutputDto: IUsersProfileProps
}

@Injectable()
export class RemoveUsersProfileUseCase {
  constructor(private readonly storyRepository: UsersProfileRepository) { }
  async execute(
    id: number,
    currentUser: any
  ): Promise<IRemoveUsersProfileUseCaseOutput> {
    const story = await this.storyRepository.remove(id, currentUser);
    return {
      storyOutputDto: story
    };

  }
}
