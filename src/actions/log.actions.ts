"use server";

import db from "@/libs/db";
import { $Enums } from "@prisma/client";
import moment from "moment-timezone";
import { headers } from "next/headers";

export const createLog = async (
  modelType: $Enums.ModelType,
  modelId: string,
  operationType: $Enums.OperationType,
  data: Object | null
) => {
  const ipAddress = (headers().get("x-forwarded-for") ?? "127.0.0.1").split(
    ","
  )[0];
  await db.operationLog.create({
    data: {
      modelType,
      modelId,
      operationType,
      changedData: JSON.stringify(data),
      ipAddress,
      timestamp: moment().tz("Asia/Seoul").toDate(),
    },
  });
};
