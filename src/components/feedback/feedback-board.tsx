"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/lib/i18n/navigation";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FeedbackForm } from "@/components/feedback/feedback-form";
import { FeedbackStatusBadge } from "@/components/feedback/feedback-status-badge";
import { FeedbackMarkdown } from "@/components/feedback/feedback-markdown";
import { FEEDBACK_CATEGORIES, type FeedbackCategory, type FeedbackStatus } from "@/lib/feedback/schema";
import type { FeedbackItem } from "@/lib/feedback/list-feedback";

const PAGE_SIZES = [10, 20, 50] as const;
// Rejected items never appear on the public board, so they're not a filter option.
const PUBLIC_STATUSES = ["published", "in_progress", "done"] as const;

function displayId(seq: number): string {
  return `#${String(seq).padStart(4, "0")}`;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
  const result: (number | "ellipsis")[] = [];
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) result.push("ellipsis");
    result.push(page);
  });
  return result;
}

export function FeedbackBoard({ items }: { items: FeedbackItem[] }) {
  const t = useTranslations("feedback");
  const tStatus = useTranslations("feedback.status");
  const tCategory = useTranslations("feedback.category");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<FeedbackItem | null>(null);
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | "all">("all");

  // Supports deep links from emails (?id=<seq>) straight to a feedback item.
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (!idParam) return;
    const seq = Number(idParam);
    const match = items.find((item) => item.seq === seq);
    if (match) setSelected(match);
  }, [searchParams, items]);

  const filteredItems = useMemo(() => {
    const filtered = items.filter(
      (item) =>
        (statusFilter === "all" || item.status === statusFilter) &&
        (categoryFilter === "all" || item.category === categoryFilter)
    );
    return filtered.sort((a, b) => (sortOrder === "asc" ? a.seq - b.seq : b.seq - a.seq));
  }, [items, statusFilter, categoryFilter, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageItems = useMemo(
    () => filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredItems, currentPage, pageSize]
  );
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <>
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em]">{t("boardTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("boardDescription")}</p>
        </div>
        <Button
          size="lg"
          onClick={() => setFormOpen(true)}
          className="gap-1.5 rounded-full"
        >
          <Plus className="size-4" />
          {t("newFeedback")}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t("table.status")}</span>
          <Select
            value={statusFilter}
            onValueChange={(value: string) => {
              setStatusFilter(value as FeedbackStatus | "all");
              setPage(1);
            }}
          >
            <SelectTrigger size="sm" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="all">{t("filterAll")}</SelectItem>
              {PUBLIC_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {tStatus(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{t("table.category")}</span>
          <Select
            value={categoryFilter}
            onValueChange={(value: string) => {
              setCategoryFilter(value as FeedbackCategory | "all");
              setPage(1);
            }}
          >
            <SelectTrigger size="sm" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="all">{t("filterAll")}</SelectItem>
              {FEEDBACK_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {tCategory(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium whitespace-nowrap">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 hover:text-foreground"
                  onClick={() => {
                    setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
                    setPage(1);
                  }}
                >
                  {t("table.id")}
                  {sortOrder === "asc" ? (
                    <ArrowUp className="size-3" />
                  ) : (
                    <ArrowDown className="size-3" />
                  )}
                </button>
              </th>
              <th className="px-4 py-2 font-medium whitespace-nowrap">{t("table.title")}</th>
              <th className="px-4 py-2 font-medium whitespace-nowrap">{t("table.category")}</th>
              <th className="px-4 py-2 font-medium whitespace-nowrap">{t("table.status")}</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((item) => (
              <tr
                key={item.id}
                tabIndex={0}
                role="button"
                className="cursor-pointer border-t border-border hover:bg-muted/30"
                onClick={() => setSelected(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") setSelected(item);
                }}
              >
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {displayId(item.seq)}
                </td>
                <td className="px-4 py-3">{item.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{tCategory(item.category)}</td>
                <td className="px-4 py-3">
                  <FeedbackStatusBadge status={item.status} />
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  {t("boardEmpty")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {filteredItems.length > 0 ? (
        <div className="mt-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("rowsPerPage")}</span>
            <Select
              value={String(pageSize)}
              onValueChange={(value: string) => {
                setPageSize(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger size="sm" className="w-18">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={4}>
                {PAGE_SIZES.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {totalPages > 1 ? (
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    aria-disabled={currentPage === 1}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : undefined}
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                  />
                </PaginationItem>
                {pageNumbers.map((entry, index) =>
                  entry === "ellipsis" ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={entry}>
                      <PaginationLink
                        href="#"
                        isActive={entry === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          setPage(entry);
                        }}
                      >
                        {entry}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    aria-disabled={currentPage === totalPages}
                    className={
                      currentPage === totalPages ? "pointer-events-none opacity-50" : undefined
                    }
                    onClick={(event) => {
                      event.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : null}
        </div>
      ) : null}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <FeedbackForm
            onSuccess={() => {
              setPage(1);
              router.refresh();
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={selected !== null}
        onOpenChange={(open: boolean) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-normal text-muted-foreground">
                    {displayId(selected.seq)}
                  </span>
                  {selected.title}
                </DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <FeedbackStatusBadge status={selected.status} />
                <span className="text-xs text-muted-foreground">
                  {selected.name ?? t("anonymous")}
                </span>
              </div>
              <FeedbackMarkdown>{selected.message}</FeedbackMarkdown>
              {selected.status === "rejected" && selected.adminReason ? (
                <div className="mt-2 rounded-lg bg-muted/40 p-3">
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    {t("rejectionReason")}
                  </p>
                  <FeedbackMarkdown>{selected.adminReason}</FeedbackMarkdown>
                </div>
              ) : null}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
