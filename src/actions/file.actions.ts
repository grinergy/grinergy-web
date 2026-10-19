"use server";

import { assertAdmin } from "@/libs/auth";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import s3Client from "@/libs/s3-client";

export async function getUploadUrl(fileName: string, fileType: string) {
  await assertAdmin();

  const fileKey = `${Date.now()}_${path.basename(fileName)}`;
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: fileType,
    ACL: "public-read",
  });
  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL 유효 기간 설정 (1시간)
  return [url, fileKey];
}

// R2_PUBLIC_ENDPOINT는 서버 전용 환경 변수라 클라이언트에서 Server Action으로 조회한다
export const getR2ImagePath = async (fileKey: string) => {
  return `${process.env.R2_PUBLIC_ENDPOINT}/${fileKey}`;
};
