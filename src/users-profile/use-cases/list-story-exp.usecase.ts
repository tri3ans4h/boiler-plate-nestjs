import { Injectable } from '@nestjs/common';
import { PaginatedOutputDto } from 'src/common/paginated-output.dto';
import { ListUsersProfileInputDto } from '../dto/list-users-profile-input.dto';
import { UsersProfileRepository } from '../repositories/users-profile.repository';
import { UserOutputDTO, UsersProfileOutputDto } from '../dto/users-profile-output.dto';
import { QueryResponse } from 'nestjs-prisma-querybuilder';
import { plainToClass } from 'class-transformer';

interface IListUsersProfileExpUseCaseInput {
  listUsersProfileInputDto: ListUsersProfileInputDto;
  queryBuiderResponse: Partial<QueryResponse>
  currentUser: any
}
interface IListUsersProfileUseCaseOutput {
  storyOutputDto: PaginatedOutputDto<UsersProfileOutputDto>;
}

@Injectable()
export class ListUsersProfileExpUseCase {
  constructor(private readonly storyRepository: UsersProfileRepository) { }
  async execute(
    {
      listUsersProfileInputDto,
      queryBuiderResponse,
      currentUser
    }: IListUsersProfileExpUseCaseInput

  ): Promise<IListUsersProfileUseCaseOutput> {
    const story = await this.storyRepository.findEx(
      listUsersProfileInputDto, queryBuiderResponse, currentUser
    );
    const keys = ["password"]
    story.data.map(v => {
      if (v.user) {
      const m = Object.fromEntries(Object.entries(v.user).filter(([key]) => !keys.includes(key)));
        v.user = m as UserOutputDTO;
      }

    })
    return {
      storyOutputDto: story,
    };
  }
}
