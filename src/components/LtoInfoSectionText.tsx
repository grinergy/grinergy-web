"use client";

import useIsMobile from "@/hooks/useIsMobile";
import { cn } from "@/libs/utils";
import { LtoInfoItem } from "./LtoInfoSection";

interface LtoInfoSectionTextProps {
  isEng: boolean;
  item: LtoInfoItem;
}

export default function LtoInfoSectionText({
  isEng,
  item,
}: LtoInfoSectionTextProps) {
  const isMobile = useIsMobile();

  return (
    <div className="w-full lg:w-auto gap-[50px] lg:gap-[80px] mt-[5vh] lg:mt-0 h-full flex flex-col justify-center lg:justify-end">
      <div className="flex justify-between items-end text-green border-b-[0.5pt] border-black pb-[5px] lg:pb-0">
        <h3
          className={cn(
            "text-[10pt] lg:text-[15px] xl:text-[20px] relative bottom-[0.2604vw] whitespace-pre-wrap font-bold",
            isEng
              ? "tracking-normal sm:text-[12pt]"
              : "tracking-[-0.03em] sm:text-[15pt]"
          )}
        >
          {item.tag}
        </h3>
        <span
          className={cn(
            "text-[35pt] bottom-[-12pt] md:text-[35pt] md:bottom-[-9pt] lg:text-[50px] lg:bottom-[-1.725vw] xl:text-[56px] xl:bottom-[-0.725vw] font-en relative"
          )}
        >
          {item.figure}
        </span>
      </div>
      <p
        className={cn(
          "whitespace-pre-wrap text-[10pt] leading-[15pt] lg:text-[14px] lg:leading-[27px] xl:text-[19px]",
          isEng
            ? "text-[17px] leading-[20px] xl:leading-[26px]"
            : "text-[14px] leading-[22px] xl:leading-[32px] tracking-[-0.05em]"
        )}
      >
        {isMobile ? item.mobileText : item.text}
      </p>
    </div>
  );
}
