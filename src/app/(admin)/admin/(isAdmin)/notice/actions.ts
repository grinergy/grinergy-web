"use server";

import { assertAdmin } from "@/libs/auth";
import { createLog } from "@/actions/log.actions";
import NotFoundException from "@/exceptions/NotFoundException";
import { NOTICE_COUNT_TAG, NOTICE_TAG } from "@/libs/constants";
import db from "@/libs/db";
import { deleteOneFile } from "@/libs/file-storage";
import handleError from "@/libs/error-handler";
import { updateTag } from "next/cache";

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
