import { IsString, IsNotEmpty } from 'class-validator';

export class KiuRequestDto {
  @IsString()
  @IsNotEmpty()
  user: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  request: string;
}

