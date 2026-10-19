"use server";

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const getIsAdmin = async () => {
  const token = (await cookies()).get("token")?.value;
  if (!token) return false;

  // 위조·만료된 토큰이면 verify가 예외를 던지므로 비로그인으로 취급
  try {
    const payload = jwt.verify(token, process.env.COOKIE_SECRET as string, {
      algorithms: ["HS256"],
    }) as jwt.JwtPayload & { ok?: boolean };

    // 만료 시간(exp)이 없는 예전 토큰은 받지 않는다
    return payload.ok === true && typeof payload.exp === "number";
  } catch {
    return false;
  }
};
