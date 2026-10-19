"use server";

import { assertAdmin } from "@/libs/auth";
import { createLog } from "@/actions/log.actions";
import FileDeleteException from "@/exceptions/FileDeleteException";
import NotFoundException from "@/exceptions/NotFoundException";
import ValidationException from "@/exceptions/ValidationException";
import { NOTICE_COUNT_TAG, NOTICE_TAG } from "@/libs/constants";
import db from "@/libs/db";
import { deleteOneFile, getFileNameFromKey } from "@/libs/file-storage";
import handleError from "@/libs/error-handler";
import { File as PrismaFileObject } from "@prisma/client";
import { updateTag } from "next/cache";
import { noticeSchema, updateNoticeSchema } from "./schema";

// 클라이언트가 R2에 올린 파일들을 공지에 연결한다
async function attachFiles(noticeId: string, files?: string[] | null) {
  if (files && files.length > 0) {
    await db.file.createMany({
      data: files.map(
        (fileKey) =>
          ({
            fileName: getFileNameFromKey(fileKey),
            fileKey,
            noticeId,
          } as PrismaFileObject)
      ),
    });
  }
}

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

    await attachFiles(notice.id, files);

    await createLog("NOTICE", notice.id, "CREATE", { title, contents, files });

    updateTag(NOTICE_TAG);
    updateTag(NOTICE_COUNT_TAG);
  } catch (error) {
    return await handleError(error);
  }
}

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
      for (const deletedFileKey of deletedFiles ?? []) {
        await deleteOneFile(deletedFileKey);
        await db.file.delete({
          where: {
            noticeId,
            fileKey: deletedFileKey,
          },
        });
      }
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

    await attachFiles(noticeId, files);

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

export async function deleteNotice(noticeId: string) {
  try {
    await assertAdmin();

    const notice = await db.notice.findUnique({
      where: {
        id: noticeId,
      },
      select: {
        id: true,
        files: {
          select: {
            fileKey: true,
          },
        },
      },
    });

    if (!notice) throw new NotFoundException("공지사항 정보가 없습니다.");

    const fileDeletionPromises = notice.files.map(async ({ fileKey }) => {
      await deleteOneFile(fileKey);
    });

    await db.notice.delete({
      where: {
        id: notice.id,
      },
    });

    // 모든 파일 삭제 작업이 완료될 때까지 기다림
    await Promise.all(fileDeletionPromises);

    await createLog("NOTICE", noticeId, "DELETE", null);

    updateTag(NOTICE_TAG);
    updateTag(NOTICE_COUNT_TAG);
  } catch (error) {
    return await handleError(error);
  }
}

export async function toggleNoticeVisibility(noticeId: string, isHidden: boolean) {
  try {
    await assertAdmin();

    await db.notice.update({
      where: { id: noticeId },
      data: { isHidden: !isHidden },
    });

    await createLog("NOTICE", noticeId, "UPDATE", { isHidden: !isHidden });

    updateTag(NOTICE_TAG);
    updateTag(NOTICE_COUNT_TAG);
  } catch (error) {
    return await handleError(error);
  }
}
