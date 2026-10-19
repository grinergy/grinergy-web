"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import NoticeForm, { NoticeDetail } from "../../_components/NoticeForm";

export default function UpdateNoticePage(props: {
  params: Promise<{ noticeId: string }>;
}) {
  const { noticeId } = use(props.params);

  const router = useRouter();
  const [notice, setNotice] = useState<NoticeDetail | null>(null);

  useEffect(() => {
    // 주어진 noticeId에 해당하는 notice가 없다면 리다이렉트
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/notice/${noticeId}`);
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data);
        }

        setNotice(data as NoticeDetail);
      } catch (error: any) {
        toast.error(error.message);
        router.push("/admin/notice");
      }
    };

    fetchData();
  }, []);

  if (!notice) return <div>Loading...</div>;

  return <NoticeForm noticeId={noticeId} notice={notice} />;
}
