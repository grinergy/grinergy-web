"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

// transform이 걸린 동안 absolute·fixed 요소가 이 div 기준으로 배치되다가 애니메이션이 끝나면 위치가 튀는 페이지는 opacity만 바꿉니다.
// - 메인: absolute 영상·문구
// - investors: fixed 초록 배경 (제목·로고는 페이지 안에서 따로 올라옵니다)
const FADE_ONLY_PATHS = ["/", "/investors"];

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFadeOnly = FADE_ONLY_PATHS.includes(pathname);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: isFadeOnly ? 0 : 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
