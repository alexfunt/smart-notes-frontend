import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[88px] w-full rounded-md border border-input bg-card/50 px-3 py-2 text-sm placeholder:text-muted-foreground transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
      "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
