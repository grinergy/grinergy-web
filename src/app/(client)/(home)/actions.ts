"use server";

import { cookies } from "next/headers";

export async function toKo() {
  (await cookies()).set("lan", "ko");
}
export async function toEn() {
  (await cookies()).set("lan", "en");
}
