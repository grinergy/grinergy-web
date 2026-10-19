"use server";

import { assertAdmin } from "@/libs/auth";
import { createLog } from "@/actions/log.actions";
import NotFoundException from "@/exceptions/NotFoundException";
import ValidationException from "@/exceptions/ValidationException";
import { NEWS_COUNT_TAG, NEWS_TAG } from "@/libs/constants";
import db from "@/libs/db";
import { deleteOneFile } from "@/libs/file-storage";
import handleError from "@/libs/error-handler";
import { sendSlackNotification } from "@/libs/utils";
import { updateTag } from "next/cache";
import { newsSchema, updateNewsSchema } from "./schema";

function getNewsFormData(formData: FormData) {
  return {
    photo: formData.get("photo"),
    title: formData.get("title"),
    url: formData.get("url"),
    contents: formData.get("contents"),
  };
}

export async function uploadNews(formData: FormData) {
  try {
    await assertAdmin();

    const result = newsSchema.safeParse(getNewsFormData(formData));
    if (!result.success) throw new ValidationException();
    const { title, url, contents, photo } = result.data;
    const { id } = await db.news.create({
      data: {
        title,
        contents,
        url,
        photo,
      },
      select: {
        id: true,
      },
    });

    await createLog("NEWS", id, "CREATE", { title, url, contents, photo });

    updateTag(NEWS_TAG);
    updateTag(NEWS_COUNT_TAG);
  } catch (error) {
    return await handleError(error);
  }
}

export const updateNews = async (newsId: string, formData: FormData) => {
  try {
    await assertAdmin();

    const data = getNewsFormData(formData);

    const news = await db.news.findUnique({
      where: {
        id: newsId,
      },
      select: {
        photo: true,
      },
    });

    if (!news) throw new NotFoundException("뉴스 정보가 없습니다.");

    const result = updateNewsSchema.safeParse(data);
    if (!result.success) throw new ValidationException();
    const { title, url, contents, photo } = result.data;

    await db.news.update({
      where: {
        id: newsId,
      },
      data: {
        title: title || undefined,
        contents: contents || undefined,
        url: url || undefined,
        photo,
      },
    });

    await createLog("NEWS", newsId, "UPDATE", { title, url, contents, photo });

    updateTag(NEWS_TAG);

    // 수정이 반영된 뒤에 이전 이미지를 지운다. 실패해도 수정은 유지하고 Slack으로 알림
    if (photo && news.photo) {
      try {
        await deleteOneFile(news.photo);
      } catch {
        await sendSlackNotification(`뉴스 이미지 삭제 실패: ${news.photo}`);
      }
    }
  } catch (error) {
    return await handleError(error);
  }
};

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
