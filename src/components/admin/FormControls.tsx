import { cn } from "@/libs/utils";

export const labelCss = "text-[0.8rem] lg:text-[0.9375rem] font-kr";

export function FieldError({ message }: { message?: string }) {
  return (
    <span className="text-red-500 font-medium font-kr text-sm">
      {[message ?? ""]}
    </span>
  );
}

export function SubmitButton({
  isLoading,
  label,
}: {
  isLoading: boolean;
  label: string;
}) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className={cn(
        "text-[0.8rem] lg:text-[1rem] bg-black/80 text-white py-[0.5rem] px-[1rem] border border-black w-fit mx-auto rounded-[10px] hover:bg-white hover:text-black transition-all duration-300",
        isLoading && "bg-black/30 border-none"
      )}
    >
      {isLoading ? `${label} 중..` : label}
    </button>
  );
}
