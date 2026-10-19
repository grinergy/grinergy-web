import { getIsAdmin } from "@/app/actions";
import db from "@/libs/db";
import handleError from "@/libs/error-handler";
import s3Client from "@/libs/s3-client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const fileKey = decodeURIComponent(searchParams.get("fileKey") || "");
  const fileName = decodeURIComponent(searchParams.get("fileName") || "");

  if (!fileKey || !fileName)
    return new Response("파일 경로 및 이름을 모두 전달해주세요.", {
      status: 400,
    });

  try {
    // 공지사항 첨부 파일로 등록된 키만 내려주고, 숨긴 공지의 파일은 어드민만 받을 수 있다
    const fileInfo = await db.file.findUnique({
      where: { fileKey },
      select: { notice: { select: { isHidden: true } } },
    });

    if (!fileInfo || (fileInfo.notice.isHidden && !(await getIsAdmin())))
      return new Response("파일이 존재하지 않습니다.", {
        status: 404,
      });

    const file = await s3Client.send(
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileKey,
      })
    );

    return new NextResponse(file.Body?.transformToWebStream(), {
      headers: {
        "Content-Disposition": `attachment; filename=${encodeURIComponent(
          fileName
        )}`,
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    await handleError(error);
    return new Response("서버 에러가 발생했습니다. 관리자에게 문의하세요.", {
      status: 500,
    });
  }
}
