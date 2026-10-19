"use server";

import { assertAdmin } from "@/libs/auth";
import { createLog } from "@/actions/log.actions";
import ValidationException from "@/exceptions/ValidationException";
import { NOTICE_COUNT_TAG, NOTICE_TAG } from "@/libs/constants";
import db from "@/libs/db";
import handleError from "@/libs/error-handler";
import { File as PrismaFileObject } from "@prisma/client";
import { updateTag } from "next/cache";
import { noticeSchema } from "./schema";

export async function uploadNotice(formData: FormData) {
  try {
    await assertAdmin();

    const data = {
      files: formData.getAll("files"),
      title: formData.get("title"),
      contents: formData.get("contents"),
    };

    const result = noticeSchema.safeParse(data);
    if (!result.success) throw new ValidationException();

    const { title, contents, files } = result.data;
    const notice = await db.notice.create({
      data: {
        title,
        contents,
      },
      select: {
        id: true,
      },
    });

    if (files && files.length > 0) {
      await db.file.createMany({
        data: files.map(
          (fileKey) =>
            ({
              fileName: fileKey.split("_")[1],
              fileKey,
              noticeId: notice.id,
            } as PrismaFileObject)
        ),
      });
    }

    await createLog("NOTICE", notice.id, "CREATE", { title, contents, files });

    updateTag(NOTICE_TAG);
    updateTag(NOTICE_COUNT_TAG);
  } catch (error) {
    return await handleError(error);
  }
}
