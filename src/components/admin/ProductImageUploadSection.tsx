"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Link as LinkIcon, Image as ImageIcon, Plus } from "lucide-react";

interface ProductImageUploadSectionProps {
  mainImageUrl: string;
  onMainImageChange: (url: string) => void;
  galleryUrlsString: string;
  onGalleryUrlsChange: (urlsString: string) => void;
}

export const ProductImageUploadSection: React.FC<ProductImageUploadSectionProps> = ({
  mainImageUrl,
  onMainImageChange,
  galleryUrlsString,
  onGalleryUrlsChange,
}) => {
  const [mainMode, setMainMode] = useState<"upload" | "url">(
    mainImageUrl && !mainImageUrl.startsWith("/uploads/") ? "upload" : "upload"
  );
  const [isUploadingMain, setIsUploadingMain] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isMainDragOver, setIsMainDragOver] = useState(false);
  const [isGalleryDragOver, setIsGalleryDragOver] = useState(false);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");

  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  // Parse gallery URLs array from comma-separated string
  const galleryList = galleryUrlsString
    ? galleryUrlsString
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const updateGalleryList = (newList: string[]) => {
    onGalleryUrlsChange(newList.join(", "));
  };

  const uploadFiles = async (files: FileList | File[]): Promise<string[]> => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    // Also include single 'file' key for backwards-compatibility
    if (files.length > 0) {
      formData.append("file", files[0]);
    }

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to upload image");
    }

    return data.urls || [data.url];
  };

  // Main Image Upload
  const handleMainFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingMain(true);
      setUploadError(null);
      const urls = await uploadFiles(files);
      if (urls.length > 0) {
        onMainImageChange(urls[0]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingMain(false);
      if (mainFileInputRef.current) mainFileInputRef.current.value = "";
    }
  };

  const handleMainDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsMainDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingMain(true);
      setUploadError(null);
      const urls = await uploadFiles(files);
      if (urls.length > 0) {
        onMainImageChange(urls[0]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploadingMain(false);
    }
  };

  // Gallery Multiple Upload
  const handleGalleryFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingGallery(true);
      setUploadError(null);
      const urls = await uploadFiles(files);
      updateGalleryList([...galleryList, ...urls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gallery upload failed");
    } finally {
      setIsUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
    }
  };

  const handleGalleryDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsGalleryDragOver(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploadingGallery(true);
      setUploadError(null);
      const urls = await uploadFiles(files);
      updateGalleryList([...galleryList, ...urls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gallery upload failed");
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    const filtered = galleryList.filter((_, idx) => idx !== indexToRemove);
    updateGalleryList(filtered);
  };

  const addGalleryUrl = () => {
    const trimmed = galleryUrlInput.trim();
    if (!trimmed) return;
    updateGalleryList([...galleryList, trimmed]);
    setGalleryUrlInput("");
  };

  return (
    <div className="space-y-5 bg-[#0A0E17]/80 p-4 border border-[#1C2438] rounded-sm">
      {uploadError && (
        <div className="p-3 bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center justify-between rounded-sm">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-red-400 hover:text-white ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Main Cover Image */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#C5A059]" />
            Main Kit Image <span className="text-[#C5A059]">*</span>
          </label>

          {/* Toggle between Upload and URL */}
          <div className="flex items-center gap-1 bg-[#0E131F] p-0.5 border border-[#1C2438] rounded text-[11px]">
            <button
              type="button"
              onClick={() => setMainMode("upload")}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-medium ${
                mainMode === "upload"
                  ? "bg-[#C5A059] text-[#0A0D14] font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Upload className="w-3 h-3" />
              Upload Image
            </button>
            <button
              type="button"
              onClick={() => setMainMode("url")}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-medium ${
                mainMode === "url"
                  ? "bg-[#C5A059] text-[#0A0D14] font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              Image URL
            </button>
          </div>
        </div>

        {mainMode === "upload" ? (
          <div>
            <input
              type="file"
              ref={mainFileInputRef}
              onChange={handleMainFileSelect}
              accept="image/*"
              className="hidden"
            />

            {mainImageUrl ? (
              /* Preview of current main image */
              <div className="flex items-center gap-4 p-3 bg-[#0E131F] border border-[#1C2438] rounded-sm">
                <div className="relative w-20 h-24 bg-[#080B11] border border-[#232D42] rounded overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mainImageUrl}
                    alt="Main kit preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[9px] text-center text-[#DFB76C] font-semibold py-0.5">
                    COVER
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {mainImageUrl.split("/").pop() || "main-image.jpg"}
                  </p>
                  <p className="text-[11px] text-neutral-400 truncate font-mono mt-0.5">
                    {mainImageUrl}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => mainFileInputRef.current?.click()}
                      disabled={isUploadingMain}
                      className="px-2.5 py-1 bg-[#1C2438] hover:bg-[#2A3752] text-white text-xs font-semibold rounded flex items-center gap-1 transition"
                    >
                      {isUploadingMain ? (
                        <Loader2 className="w-3 h-3 animate-spin text-[#C5A059]" />
                      ) : (
                        <Upload className="w-3 h-3 text-[#C5A059]" />
                      )}
                      Replace Image
                    </button>
                    <button
                      type="button"
                      onClick={() => onMainImageChange("")}
                      className="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 text-xs font-semibold rounded flex items-center gap-1 transition"
                    >
                      <X className="w-3 h-3" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Drag & Drop Upload Zone */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsMainDragOver(true);
                }}
                onDragLeave={() => setIsMainDragOver(false)}
                onDrop={handleMainDrop}
                onClick={() => mainFileInputRef.current?.click()}
                className={`cursor-pointer border-2 border-dashed rounded-sm p-6 text-center transition flex flex-col items-center justify-center ${
                  isMainDragOver
                    ? "border-[#C5A059] bg-[#C5A059]/10"
                    : "border-[#1C2438] hover:border-[#C5A059]/60 bg-[#0E131F]/60 hover:bg-[#0E131F]"
                }`}
              >
                {isUploadingMain ? (
                  <div className="flex flex-col items-center py-2">
                    <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin mb-2" />
                    <p className="text-xs text-white font-semibold">Uploading image to server...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-[#1C2438] flex items-center justify-center mb-2.5 text-[#C5A059]">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-white mb-1">
                      Click to upload or drag & drop kit image
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      PNG, JPG, WEBP, AVIF or GIF (up to 10MB)
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Direct URL Input */
          <div className="space-y-2">
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or /uploads/..."
              value={mainImageUrl}
              onChange={(e) => onMainImageChange(e.target.value)}
              className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
            />
            {mainImageUrl && (
              <div className="flex items-center gap-3 p-2 bg-[#0E131F] border border-[#1C2438] rounded">
                <div className="relative w-12 h-14 bg-black rounded overflow-hidden flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={mainImageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="text-[11px] text-neutral-300 truncate font-mono">
                  Preview loaded
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Additional Gallery Images */}
      <div className="pt-3 border-t border-[#1C2438]/80">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5">
            <span>Additional Gallery Images</span>
            <span className="text-neutral-500 font-normal">({galleryList.length})</span>
          </label>
        </div>

        {/* Gallery Thumbnails Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 mb-3">
          {galleryList.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="group relative aspect-[3/4] bg-[#0E131F] border border-[#1C2438] rounded overflow-hidden"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Gallery image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  className="p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-full transition"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="absolute bottom-1 left-1 bg-black/70 text-[9px] text-neutral-300 px-1 rounded font-mono">
                #{idx + 1}
              </span>
            </div>
          ))}

          {/* Add Gallery Image Card */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsGalleryDragOver(true);
            }}
            onDragLeave={() => setIsGalleryDragOver(false)}
            onDrop={handleGalleryDrop}
            onClick={() => galleryFileInputRef.current?.click()}
            className={`cursor-pointer aspect-[3/4] border-2 border-dashed rounded flex flex-col items-center justify-center p-2 text-center transition ${
              isGalleryDragOver
                ? "border-[#C5A059] bg-[#C5A059]/10"
                : "border-[#1C2438] hover:border-[#C5A059]/60 bg-[#0E131F]/40 hover:bg-[#0E131F]"
            }`}
          >
            {isUploadingGallery ? (
              <Loader2 className="w-5 h-5 text-[#C5A059] animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5 text-[#C5A059] mb-1" />
                <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-tight">
                  Add Images
                </span>
                <span className="text-[9px] text-neutral-500">Drop or click</span>
              </>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={galleryFileInputRef}
          onChange={handleGalleryFileSelect}
          accept="image/*"
          multiple
          className="hidden"
        />

        {/* Or add gallery image via URL */}
        <div className="flex items-center gap-2 mt-2">
          <input
            type="url"
            placeholder="Or paste external gallery image URL and click Add"
            value={galleryUrlInput}
            onChange={(e) => setGalleryUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addGalleryUrl();
              }
            }}
            className="flex-1 bg-[#0E131F] border border-[#1C2438] px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#C5A059]"
          />
          <button
            type="button"
            onClick={addGalleryUrl}
            className="px-3 py-1.5 bg-[#1C2438] hover:bg-[#25304B] text-neutral-200 hover:text-white text-xs font-bold uppercase transition"
          >
            Add URL
          </button>
        </div>
      </div>
    </div>
  );
};
