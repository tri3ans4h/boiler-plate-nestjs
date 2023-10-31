import { ApiProperty } from "@nestjs/swagger";

export class OrganizationOutputDTO {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
}

export class StoryOutputDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  content: string;
  @ApiProperty()
  user_id: number;
  @ApiProperty()
  org_id: number;

  @ApiProperty()
  organization?: OrganizationOutputDTO
}
