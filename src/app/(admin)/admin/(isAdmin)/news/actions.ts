"use server";

import { createLog } from "@/actions/log.actions";
import NotFoundException from "@/exceptions/NotFoundException";
import { NEWS_COUNT_TAG, NEWS_TAG } from "@/libs/constants";
import db from "@/libs/db";
import { deleteOneFile } from "@/libs/db-actions/file";
import handleError from "@/libs/error-handler";
import { revalidateTag } from "next/cache";

export async function deleteNews(newsId: string) {
  try {
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
    if (news.photo) await deleteOneFile(news.photo);

    await db.news.delete({
      where: {
        id: news.id,
      },
    });

    await createLog("NEWS", newsId, "DELETE", null);

    revalidateTag(NEWS_TAG);
    revalidateTag(NEWS_COUNT_TAG);
  } catch (error) {
    return await handleError(error);
  }
}
