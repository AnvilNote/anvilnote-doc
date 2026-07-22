"use client";

import { useState, type KeyboardEvent, type RefObject } from "react";
import { useTranslations } from "next-intl";
import { Columns2, Eye, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownToolbar } from "@/components/feedback/markdown-toolbar";
import { FeedbackMarkdown } from "@/components/feedback/feedback-markdown";
import { prefixLines } from "@/lib/feedback/markdown-commands";
import { applyTextareaValue } from "@/lib/feedback/apply-textarea-value";

export type MarkdownEditorMode = "edit" | "split" | "preview";

export function MarkdownEditor({
  id,
  textareaRef,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  maxLength,
  onRequestImage,
  minHeightClassName = "min-h-40",
  mode: controlledMode,
  onModeChange,
}: {
  id?: string;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  onRequestImage?: () => void;
  minHeightClassName?: string;
  mode?: MarkdownEditorMode;
  onModeChange?: (mode: MarkdownEditorMode) => void;
}) {
  const t = useTranslations("feedback.toolbar");
  const [internalMode, setInternalMode] = useState<MarkdownEditorMode>("split");
  const mode = controlledMode ?? internalMode;
  function setMode(next: MarkdownEditorMode) {
    setInternalMode(next);
    onModeChange?.(next);
  }

  // Tab indents the current line (or every line in a multi-line selection)
  // instead of moving focus out of the textarea — useful for nesting list
  // content. Shift+Tab is left as the browser default (focus backwards).
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Tab" || event.shiftKey) return;
    event.preventDefault();
    const textarea = event.currentTarget;
    const result = prefixLines(
      { value, start: textarea.selectionStart, end: textarea.selectionEnd },
      "  "
    );
    const applied = applyTextareaValue(
      textarea,
      result.value,
      result.selectionStart,
      result.selectionEnd
    );
    if (!applied) {
      onChange(result.value);
      requestAnimationFrame(() => {
        textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
      });
    }
  }

  const modeToggle = (
    <>
      <Button
        type="button"
        variant={mode === "edit" ? "secondary" : "ghost"}
        size="icon-sm"
        title={t("modeEdit")}
        aria-label={t("modeEdit")}
        onClick={() => setMode("edit")}
      >
        <Pencil className="size-4" />
      </Button>
      <Button
        type="button"
        variant={mode === "split" ? "secondary" : "ghost"}
        size="icon-sm"
        title={t("modeSplit")}
        aria-label={t("modeSplit")}
        onClick={() => setMode("split")}
      >
        <Columns2 className="size-4" />
      </Button>
      <Button
        type="button"
        variant={mode === "preview" ? "secondary" : "ghost"}
        size="icon-sm"
        title={t("modePreview")}
        aria-label={t("modePreview")}
        onClick={() => setMode("preview")}
      >
        <Eye className="size-4" />
      </Button>
    </>
  );

  return (
    <div className="overflow-hidden rounded-lg border border-input">
      <MarkdownToolbar
        textareaRef={textareaRef}
        value={value}
        onChange={onChange}
        onRequestImage={onRequestImage}
        disabled={mode === "preview"}
        endSlot={modeToggle}
      />
      <div className={mode === "split" ? "grid grid-cols-2" : ""}>
        {mode !== "preview" ? (
          <div className={mode === "split" ? "border-r border-input" : ""}>
            <Textarea
              id={id}
              ref={textareaRef}
              required={required}
              minLength={minLength}
              maxLength={maxLength}
              placeholder={placeholder}
              value={value}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={handleKeyDown}
              className={`${minHeightClassName} resize-none rounded-none border-0 shadow-none focus-visible:ring-0`}
            />
          </div>
        ) : null}
        {mode !== "edit" ? (
          <div className={`${minHeightClassName} overflow-y-auto px-3 py-2`}>
            {value.trim() ? (
              <FeedbackMarkdown>{value}</FeedbackMarkdown>
            ) : (
              <p className="text-sm text-muted-foreground">{t("previewEmpty")}</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
