"use client";

import { getR2ImagePath } from "@/actions/file.actions";
import { getErrorMessage } from "@/libs/utils";
import { News } from "@prisma/client";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import NewsForm from "../../_components/NewsForm";

export default function UpdateNewsPage(props: {
  params: Promise<{ newsId: string }>;
}) {
  const { newsId } = use(props.params);

  const router = useRouter();
  const [news, setNews] = useState<News | null>(null);
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/news/${newsId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data);
        }

        if (data.photo) setPreviewImage(await getR2ImagePath(data.photo));
        setNews(data as News);
      } catch (error) {
        toast.error(getErrorMessage(error));
        router.push("/admin/news");
      }
    };

    fetchData();
  }, []);

  if (!news) return <div>Loading...</div>;

  return <NewsForm news={news} defaultPreviewImage={previewImage} />;
}
