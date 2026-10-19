import GlobalException from "@/exceptions/GlobalException";
import { sendSlackNotification } from "./utils";

export interface ErrorResponse {
  message: string;
  statusCode: number;
}

export default async function handleError(
  error: unknown
): Promise<ErrorResponse> {
  console.error(error);

  if (error instanceof GlobalException) {
    return {
      message: error.message,
      statusCode: error.statusCode,
    };
  } else {
    await sendSlackNotification(
      `${(error as Error).stack!.substring(0, 500)}...`
    );

    return {
      // 내부 에러 내용(DB 등)이 클라이언트에 노출되지 않도록 일반 메시지만 돌려준다
      message: "서버 에러가 발생했습니다. 관리자에게 문의하세요.",
      statusCode: 500,
    };
  }
}
