import { getIsAdmin } from "@/app/actions";
import { redirect } from "next/navigation";

export default async function AdminLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 이미 로그인 되어 있는 경우 "/admin"으로 리다이렉트
  // 쿠키가 있는지만 보면 만료·위조된 토큰일 때 (isAdmin) 레이아웃과 서로 리다이렉트하며 무한 루프가 생긴다
  if (await getIsAdmin()) {
    redirect("/admin");
  }
  return children;
}
