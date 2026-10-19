import FileUploadException from "@/exceptions/FileUploadException";
import GlobalException from "@/exceptions/GlobalException";
import toast from "react-hot-toast";

// getUploadUrl로 받은 presigned URL에 브라우저에서 바로 파일을 올린다
// 파일마다 업로드를 시작한 시점부터 60초가 지나면 중단한다
export async function uploadToR2(file: File, uploadUrl: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 60000);

  let response: Response;
  try {
    response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: Buffer.from(await file.arrayBuffer()),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    throw new FileUploadException("파일 업로드 실패");
  }
}

export function toastUploadError(error: unknown) {
  console.error(error);
  if (error instanceof DOMException && error.name === "AbortError") {
    return toast.error("시간 초과: 파일의 용량이 너무 큽니다.");
  }
  return toast.error((error as GlobalException).message);
}
