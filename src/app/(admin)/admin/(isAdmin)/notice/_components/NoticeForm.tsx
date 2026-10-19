"use client";

import { getUploadUrl } from "@/actions/file.actions";
import Editor from "@/components/admin/Editor";
import {
  FieldError,
  labelCss,
  SubmitButton,
} from "@/components/admin/FormControls";
import useAbortController from "@/hooks/useAbortController";
import { toastUploadError, UploadFileData, uploadToR2 } from "@/libs/r2-upload";
import { getErrorMessage } from "@/libs/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment-timezone";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateNotice, uploadNotice } from "../actions";
import { noticeSchema, UpdateNoticeDto, updateNoticeSchema } from "../schema";

export interface NoticeDetail {
  files: {
    id: string;
    fileName: string;
    fileKey: string;
    noticeId: string;
  }[];
  title: string;
  contents: string;
  createdAt: string;
}

// notice가 있으면 수정, 없으면 생성 폼
export default function NoticeForm({
  noticeId,
  notice,
}: {
  noticeId?: string;
  notice?: NoticeDetail;
}) {
  const isUpdate = !!notice;
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploadFilesData, setUploadFilesData] = useState<UploadFileData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const abort = useAbortController();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<UpdateNoticeDto>({
    resolver: zodResolver(isUpdate ? updateNoticeSchema : noticeSchema),
    defaultValues: isUpdate ? { deletedFiles: [] } : undefined,
  });

  function handleChange(value: string) {
    setValue("contents", value === "<p><br></p>" ? "" : value);
    trigger("contents");
  }

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const {
      target: { files },
    } = event;
    if (!files) return;
    setUploadFiles(files);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const [uploadUrl, fileKey] = await getUploadUrl(file.name, file.type);
      setUploadFilesData((prev) => [...prev, { uploadUrl, fileKey }]);
    }
  }

  const onSubmit = async (data: UpdateNoticeDto) => {
    if (isLoading) return;

    setIsLoading(true);
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.contents) formData.append("contents", data.contents);
    // UI에서 선택한 KST 값을 UTC로 변환 후 저장
    if (data.createdAt)
      formData.append("createdAt", new Date(data.createdAt).toISOString());

    if (data.deletedFiles) {
      data.deletedFiles.forEach((deletedFileKey) =>
        formData.append("deletedFiles", deletedFileKey)
      );
    }

    if (uploadFiles) {
      try {
        for (let i = 0; i < uploadFiles.length; i++) {
          await uploadToR2(uploadFiles[i], uploadFilesData[i].uploadUrl, abort);
          formData.append("files", uploadFilesData[i].fileKey);
        }
      } catch (error) {
        return toastUploadError(error);
      } finally {
        setIsLoading(false);
      }
    }

    const error = isUpdate
      ? await updateNotice(noticeId!, formData)
      : await uploadNotice(formData);

    if (error?.message) {
      toast.error(getErrorMessage(error));
      setIsLoading(false);
      return;
    }

    router.push("/admin/notice");
    toast.success(isUpdate ? "공지사항 수정 성공" : "공지사항 생성 성공");
    setIsLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit((e) => onSubmit(e))}
      className="bg-white roudned-[10px] size-full overflow-hidden flex flex-col justify-center p-[20px] border border-[#ccc] rounded-[20px] gap-[10px]"
    >
      <label className={labelCss} htmlFor="title">
        제목
      </label>
      <div>
        <input
          className="w-full p-[10px] mb-[10px] border border-[#ccc] font-kr"
          type="text"
          defaultValue={notice?.title}
          {...register("title")}
        />
        <FieldError message={errors.title?.message} />
      </div>
      <label className={labelCss} htmlFor="contents">
        내용
      </label>
      <div className="mb-[20px]">
        <Editor onChange={handleChange} defaultValue={notice?.contents} />
        <FieldError message={errors.contents?.message} />
      </div>
      {isUpdate && (
        <>
          <label className={labelCss} htmlFor="createdAt">
            게시글 작성일
          </label>
          <div>
            <input
              className="w-full p-[10px] mb-[10px] border border-[#ccc] font-kr"
              type="datetime-local"
              defaultValue={moment(notice.createdAt)
                .tz("Asia/Seoul")
                .format("YYYY-MM-DDTHH:MM")}
              {...register("createdAt")}
            />
            <FieldError message={errors.createdAt?.message} />
          </div>
        </>
      )}
      <label className={labelCss} htmlFor="file">
        첨부파일
      </label>
      <input
        className="w-full p-[10px] mb-0 border-none font-kr bg-[#f5f5f5] py-[10px] px-[20px]"
        type="file"
        onChange={onFileChange}
        multiple
      />
      {notice && notice.files.length > 0 && (
        <ul className="text-[10px] px-[20px] py-[5px] gap-[3px] lg:text-[0.75rem] lg:py-[20px] lg:gap-[5px] bg-[#f7f7f7] text-black/60 flex flex-col -mt-[10px]">
          {notice.files.map((file) => (
            <li
              key={file.id}
              className="w-full xl:max-w-[250px] flex text-[0.75rem] justify-between"
            >
              <span>
                {file.fileName.length > 20
                  ? file.fileName.substring(0, 10) +
                    "..." +
                    file.fileName.substring(file.fileName.length - 10)
                  : file.fileName}
              </span>
              <div className="flex items-center gap-1">
                <input
                  type="checkbox"
                  id={file.id}
                  {...register("deletedFiles")}
                  value={file.fileKey}
                />
                <label htmlFor={file.id}>삭제</label>
              </div>
            </li>
          ))}
        </ul>
      )}
      <SubmitButton isLoading={isLoading} label={isUpdate ? "수정" : "등록"} />
    </form>
  );
}
