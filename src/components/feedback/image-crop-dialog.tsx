"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  cropToCanvas,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ZoomIn } from "lucide-react";

const MIN_CROP_SIZE = 10;
const MAX_CROP_SIZE = 100;
const DEFAULT_CROP_SIZE = 90;

// A centered selection at the given percentage of the image, keeping the
// image's own aspect ratio (the user can still drag corners freely from there).
function sizedCrop(sizePercent: number, width: number, height: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: sizePercent }, width / height, width, height),
    width,
    height,
  );
}

export function ImageCropDialog({
  src,
  open,
  onOpenChange,
  onApply,
}: {
  src: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (blob: Blob) => void;
}) {
  const t = useTranslations("feedback");
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [cropSize, setCropSize] = useState(DEFAULT_CROP_SIZE);

  function handleCropSizeChange(size: number) {
    setCropSize(size);
    const image = imgRef.current;
    if (!image) return;
    const { naturalWidth, naturalHeight } = image;
    const next = sizedCrop(size, naturalWidth, naturalHeight);
    setCrop(next);
    setCompletedCrop(convertToPixelCrop(next, naturalWidth, naturalHeight));
  }

  function handleApply() {
    const image = imgRef.current;
    if (!image || !completedCrop || !completedCrop.width || !completedCrop.height) return;
    const canvas = document.createElement("canvas");
    void cropToCanvas(image, canvas, completedCrop).then(() => {
      canvas.toBlob((blob) => {
        if (blob) onApply(blob);
      }, "image/png");
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("cropTitle")}</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[70vh] items-center justify-center overflow-auto rounded-lg border border-input bg-muted/30 p-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={src}
              alt=""
              onLoad={(event) => {
                const { naturalWidth, naturalHeight } = event.currentTarget;
                const initial = sizedCrop(cropSize, naturalWidth, naturalHeight);
                setCrop(initial);
                // ReactCrop's onComplete/onChange only fire from the
                // component's own pointer handling, never just because the
                // controlled `crop` prop changed programmatically — without
                // this, opening the dialog and clicking Insert immediately
                // (without first nudging the visible default selection)
                // left completedCrop unset and did nothing.
                setCompletedCrop(convertToPixelCrop(initial, naturalWidth, naturalHeight));
              }}
              style={{ maxHeight: "62vh", maxWidth: "100%" }}
              className="rounded-md shadow-sm"
            />
          </ReactCrop>
        </div>

        <div className="flex items-center gap-3 px-1">
          <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
          <Slider
            value={[cropSize]}
            min={MIN_CROP_SIZE}
            max={MAX_CROP_SIZE}
            step={1}
            onValueChange={([value]: number[]) => handleCropSizeChange(value)}
            aria-label={t("cropZoom")}
          />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            {t("cropCancel")}
          </Button>
          <Button onClick={handleApply} disabled={!completedCrop?.width}>
            {t("cropApply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
