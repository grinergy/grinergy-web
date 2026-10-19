import { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";
import {
  NEWS_COUNT_TAG,
  NEWS_PAGE_SIZE,
  NEWS_TAG,
  REVALIDATE_TIME,
} from "../constants";
import db from "../db";

const newsSelect = {
  id: true,
  title: true,
  contents: true,
  url: true,
  photo: true,
} satisfies Prisma.NewsSelect;

const adminNewsSelect = {
  id: true,
  title: true,
  contents: true,
  createdAt: true,
} satisfies Prisma.NewsSelect;

const titleContains = (searchKeyword: string) =>
  ({ title: { contains: searchKeyword } }) satisfies Prisma.NewsWhereInput;

const newsPage = (currPage: number) => ({
  orderBy: { createdAt: "desc" } as const,
  take: NEWS_PAGE_SIZE,
  skip: NEWS_PAGE_SIZE * (currPage - 1),
});

/* Client */
export async function getAllNews(currPage: number) {
  if (currPage <= 0) return;
  return await db.news.findMany({
    select: newsSelect,
    ...newsPage(currPage),
  });
}

export async function getSearchedNews(currPage: number, searchKeyword: string) {
  if (currPage <= 0) return;
  return await db.news.findMany({
    select: newsSelect,
    where: titleContains(searchKeyword),
    ...newsPage(currPage),
  });
}

export async function getCachedAllNews(currPage: number) {
  const cachedOperation = unstable_cache(
    getAllNews,
    [NEWS_TAG, currPage + ""],
    {
      tags: [NEWS_TAG, currPage + ""],
      revalidate: REVALIDATE_TIME,
    }
  );

  return cachedOperation(currPage);
}

export async function getTotalNewsCount() {
  return await db.news.count();
}

export async function getSearchedNewsCount(searchKeyword: string) {
  return await db.news.count({ where: titleContains(searchKeyword) });
}

export const getCachedTotalNewsCount = unstable_cache(
  getTotalNewsCount,
  [NEWS_COUNT_TAG],
  {
    tags: [NEWS_COUNT_TAG],
    revalidate: REVALIDATE_TIME,
  }
);

/* Admin */

export async function getAllNewsForAdmin(currPage: number) {
  return await db.news.findMany({
    select: adminNewsSelect,
    ...newsPage(currPage),
  });
}

export async function getSearchedNewsForAdmin(
  currPage: number,
  searchKeyword: string
) {
  return await db.news.findMany({
    select: adminNewsSelect,
    where: titleContains(searchKeyword),
    ...newsPage(currPage),
  });
}
