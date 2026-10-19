"use server";

import { assertAdmin } from "@/libs/auth";
import FileDeleteException from "@/exceptions/FileDeleteException";
import NotFoundException from "@/exceptions/NotFoundException";
import { NOTICE_TAG } from "@/libs/constants";
import db from "@/libs/db";

import { createLog } from "@/actions/log.actions";
import ValidationException from "@/exceptions/ValidationException";
import { deleteOneFile } from "@/libs/file-storage";
import handleError from "@/libs/error-handler";
import { File as PrismaFileObject } from "@prisma/client";
import { updateTag } from "next/cache";
import { updateNoticeSchema } from "./schema";

export const updateNotice = async (noticeId: string, formData: FormData) => {
  try {
    await assertAdmin();

    const data = {
      title: formData.get("title"),
      contents: formData.get("contents"),
      createdAt: formData.get("createdAt"),
      deletedFiles: formData.getAll("deletedFiles"),
      files: formData.getAll("files"),
    };

    const notice = await db.notice.findUnique({
      where: {
        id: noticeId,
      },
      select: {
        files: true,
      },
    });

    if (!notice) throw new NotFoundException("공지사항 정보가 없습니다.");

    const result = updateNoticeSchema.safeParse(data);
    if (!result.success) throw new ValidationException();

    const { title, contents, createdAt, files, deletedFiles } = result.data;

    // 이 공지에 붙은 파일만 지울 수 있게 한다
    const ownFileKeys = new Set(notice.files.map(({ fileKey }) => fileKey));
    if (deletedFiles?.some((fileKey) => !ownFileKeys.has(fileKey)))
      throw new ValidationException();

    try {
      deletedFiles?.forEach(async (deletedFileKey) => {
        await deleteOneFile(deletedFileKey);
        await db.file.delete({
          where: {
            noticeId,
            fileKey: deletedFileKey,
          },
        });
      });
    } catch (error) {
      throw new FileDeleteException();
    }

    await db.notice.update({
      where: {
        id: noticeId,
      },
      data: {
        title: title ? title : undefined,
        contents: contents ? contents : undefined,
        createdAt: createdAt ? new Date(createdAt) : undefined,
      },
    });

    if (files && files.length > 0) {
      await db.file.createMany({
        data: files.map(
          (fileKey) =>
            ({
              fileName: fileKey.split("_")[1],
              fileKey,
              noticeId: noticeId,
            } as PrismaFileObject)
        ),
      });
    }

    await createLog("NOTICE", noticeId, "UPDATE", {
      title,
      contents,
      createdAt,
      files,
      deletedFiles,
    });

    updateTag(NOTICE_TAG);
  } catch (error) {
    return await handleError(error);
  }
};
