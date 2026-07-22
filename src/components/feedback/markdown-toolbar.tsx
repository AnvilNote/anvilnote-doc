"use client";

import type { ReactNode, RefObject } from "react";
import { useTranslations } from "next-intl";
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  insertLink,
  prefixLines,
  wrapInline,
  type EditorCommand,
  type EditorSelection,
} from "@/lib/feedback/markdown-commands";
import { applyTextareaValue } from "@/lib/feedback/apply-textarea-value";

export function MarkdownToolbar({
  textareaRef,
  value,
  onChange,
  onRequestImage,
  disabled = false,
  endSlot,
}: {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  onRequestImage?: () => void;
  disabled?: boolean;
  endSlot?: ReactNode;
}) {
  const t = useTranslations("feedback.toolbar");

  function apply(command: (sel: EditorSelection) => EditorCommand) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const result = command({
      value,
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    });
    const applied = applyTextareaValue(
      textarea,
      result.value,
      result.selectionStart,
      result.selectionEnd
    );
    if (!applied) {
      onChange(result.value);
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
      });
    }
  }

  const buttons = [
    { Icon: Heading1, label: t("heading1"), onClick: () => apply((sel) => prefixLines(sel, "# ")) },
    { Icon: Heading2, label: t("heading2"), onClick: () => apply((sel) => prefixLines(sel, "## ")) },
    { Icon: Heading3, label: t("heading3"), onClick: () => apply((sel) => prefixLines(sel, "### ")) },
    { Icon: Bold, label: t("bold"), onClick: () => apply((sel) => wrapInline(sel, "**", "bold text")) },
    { Icon: Italic, label: t("italic"), onClick: () => apply((sel) => wrapInline(sel, "*", "italic text")) },
    {
      Icon: Strikethrough,
      label: t("strikethrough"),
      onClick: () => apply((sel) => wrapInline(sel, "~~", "strikethrough text")),
    },
    { Icon: Link2, label: t("link"), onClick: () => apply((sel) => insertLink(sel, "url")) },
    { Icon: List, label: t("bulletList"), onClick: () => apply((sel) => prefixLines(sel, "- ")) },
    { Icon: ListOrdered, label: t("orderedList"), onClick: () => apply((sel) => prefixLines(sel, "1. ")) },
  ];

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/40 p-1">
      {buttons.map(({ Icon, label, onClick }) => (
        <Button
          key={label}
          type="button"
          variant="ghost"
          size="icon-sm"
          title={label}
          aria-label={label}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onClick}
        >
          <Icon className="size-4" />
        </Button>
      ))}
      {onRequestImage ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          title={t("image")}
          aria-label={t("image")}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={onRequestImage}
        >
          <ImagePlus className="size-4" />
        </Button>
      ) : null}
      {endSlot ? <div className="ml-auto flex items-center gap-0.5">{endSlot}</div> : null}
    </div>
  );
}
