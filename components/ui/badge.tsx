import { cn } from "@/lib/utils";

export function Badge({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { style?: React.CSSProperties }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      style={style}
      {...props}
    />
  );
}
