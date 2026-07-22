"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Check, CheckCheck, Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownEditor } from "@/components/feedback/markdown-editor";
import { FeedbackStatusBadge } from "@/components/feedback/feedback-status-badge";
import { FeedbackMarkdown } from "@/components/feedback/feedback-markdown";
import type { AdminFeedbackItem } from "@/lib/feedback/list-feedback";

function displayId(seq: number): string {
  return `#${String(seq).padStart(4, "0")}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminDashboard({ items }: { items: AdminFeedbackItem[] }) {
  const t = useTranslations("feedback");
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailItem, setDetailItem] = useState<AdminFeedbackItem | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [batchBusy, setBatchBusy] = useState(false);
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  function openDetail(item: AdminFeedbackItem) {
    setReason("");
    setDetailItem(item);
  }

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleAction(id: string, action: "accept" | "reject" | "done", actionReason?: string) {
    if (action === "reject" && !actionReason?.trim()) {
      toast.error("拒絕意見回饋時必須填寫理由");
      return;
    }
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: actionReason }),
      });
      if (!response.ok) {
        toast.error("操作失敗，請重新整理後再試一次");
        return;
      }
      toast.success("已更新狀態");
      setDetailItem(null);
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  async function handleBatchAccept() {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setBatchBusy(true);
    try {
      const response = await fetch("/api/admin/feedback/batch-accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) {
        toast.error("批次接受失敗");
        return;
      }
      const data = (await response.json()) as { updated: number };
      toast.success(`已接受 ${data.updated} 則意見回饋`);
      setSelectedIds(new Set());
      router.refresh();
    } finally {
      setBatchBusy(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const selectableCount = items.filter((item) => item.status === "published").length;

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">意見回饋管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">共 {items.length} 則意見回饋</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-1.5">
          <LogOut className="size-4" />
          登出
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          已選取 {selectedIds.size} / {selectableCount} 則可接受的意見回饋
        </p>
        <Button
          size="sm"
          disabled={selectedIds.size === 0 || batchBusy}
          onClick={handleBatchAccept}
          className="gap-1.5"
        >
          {batchBusy ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
          批次接受
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="w-10 px-4 py-2" />
              <th className="px-4 py-2 font-medium">{t("table.id")}</th>
              <th className="px-4 py-2 font-medium">{t("table.title")}</th>
              <th className="px-4 py-2 font-medium">{t("table.status")}</th>
              <th className="px-4 py-2 font-medium">提交者</th>
              <th className="px-4 py-2 font-medium">分類</th>
              <th className="px-4 py-2 font-medium">提交時間</th>
              <th className="w-24 px-4 py-2 font-medium">快速操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    disabled={item.status !== "published"}
                    onCheckedChange={(checked: boolean | "indeterminate") =>
                      toggleSelected(item.id, checked === true)
                    }
                    aria-label="選取此意見回饋"
                  />
                </td>
                <td
                  className="cursor-pointer px-4 py-3 font-mono text-xs text-muted-foreground"
                  onClick={() => openDetail(item)}
                >
                  {displayId(item.seq)}
                </td>
                <td className="cursor-pointer px-4 py-3" onClick={() => openDetail(item)}>
                  {item.title}
                </td>
                <td className="px-4 py-3">
                  <FeedbackStatusBadge status={item.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <div>{item.name ?? t("anonymous")}</div>
                  <div className="text-xs">{item.email}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{t(`category.${item.category}`)}</td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {item.status === "published" ? (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={busyId === item.id}
                        onClick={() => handleAction(item.id, "accept")}
                        aria-label="接受"
                        title="接受"
                      >
                        <Check className="size-4" />
                      </Button>
                    ) : null}
                    {item.status === "in_progress" ? (
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={busyId === item.id}
                        onClick={() => handleAction(item.id, "done")}
                        aria-label="改好了"
                        title="改好了"
                      >
                        <CheckCheck className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  {t("boardEmpty")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <Dialog open={detailItem !== null} onOpenChange={(open: boolean) => !open && setDetailItem(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {detailItem ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-normal text-muted-foreground">
                    {displayId(detailItem.seq)}
                  </span>
                  {detailItem.title}
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-wrap items-center gap-2">
                <FeedbackStatusBadge status={detailItem.status} />
                <span className="text-xs text-muted-foreground">
                  {detailItem.name ?? t("anonymous")} · {detailItem.email}
                </span>
              </div>

              <FeedbackMarkdown>{detailItem.message}</FeedbackMarkdown>

              {detailItem.adminReason ? (
                <div className="mt-2 rounded-lg bg-muted/40 p-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {t("rejectionReason")}
                  </p>
                  <FeedbackMarkdown>{detailItem.adminReason}</FeedbackMarkdown>
                </div>
              ) : null}

              {detailItem.status === "published" ? (
                <div className="mt-2 flex flex-col gap-2">
                  <MarkdownEditor
                    textareaRef={reasonRef}
                    value={reason}
                    onChange={setReason}
                    placeholder="理由（接受可留空，拒絕必填）"
                    minHeightClassName="min-h-36"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="lg"
                      className="flex-1 gap-1.5"
                      disabled={busyId === detailItem.id}
                      onClick={() => handleAction(detailItem.id, "accept", reason)}
                    >
                      {busyId === detailItem.id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Check className="size-4" />
                      )}
                      接受
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
                      className="flex-1"
                      disabled={busyId === detailItem.id}
                      onClick={() => handleAction(detailItem.id, "reject", reason)}
                    >
                      拒絕
                    </Button>
                  </div>
                </div>
              ) : null}

              {detailItem.status === "in_progress" ? (
                <Button
                  size="lg"
                  className="mt-2 gap-1.5"
                  disabled={busyId === detailItem.id}
                  onClick={() => handleAction(detailItem.id, "done")}
                >
                  {busyId === detailItem.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCheck className="size-4" />
                  )}
                  標記為已完成
                </Button>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
