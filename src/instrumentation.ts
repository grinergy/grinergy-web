import type { Instrumentation } from "next";
import { sendSlackNotification } from "./libs/utils";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request
) => {
  // 인증 실패 등 예상된 에러(GlobalException의 4xx)는 알리지 않는다.
  // instrumentation은 따로 번들되어 instanceof가 맞지 않을 수 있어 statusCode로 판단
  const statusCode = (error as { statusCode?: unknown }).statusCode;
  if (typeof statusCode === "number" && statusCode < 500) return;

  const stack = (error as Error).stack ?? String(error);

  await sendSlackNotification(
    `[${request.method} ${request.path}]\n${stack.substring(0, 500)}...`
  );
};
