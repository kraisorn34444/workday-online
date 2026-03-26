// Work Online — Image Gallery Modal
// สำหรับแสดงภาพขยายด้วย UI ที่สวยงาม

import { useState, useEffect } from "react";
import { WorkImage } from "@/lib/data";
import { X, ChevronLeft, ChevronRight, Image as ImageIcon, Download } from "lucide-react";

interface ImageGalleryProps {
  images: WorkImage[];
  isOpen: boolean;
  onClose: () => void;
  initialIndex?: number;
}

export default function ImageGallery({
  images,
  isOpen,
  onClose,
  initialIndex = 0,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentImage.url;
    link.download = currentImage.filename || "image.jpg";
    link.click();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-card rounded-3xl border border-border shadow-2xl w-full max-w-4xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <ImageIcon size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">
                ภาพ {currentIndex + 1} / {images.length}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">
                {currentImage.filename}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="ดาวน์โหลด"
            >
              <Download size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="ปิด"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Image viewer */}
        <div className="relative bg-gradient-to-b from-black/10 to-black/5 aspect-video flex items-center justify-center overflow-hidden">
          <img
            src={currentImage.url}
            alt={currentImage.filename}
            className="max-w-full max-h-full object-contain"
          />

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 hover:scale-110"
                title="ภาพก่อนหน้า (ลูกศร ซ้าย)"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-all duration-200 hover:scale-110"
                title="ภาพถัดไป (ลูกศร ขวา)"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Keyboard hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/60 bg-black/40 px-3 py-1.5 rounded-full">
            ⌨️ ลูกศร ← → | ESC ปิด
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/40">
          <p className="text-xs text-muted-foreground/70">
            📅 {new Date(currentImage.uploadedAt).toLocaleString("th-TH")}
          </p>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 px-6 py-4 border-t border-border bg-gradient-to-r from-muted/20 to-muted/10 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(idx)}
                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  idx === currentIndex
                    ? "border-primary shadow-lg scale-105"
                    : "border-border/50 hover:border-primary/50 hover:scale-105"
                }`}
              >
                <img
                  src={img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
