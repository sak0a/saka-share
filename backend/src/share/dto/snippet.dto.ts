import { Expose, plainToClass } from "class-transformer";
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateSnippetDTO {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @IsString()
  @MaxLength(1048576)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  language?: string;

  @IsOptional()
  @IsInt()
  order?: number;
}

export class SnippetDTO {
  @Expose()
  id: string;

  @Expose()
  title?: string;

  @Expose()
  content: string;

  @Expose()
  language?: string;

  @Expose()
  order: number;

  from(partial: Partial<SnippetDTO>) {
    return plainToClass(SnippetDTO, partial, { excludeExtraneousValues: true });
  }

  fromList(partial: Partial<SnippetDTO>[]) {
    return partial.map((part) =>
      plainToClass(SnippetDTO, part, { excludeExtraneousValues: true }),
    );
  }
}
