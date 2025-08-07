import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateConnectionRequestDto {
  @IsNotEmpty()
  @IsString()
  receiver_id: string;
}
