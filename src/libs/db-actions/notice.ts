import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import {
  NOTICE_COUNT_TAG,
  NOTICE_PAGE_SIZE,
  NOTICE_TAG,
  REVALIDATE_TIME,
} from "../constants";
import db from "../db";

const noticeSelect = {
  id: true,
  title: true,
  createdAt: true,
} satisfies Prisma.NoticeSelect;

const adminNoticeSelect = {
  id: true,
  title: true,
  contents: true,
  createdAt: true,
  isHidden: true,
} satisfies Prisma.NoticeSelect;

// 공개 페이지에서는 숨김 처리된 공지를 제외한다
const visible = { isHidden: { not: true } } satisfies Prisma.NoticeWhereInput;

const titleContains = (searchKeyword: string) =>
  ({ title: { contains: searchKeyword } }) satisfies Prisma.NoticeWhereInput;

const noticePage = (currPage: number) => ({
  orderBy: { createdAt: "desc" } as const,
  take: NOTICE_PAGE_SIZE,
  skip: NOTICE_PAGE_SIZE * (currPage - 1),
});

/* Client */

export async function getAllNotices(currPage: number) {
  if (currPage <= 0) return;
  return await db.notice.findMany({
    where: visible,
    select: noticeSelect,
    ...noticePage(currPage),
  });
}

export async function getSearchedNotices(
  currPage: number,
  searchKeyword: string
) {
  if (currPage <= 0) return;
  return await db.notice.findMany({
    select: noticeSelect,
    where: { ...visible, ...titleContains(searchKeyword) },
    ...noticePage(currPage),
  });
}

export async function getCachedAllNotices(currPage: number) {
  const cachedOperation = unstable_cache(
    getAllNotices,
    [NOTICE_TAG, currPage + ""],
    {
      tags: [NOTICE_TAG, currPage + ""],
      revalidate: REVALIDATE_TIME,
    }
  );

  return cachedOperation(currPage);
}

export type Notices = Prisma.PromiseReturnType<typeof getAllNotices>;

export async function getTotalNoticeCount() {
  return await db.notice.count({ where: visible });
}

export async function getSearchedNoticeCount(searchKeyword: string) {
  return await db.notice.count({
    where: { ...visible, ...titleContains(searchKeyword) },
  });
}

export const getCachedTotalNoticeCount = unstable_cache(
  getTotalNoticeCount,
  [NOTICE_COUNT_TAG],
  {
    tags: [NOTICE_COUNT_TAG],
    revalidate: REVALIDATE_TIME,
  }
);

/* Admin */

export async function getAllNoticesForAdmin(currPage: number) {
  if (currPage <= 0) return;
  return await db.notice.findMany({
    select: adminNoticeSelect,
    ...noticePage(currPage),
  });
}

export async function getSearchedNoticesForAdmin(
  currPage: number,
  searchKeyword: string
) {
  return await db.notice.findMany({
    select: adminNoticeSelect,
    where: titleContains(searchKeyword),
    ...noticePage(currPage),
  });
}

export async function getTotalNoticeCountForAdmin() {
  return await db.notice.count();
}

export async function getSearchedNoticeCountForAdmin(searchKeyword: string) {
  return await db.notice.count({ where: titleContains(searchKeyword) });
}
