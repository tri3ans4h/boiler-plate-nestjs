import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersProfileRepository } from '../repositories/users-profile.repository';
import { QueryResponse } from 'nestjs-prisma-querybuilder';
import { IUsersProfileProps } from '../interfaces/users-profile-props.interface';

interface IFindOneUsersProfileUseCaseOutput {
  storyOutputDto: IUsersProfileProps;
}

@Injectable()
export class FindOneUsersProfileUseCase {
  constructor(private readonly storyRepository: UsersProfileRepository) { }
  async execute(
    id: number,
    queryBuiderResponse: Partial<QueryResponse>,
    currentUser: any
  ): Promise<IFindOneUsersProfileUseCaseOutput> {
    if (currentUser == null) { throw new UnauthorizedException() }
    const story = await this.storyRepository.findOne(id, queryBuiderResponse, currentUser);
    return {
      storyOutputDto: story
    };

  }
}
