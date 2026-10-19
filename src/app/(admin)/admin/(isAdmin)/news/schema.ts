import { isSafeUrl } from "@/libs/utils";
import { z } from "zod";

const title = z
  .string({
    required_error: "제목은 필수입니다.",
  })
  .min(1, {
    message: "제목을 입력해주세요",
  });

const url = z
  .string({
    required_error: "URL은 필수입니다.",
  })
  .min(1, {
    message: "URL을 입력해주세요",
  })
  .refine(isSafeUrl, { message: "http 또는 https 주소만 입력할 수 있습니다." });

const contents = z
  .string({
    required_error: "내용은 필수입니다.",
  })
  .min(1, {
    message: "내용을 입력해주세요",
  });

export const newsSchema = z.object({
  photo: z.string().nullish(),
  title,
  url,
  contents,
});

// 수정 시에는 바뀐 필드만 보낸다
export const updateNewsSchema = z.object({
  photo: z.string().nullish(),
  title: title.nullish(),
  url: url.nullish(),
  contents: contents.nullish(),
});

export type CreateNewsSchema = z.infer<typeof newsSchema>;
export type UpdateNewsDto = z.infer<typeof updateNewsSchema>;
