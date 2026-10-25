import { cn } from "@/lib/utils";
import { STATUS_LABEL, type Status } from "@/lib/appointments";

export const STATUS_CLASS: Record<Status, string> = {
  booked: "bg-status-booked-soft text-status-booked border-status-booked/30",
  done: "bg-status-done-soft text-status-done border-status-done/30",
  no_show: "bg-status-noshow-soft text-status-noshow border-status-noshow/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        STATUS_CLASS[status],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}
