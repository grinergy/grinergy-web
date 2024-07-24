import { cn } from "@/libs/utils";
import { useTranslations } from "next-intl";

import Image, { StaticImageData } from "next/image";
import img1 from "../../public/images/lto1.jpg";
import img2 from "../../public/images/lto2.jpg";
import img3 from "../../public/images/lto3.jpg";
import img4 from "../../public/images/lto4.jpg";
import LtoInfoSectionText from "./LtoInfoSectionText";

export interface LtoInfoItem {
  tag: string;
  figure: string;
  text: string;
  mobileText: string;
  img: StaticImageData;
  icon: string;
}

export default function LtoInfoSection({ isEng }: { isEng: boolean }) {
  const t = useTranslations("Product");
  const ltoInfoList: LtoInfoItem[] = [
    {
      tag: t("info.item1.tag"),
      figure: "400˚c",
      text: t("info.item1.text"),
      mobileText: t("info.item1.mobile-text"),
      img: img1,
      icon: "/images/icon2-1.png",
    },
    {
      tag: t("info.item2.tag"),
      figure: "10c",
      text: t("info.item2.text"),
      mobileText: t("info.item2.mobile-text"),
      img: img2,
      icon: "/images/icon2-2.png",
    },
    {
      tag: t("info.item3.tag"),
      figure: "-35˚c",
      text: t("info.item3.text"),
      mobileText: t("info.item3.mobile-text"),
      img: img3,
      icon: "/images/icon2-3.png",
    },
    {
      tag: t("info.item4.tag"),
      figure: "5-7x",
      text: t("info.item4.text"),
      mobileText: t("info.item4.mobile-text"),
      img: img4,
      icon: "/images/icon2-4.png",
    },
  ];

  return (
    <section className="w-full my-[8vh] lg:w-fit lg:mx-auto lg:my-[17.592vh]">
      <h2
        className={cn(
          "text-[18px] pb-[1vh] mx-auto xl:mx-0 xl:text-[1.4063vw] text-black/95 border-b-[0.75pt] border-black/70 xl:pb-[1rem] whitespace-pre-wrap lg:text-start xl:w-full",
          isEng
            ? "text-start w-[64vw] font-en font-bold"
            : "text-center w-[68vw] font-kr font-medium tracking-[-0.03em]"
        )}
      >
        {t("info.title")}
      </h2>
      {ltoInfoList.map((item, idx) => (
        <div
          className={cn(
            "mx-auto h-auto border-b-[1pt] border-black flex items-center xl:w-[785px] xl:h-[470px] xl:border-b-[0.75pt] xl:border-black/70",
            isEng ? "w-[64vw]" : "w-[68vw]"
          )}
          key={idx}
        >
          <div
            className={cn(
              "w-full flex-col-reverse lg:flex-row py-[5vh] lg:py-[31px] xl:py-[62px] mx-auto h-full flex justify-between items-center xl:m-0"
            )}
          >
            <LtoInfoSectionText isEng={isEng} item={item} />
            <div className="relative max-w-[80%] lg:max-w-[43.3121%] aspect-[340/330] overflow-hidden">
              <Image
                height={330}
                className="w-full h-full object-cover"
                src={item.img}
                alt={`img-${idx}`}
                placeholder="blur"
              />
              <img
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[180%] lg:max-w-[150%] object-contain w-[180%] lg:max-w-[150%]",
                  idx === 3 && "-translate-x-[48%]"
                )}
                src={item.icon}
                alt={`icon-${idx}`}
              />
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
