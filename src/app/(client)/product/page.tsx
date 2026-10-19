import BigPhrase from "@/components/common/BigPhrase";
import CircleModel from "@/components/product/CircleModel";
import ComparisonGraph from "@/components/product/ComparisonGraph";
import LtoInfoSection from "@/components/product/LtoInfoSection";
import Paragraph from "@/components/common/Paragraph";
import ProductExSection from "@/components/product/ProductExSection";
import ProductImageSection from "@/components/product/ProductImageSection";
import { cn, getIsEng } from "@/libs/utils";
import { Metadata } from "next";
import Image from "next/image";

import productBanner from "../../../../public/images/product_banner.jpg";

export const metadata: Metadata = {
  title: "Product",
};

export default async function ProductPage() {
  const isEng = await getIsEng();

  return (
    <div className="mb-[2vh] lg:mb-[4.1666vh] overflow-x-hidden">
      <BigPhrase
        at="Product"
        isEng={isEng}
        className={cn(
          "md:leading-[6vw] h-full",
          isEng
            ? "sm:leading-[36px] tracking-[-0.01em]"
            : "sm:leading-[32px] tracking-[-0.065em]"
        )}
      />

      <Image
        className="w-[93%] mx-auto"
        height={1543}
        placeholder="blur"
        src={productBanner}
        alt="product 배너"
      />

      <Paragraph at="Product" idx={1} isEng={isEng} />
      <ComparisonGraph isEng={isEng} />
      <ProductImageSection />
      <Paragraph at="Product" idx={2} isEng={isEng} />
      <CircleModel isEng={isEng} />
      <LtoInfoSection isEng={isEng} />
      <Paragraph
        at="Product"
        idx={3}
        isEng={isEng}
        className="[&_h3]:text-black [&_p]:text-black sm:mb-[5vh] lg:mt-[26.5778vh] lg:mb-[6.9387vh]"
      />
      <ProductExSection />
    </div>
  );
}
