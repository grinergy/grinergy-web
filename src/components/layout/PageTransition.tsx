"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // 메인의 absolute 영상·문구가 transform 기준으로 배치되다가 애니메이션이 끝나면 위치가 튀므로, 메인은 opacity만 바꿉니다.
  const isHome = pathname === "/";

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: isHome ? 0 : 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  );
}
