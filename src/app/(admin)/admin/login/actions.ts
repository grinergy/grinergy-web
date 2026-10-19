"use server";

import { createHash, timingSafeEqual } from "crypto";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const formSchema = z.object({
  password: z.string({
    required_error: "비밀번호는 필수입니다.",
  }),
});

const MAX_LOGIN_FAILURES = 5;
const LOGIN_LOCK_MS = 15 * 60 * 1000; // 15분

// IP별 로그인 실패 기록. 서버 인스턴스 메모리에만 있어 인스턴스마다 따로 센다
const loginFailures = new Map<string, { count: number; lockedUntil: number }>();

// 길이가 달라도 일정한 시간에 비교하도록 해시끼리 비교
const isSamePassword = (input: string, expected: string) =>
  timingSafeEqual(
    createHash("sha256").update(input).digest(),
    createHash("sha256").update(expected).digest()
  );

export const login = async (prevState: any, formData: FormData) => {
  const data = {
    password: formData.get("password"),
  };

  const result = formSchema.safeParse(data);

  if (!result.success) return result.error.flatten();

  const ip =
    ((await headers()).get("x-forwarded-for") ?? "unknown").split(",")[0];
  const now = Date.now();
  const failure = loginFailures.get(ip);

  if (failure && failure.lockedUntil > now) {
    return {
      fieldErrors: {
        password: ["로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요."],
      },
    };
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || !isSamePassword(result.data.password, adminPassword)) {
    const count = (failure?.count ?? 0) + 1;
    loginFailures.set(ip, {
      count: count >= MAX_LOGIN_FAILURES ? 0 : count,
      lockedUntil: count >= MAX_LOGIN_FAILURES ? now + LOGIN_LOCK_MS : 0,
    });
    return {
      fieldErrors: {
        password: ["비밀번호가 일치하지 않습니다."],
      },
    };
  }

  loginFailures.delete(ip);

  const token = jwt.sign({ ok: true }, process.env.COOKIE_SECRET as string, {
    algorithm: "HS256",
    expiresIn: "3d",
  });

  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 259200, // 3d
  });

  redirect("/admin/notice");
};

export const logout = async () => {
  (await cookies()).delete("token");
  redirect("/admin/login");
};
