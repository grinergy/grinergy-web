"use server";

import { assertAdmin } from "@/libs/auth";
import { createLog } from "@/actions/log.actions";
import NotFoundException from "@/exceptions/NotFoundException";
import { NEWS_COUNT_TAG, NEWS_TAG } from "@/libs/constants";
import db from "@/libs/db";
import { deleteOneFile } from "@/libs/file-storage";
import handleError from "@/libs/error-handler";
import { sendSlackNotification } from "@/libs/utils";
import { updateTag } from "next/cache";

export async function deleteNews(newsId: string) {
  try {
    await assertAdmin();

    const news = await db.news.findUnique({
      where: {
        id: newsId,
      },
      select: {
        id: true,
        photo: true,
      },
    });

    if (!news) throw new NotFoundException("뉴스 정보가 없습니다.");

    await db.news.delete({
      where: {
        id: news.id,
      },
    });

    await createLog("NEWS", newsId, "DELETE", null);

    updateTag(NEWS_TAG);
    updateTag(NEWS_COUNT_TAG);

    // 파일 삭제에 실패해도 뉴스 삭제는 유지하고, 남은 파일은 Slack으로 알림
    if (news.photo) {
      try {
        await deleteOneFile(news.photo);
      } catch {
        await sendSlackNotification(`뉴스 이미지 삭제 실패: ${news.photo}`);
      }
    }
  } catch (error) {
    return await handleError(error);
  }
}
