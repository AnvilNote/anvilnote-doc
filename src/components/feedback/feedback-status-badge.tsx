import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import type { FeedbackStatus } from "@/lib/feedback/schema";

const STATUS_STYLES: Record<FeedbackStatus, string> = {
  published: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  in_progress: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  rejected: "bg-red-500/10 text-red-600 dark:text-red-400",
  done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

export function FeedbackStatusBadge({ status }: { status: FeedbackStatus }) {
  const t = useTranslations("feedback.status");
  return <Badge className={STATUS_STYLES[status]}>{t(status)}</Badge>;
}
