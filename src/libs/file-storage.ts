import FileDeleteException from "@/exceptions/FileDeleteException";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./s3-client";

// "use server" 파일에 두면 외부에서 호출할 수 있는 Server Action이 되므로 분리
export const deleteOneFile = async (fileKey: string) => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME as string,
        Key: fileKey,
      })
    );
  } catch (error) {
    throw new FileDeleteException();
  }
};
