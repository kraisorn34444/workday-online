// WorkDay Online 2026 — Image Uploader Component
// สำหรับอัปโหลดและแสดงตัวอย่างภาพ

import { useState, useRef } from "react";
import { WorkImage } from "@/lib/data";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  images: WorkImage[];
  onImagesChange: (images: WorkImage[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onImagesChange, maxImages = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    if (images.length + files.length > maxImages) {
      toast.error(`สามารถแนบได้สูงสุด ${maxImages} ภาพ`);
      return;
    }

    setUploading(true);
    const newImages: WorkImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error(`${file.name} ไม่ใช่ไฟล์ภาพ`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} ขนาดใหญ่เกินไป (สูงสุด 5MB)`);
          continue;
        }

        // Create local preview URL
        const url = URL.createObjectURL(file);
        const image: WorkImage = {
          id: `${Date.now()}-${i}`,
          url,
          filename: file.name,
          uploadedAt: new Date().toISOString(),
        };

        newImages.push(image);
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
        toast.success(`เพิ่มภาพ ${newImages.length} รูป`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    onImagesChange(updatedImages);
    toast.success("ลบภาพสำเร็จ");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          ภาพประกอบ
          <span className="text-xs text-muted-foreground ml-2">
            ({images.length}/{maxImages})
          </span>
        </label>
      </div>

      {/* Upload area */}
      {images.length < maxImages && (
        <div
          className="relative border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-2">
            <Upload size={24} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                {uploading ? "กำลังอัปโหลด..." : "คลิกเพื่อแนบภาพ"}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, GIF (สูงสุด 5MB)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg overflow-hidden bg-muted border border-border"
            >
              {/* Image preview */}
              <img
                src={image.url}
                alt={image.filename}
                className="w-full h-24 object-cover"
              />

              {/* Overlay with delete button */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleRemoveImage(image.id)}
                  className="p-1.5 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90"
                  title="ลบภาพ"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Filename tooltip */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                {image.filename}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <ImageIcon size={16} className="mr-2" />
          <span className="text-sm">ยังไม่มีภาพ</span>
        </div>
      )}
    </div>
  );
}
