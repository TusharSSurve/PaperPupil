import { ChildrenProps } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function MaxWidthWrapper({ className, children }: ChildrenProps) {
  return (
    <div className={cn("mx-auto w-full max-w-screen-xl px-2.5 md:px-20", className)}>{children}</div>
  )
}
