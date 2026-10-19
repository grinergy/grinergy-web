import { isSafeUrl } from "@/libs/utils";
import { z } from "zod";

export const updateNewsSchema = z.object({
  photo: z.string().nullish(),
  title: z
    .string()
    .min(1, {
      message: "제목을 입력해주세요",
    })
    .nullish(),
  url: z
    .string()
    .min(1, {
      message: "URL을 입력해주세요",
    })
    .refine(isSafeUrl, { message: "http 또는 https 주소만 입력할 수 있습니다." })
    .nullish(),
  contents: z
    .string()
    .min(1, {
      message: "내용을 입력해주세요",
    })
    .nullish(),
});

export type UpdateNewsDto = z.infer<typeof updateNewsSchema>;
