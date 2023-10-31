import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersProfileRepository } from '../repositories/users-profile.repository';
import { IUsersProfileProps } from '../interfaces/users-profile-props.interface';

interface IUpdateUsersProfileUseCaseOutput {
  storyOutputDto: IUsersProfileProps;
}

@Injectable()
export class UpdateUsersProfileUseCase {
  constructor(private readonly storyRepository: UsersProfileRepository) { }
  async execute(
    id: number,
    data: Partial<IUsersProfileProps>,
    currentUser: any
  ): Promise<IUpdateUsersProfileUseCaseOutput> {
    if (currentUser == null) { throw new UnauthorizedException() }
    const story = await this.storyRepository.update(id, data, currentUser);
    return {
      storyOutputDto: story
    };

  }
}
