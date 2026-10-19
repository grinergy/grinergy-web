"use client";
import { motion } from "framer-motion";

const investorImgList = [
  "/images/investor1.png",
  "/images/investor2.png",
  "/images/investor3.png",
  "/images/investor4.png",
  "/images/investor5.png",
  "/images/investor6.png",
  "/images/investor7.png",
  "/images/investor8.png",
  "/images/investor9.png",
];

// 부모 opacity를 늦게 올리면 그동안 앞쪽 로고 애니메이션이 안 보인 채 끝나므로, 부모는 그대로 두고 자식 시작만 늦춥니다.
const list = {
  hidden: {},
  show: {
    transition: {
      delayChildren: 0.4,
      staggerChildren: 0.15,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function InvestorGrid() {
  return (
    <motion.ul
      variants={list}
      animate={"show"}
      initial={"hidden"}
      className="grid grid-cols-3 gap-y-[7vh] gap-x-[2.8vw]"
    >
      {investorImgList.map((img, idx) => (
        <motion.li
          className="flex justify-center items-center text-white"
          key={idx}
          variants={item}
        >
          <img
            className="w-[26vw] lg:w-[12vw]"
            src={img}
            alt={`investor-${idx + 1}`}
          />
        </motion.li>
      ))}
    </motion.ul>
  );
}
