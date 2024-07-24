import Image from "next/image";

import image1 from "../../public/images/product_battery.jpg";
import image2 from "../../public/images/product_leftimg.jpg";
import image3 from "../../public/images/product_rightimg.jpg";
import ProductImageCircle from "./ProductImageCircle";

export default function ProductImageSection() {
  return (
    <section>
      <div className="relative">
        <Image
          className="w-full will-change-auto"
          src={image1}
          alt="image1"
          placeholder="blur"
        />
        <ProductImageCircle />
      </div>
      <div className="mt-[5px] gap-x-[5px] lg:mt-[7px] lg:gap-x-[7px] w-full grid grid-cols-2">
        <Image
          className="w-full apsect-[478 / 458] object-cover h-full"
          src={image2}
          alt="image2"
          placeholder="blur"
        />
        <Image
          className="w-full apsect-[478 / 458] object-cover h-full"
          src={image3}
          alt="image3"
          placeholder="blur"
        />
      </div>
    </section>
  );
}
