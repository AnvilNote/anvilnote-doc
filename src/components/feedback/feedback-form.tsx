"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FEEDBACK_CATEGORIES,
  TITLE_MAX_LENGTH,
  type FeedbackCategory,
} from "@/lib/feedback/schema";
import { MAX_IMAGES, MAX_IMAGE_BYTES } from "@/lib/feedback/image-limits";
import { insertImage } from "@/lib/feedback/markdown-commands";
import { applyTextareaValue } from "@/lib/feedback/apply-textarea-value";
import { MarkdownEditor, type MarkdownEditorMode } from "@/components/feedback/markdown-editor";
import { ImageCropDialog } from "@/components/feedback/image-crop-dialog";
import { supabaseBrowser } from "@/lib/feedback/supabase-browser";

export function FeedbackForm({ onSuccess }: { onSuccess?: () => void }) {
  const t = useTranslations("feedback");
  const locale = useLocale();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [message, setMessage] = useState("");
  // Honeypot: real people never see or fill this field (hidden below).
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [imageCount, setImageCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<MarkdownEditorMode>("split");
  const pendingFileRef = useRef<File | null>(null);

  function handleImageButtonClick() {
    if (imageCount >= MAX_IMAGES) {
      toast.error(t("tooManyImages"));
      return;
    }
    fileInputRef.current?.click();
  }

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(t("imageTooLarge"));
      return;
    }
    pendingFileRef.current = file;
    setCropSrc(URL.createObjectURL(file));
  }

  function closeCropDialog() {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    pendingFileRef.current = null;
  }

  async function handleCropApply(blob: Blob) {
    closeCropDialog();
    if (blob.size > MAX_IMAGE_BYTES) {
      toast.error(t("imageTooLarge"));
      return;
    }
    setUploading(true);
    try {
      const urlResponse = await fetch("/api/feedback/upload-url", { method: "POST" });
      if (!urlResponse.ok) throw new Error("upload_url_failed");
      const { path, token, publicUrl } = (await urlResponse.json()) as {
        path: string;
        token: string;
        publicUrl: string;
      };

      const { error } = await supabaseBrowser()
        .storage.from("feedback-images")
        .uploadToSignedUrl(path, token, blob, { contentType: "image/png" });
      if (error) throw error;

      const textarea = textareaRef.current;
      const pos = textarea?.selectionStart ?? message.length;
      const result = insertImage({ value: message, start: pos, end: pos }, publicUrl, "screenshot");
      const applied =
        textarea && applyTextareaValue(textarea, result.value, result.selectionStart, result.selectionEnd);
      if (!applied) {
        setMessage(result.value);
      }
      setImageCount((count) => count + 1);
      // Switch to split view so the just-uploaded image is visibly confirmed
      // (fetched straight from the bucket), instead of only showing raw markdown.
      setEditorMode("split");
    } catch {
      toast.error(t("uploadError"));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, title, category, message, locale, company }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        toast.error(body?.error === "rate_limited" ? t("errorRateLimited") : t("errorGeneric"));
        return;
      }
      setSubmitted(true);
      onSuccess?.();
    } catch {
      toast.error(t("errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle2 className="size-10 text-foreground" />
        <div className="space-y-1.5">
          <p className="text-lg font-semibold tracking-[-0.02em]">{t("successTitle")}</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
            {t("successMessage")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-email">{t("emailLabel")}</Label>
        <Input
          id="feedback-email"
          type="email"
          required
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-name">{t("nameLabel")}</Label>
        <Input
          id="feedback-name"
          type="text"
          autoComplete="nickname"
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="feedback-title">{t("titleLabel")}</Label>
          <span className="text-xs text-muted-foreground">
            {title.length}/{TITLE_MAX_LENGTH}
          </span>
        </div>
        <Input
          id="feedback-title"
          type="text"
          required
          maxLength={TITLE_MAX_LENGTH}
          placeholder={t("titlePlaceholder")}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-category">{t("categoryLabel")}</Label>
        <Select value={category} onValueChange={(value: string) => setCategory(value as FeedbackCategory)}>
          <SelectTrigger id="feedback-category" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            {FEEDBACK_CATEGORIES.map((value) => (
              <SelectItem key={value} value={value}>
                {t(`category.${value}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="feedback-message">{t("messageLabel")}</Label>
        <MarkdownEditor
          id="feedback-message"
          textareaRef={textareaRef}
          value={message}
          onChange={setMessage}
          onRequestImage={handleImageButtonClick}
          required
          minLength={5}
          maxLength={2000}
          placeholder={t("messagePlaceholder")}
          minHeightClassName="min-h-72"
          mode={editorMode}
          onModeChange={setEditorMode}
        />
        <p className="text-xs text-muted-foreground">
          {t("imageHint", { max: MAX_IMAGES })} {uploading ? t("uploading") : null}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor="feedback-company">Company</label>
        <input
          id="feedback-company"
          name="company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
      </div>

      <Button type="submit" disabled={submitting} className="gap-2">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {submitting ? t("submitting") : t("submit")}
      </Button>

      {cropSrc ? (
        <ImageCropDialog
          src={cropSrc}
          open
          onOpenChange={(open) => {
            if (!open) closeCropDialog();
          }}
          onApply={handleCropApply}
        />
      ) : null}
    </form>
  );
}
