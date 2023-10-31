import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUsersProfileInputDto } from '../dto/create-users-profile-input.dto';
import { IUsersProfileProps } from '../interfaces/users-profile-props.interface';
import { UsersProfileRepository } from '../repositories/users-profile.repository';

interface ICreateUsersProfileUseCaseInput {
  createUsersProfileInputDto: CreateUsersProfileInputDto;
  currentUser: any
}
interface ICreateUsersProfileUseCaseOutput {
  storyOutputDto: IUsersProfileProps
}
@Injectable()
export class CreateUsersProfileUseCase {
  constructor(private readonly storyRepository: UsersProfileRepository) { }

  async execute({
    createUsersProfileInputDto,
    currentUser
  }: ICreateUsersProfileUseCaseInput): Promise<ICreateUsersProfileUseCaseOutput> {
    if (currentUser == null) { throw new UnauthorizedException() }
    const usersProfile = await this.storyRepository.createEx(createUsersProfileInputDto, currentUser);
    return {
      storyOutputDto: usersProfile
    };
  }
}
