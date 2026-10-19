"use client";

import { getUploadUrl } from "@/actions/file.actions";
import Editor from "@/components/admin/Editor";
import {
  FieldError,
  labelCss,
  SubmitButton,
} from "@/components/admin/FormControls";
import useAbortController from "@/hooks/useAbortController";
import { toastUploadError, uploadToR2 } from "@/libs/r2-upload";
import { getErrorMessage } from "@/libs/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { News } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateNews, uploadNews } from "../actions";
import { newsSchema, UpdateNewsDto, updateNewsSchema } from "../schema";

// news가 있으면 수정, 없으면 생성 폼
export default function NewsForm({
  news,
  defaultPreviewImage = "",
}: {
  news?: News;
  defaultPreviewImage?: string;
}) {
  const isUpdate = !!news;
  const [previewImage, setPreviewImage] = useState<string>(defaultPreviewImage);
  const [photo, setPhoto] = useState<File | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileKey, setFileKey] = useState("");
  const abort = useAbortController();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<UpdateNewsDto>({
    resolver: zodResolver(isUpdate ? updateNewsSchema : newsSchema),
  });

  const onImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const {
      target: { files },
    } = event;
    if (!files) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setPreviewImage(url);
    setPhoto(file);
    const [uploadUrl, fileKey] = await getUploadUrl(file.name, file.type);
    setValue("photo", uploadUrl);
    setUploadUrl(uploadUrl);
    setFileKey(fileKey);
  };

  function handleChange(value: string) {
    setValue("contents", value === "<p><br></p>" ? "" : value);
    trigger("contents");
  }

  const onSubmit = async (data: UpdateNewsDto) => {
    if (isLoading) return;

    setIsLoading(true);
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.contents) formData.append("contents", data.contents);
    if (data.url) formData.append("url", data.url);

    if (photo) {
      try {
        await uploadToR2(photo, uploadUrl, abort);
        formData.append("photo", fileKey);
      } catch (error) {
        return toastUploadError(error);
      } finally {
        setIsLoading(false);
      }
    }

    const error = isUpdate
      ? await updateNews(news.id, formData)
      : await uploadNews(formData);

    if (error?.message) {
      toast.error(getErrorMessage(error));
      setIsLoading(false);
      return;
    }

    router.push("/admin/news");
    toast.success(isUpdate ? "뉴스 수정 성공" : "뉴스 생성 성공");
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit((e) => onSubmit(e))}
      className="bg-white roudned-[10px] size-full overflow-hidden flex flex-col justify-center p-[20px] border border-[#ccc] rounded-[20px] gap-[8px]"
    >
      <span className={labelCss}>미리보기 이미지</span>
      <label
        htmlFor="file"
        className="w-full h-[200px] aspect-[240/200] bg-center bg-cover lg:w-[240px] lg:h-auto object-contain flex flex-col justify-center items-center gap-[10px] border-dashed border-[#ccc] border-2 rounded-[10px] text-[#ccc] mx-auto hover:border-black hover:text-black cursor-pointer"
        style={{
          backgroundImage: `url(${previewImage})`,
        }}
      >
        {previewImage === "" && (
          <>
            <svg
              className="w-[2.5rem]"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-kr text-[0.9375rem]">
              커버 이미지
              {[errors.photo?.message ?? ""]}
            </span>
          </>
        )}
      </label>
      <input
        onChange={onImageChange}
        type="file"
        id="file"
        name="file"
        accept="image/*"
        className="hidden"
      />
      <label className={labelCss} htmlFor="title">
        제목
      </label>
      <div>
        <input
          className="w-full p-[10px] border border-[#ccc] font-kr"
          type="text"
          defaultValue={news?.title}
          {...register("title")}
        />
        <FieldError message={errors.title?.message} />
      </div>
      <label className={labelCss} htmlFor="url">
        뉴스 URL
      </label>
      <div>
        <input
          className="w-full p-[10px] border border-[#ccc] font-kr"
          type="text"
          defaultValue={news?.url}
          {...register("url")}
        />
        <FieldError message={errors.url?.message} />
      </div>
      <label className={labelCss} htmlFor="contents">
        내용
      </label>
      <div>
        <Editor onChange={handleChange} defaultValue={news?.contents} />
        <FieldError message={errors.contents?.message} />
      </div>
      <SubmitButton isLoading={isLoading} label={isUpdate ? "수정" : "등록"} />
    </form>
  );
}
