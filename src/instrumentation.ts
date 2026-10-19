import type { Instrumentation } from "next";
import { sendSlackNotification } from "./libs/utils";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  request
) => {
  const stack = (error as Error).stack ?? String(error);

  await sendSlackNotification(
    `[${request.method} ${request.path}]\n${stack.substring(0, 500)}...`
  );
};
