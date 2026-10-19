import { z } from "zod";

const title = z
  .string({
    required_error: "제목은 필수입니다.",
  })
  .min(1, { message: "제목을 입력해주세요" });

const contents = z
  .string({
    required_error: "내용은 필수입니다.",
  })
  .min(1, { message: "내용을 입력해주세요" });

export const noticeSchema = z.object({
  files: z.array(z.string()).nullish(),
  title,
  contents,
});

// 수정 시에는 바뀐 필드만 보낸다
export const updateNoticeSchema = z.object({
  files: z.array(z.string()).nullish(),
  title: title.nullish(),
  contents: contents.nullish(),
  createdAt: z.string().nullish(),
  deletedFiles: z.array(z.string()).nullish(),
});

export type CreateNoticeSchema = z.infer<typeof noticeSchema>;
export type UpdateNoticeDto = z.infer<typeof updateNoticeSchema>;
