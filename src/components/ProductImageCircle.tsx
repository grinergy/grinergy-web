"use client";

import { motion } from "framer-motion";

export default function ProductImageCircle() {
  return (
    <motion.div
      animate={{
        opacity: [1, 0, 1, 1, 1, 1],
        transition: { duration: 3, repeat: Infinity },
      }}
      initial={{ opacity: 1 }}
      className="w-[24vw] sm:w-[21vw] lg:w-[19.27vw] absolute top-1/2 left-1/2 sm:top-[48%] lg:top-1/2 -translate-x-1/2 -translate-y-1/2 aspect-square border border-white font-en flex justify-center items-center rounded-full text-white"
    >
      <span className="whitespace-pre-wrap text-center relative top-[4%] text-[10px] sm:text-[9pt] lg:text-[1.8229vw] leading-[9pt] sm:leading-[10pt] lg:leading-[2.1875vw] tracking-[0.05em] lg:tracking-[-0.005em]">
        {"POTERE\nS2 Battery\nLTO"}
      </span>
    </motion.div>
  );
}
