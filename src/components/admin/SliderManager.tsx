"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Sliders,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Loader2,
  X,
  RefreshCw,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import { HeroSlide } from "@/types";

interface SliderManagerProps {
  onShowToast: (text: string, type?: "success" | "error") => void;
}

export const SliderManager: React.FC<SliderManagerProps> = ({ onShowToast }) => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    badge: "",
    headline: "",
    description: "",
    cta_link: "#latest-drops",
    image_url: "",
    is_active: true,
  });

  const [imageUploadMode, setImageUploadMode] = useState<"upload" | "url">("upload");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch all sliders
  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/sliders");
      const data = await res.json();
      if (data.success && Array.isArray(data.slides)) {
        setSlides(data.slides);
      } else {
        onShowToast("Failed to load slides", "error");
      }
    } catch (err) {
      console.error("Error loading sliders:", err);
      onShowToast("Network error loading slides", "error");
    } finally {
      setLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const openAddModal = () => {
    setEditingSlide(null);
    setFormData({
      badge: "NEW DROP",
      headline: "",
      description: "Official master grade kits.",
      cta_link: "#latest-drops",
      image_url: "",
      is_active: true,
    });
    setUploadError(null);
    setImageUploadMode("upload");
    setIsModalOpen(true);
  };

  const openEditModal = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      badge: slide.badge || "",
      headline: slide.headline || "",
      description: slide.description || "",
      cta_link: slide.cta_link || "#latest-drops",
      image_url: slide.image_url || "",
      is_active: slide.is_active ?? true,
    });
    setUploadError(null);
    setImageUploadMode("upload");
    setIsModalOpen(true);
  };

  // Upload file helper
  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    try {
      setIsUploadingImage(true);
      setUploadError(null);

      const body = new FormData();
      body.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload image");
      }

      setFormData((prev) => ({ ...prev, image_url: data.url }));
      onShowToast("Image uploaded successfully!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      setUploadError(msg);
      onShowToast(msg, "error");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.headline.trim()) {
      onShowToast("Headline is required", "error");
      return;
    }
    if (!formData.image_url.trim()) {
      onShowToast("Please provide or upload a banner image", "error");
      return;
    }

    try {
      setIsSaving(true);
      if (editingSlide) {
        // Update existing
        const res = await fetch(`/api/admin/sliders/${editingSlide.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          onShowToast("Slide updated successfully!");
          setIsModalOpen(false);
          fetchSlides();
        } else {
          onShowToast(data.error || "Failed to update slide", "error");
        }
      } else {
        // Create new
        const res = await fetch("/api/admin/sliders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          onShowToast("New slide added successfully!");
          setIsModalOpen(false);
          fetchSlides();
        } else {
          onShowToast(data.error || "Failed to create slide", "error");
        }
      }
    } catch (err) {
      console.error("Save slide error:", err);
      onShowToast("Network error saving slide", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlide = async (id: string, headline: string) => {
    if (!confirm(`Are you sure you want to delete slide "${headline}"?`)) return;

    try {
      const res = await fetch(`/api/admin/sliders/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        onShowToast("Slide deleted");
        fetchSlides();
      } else {
        onShowToast(data.error || "Failed to delete slide", "error");
      }
    } catch (err) {
      console.error("Delete slide error:", err);
      onShowToast("Network error deleting slide", "error");
    }
  };

  const handleToggleActive = async (slide: HeroSlide) => {
    try {
      const res = await fetch(`/api/admin/sliders/${slide.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !slide.is_active }),
      });
      const data = await res.json();
      if (data.success) {
        onShowToast(`Slide is now ${!slide.is_active ? "Visible" : "Hidden"}`);
        fetchSlides();
      }
    } catch (err) {
      console.error("Toggle active error:", err);
      onShowToast("Failed to update status", "error");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;

    setSlides(newSlides);

    try {
      const orderedIds = newSlides.map((s) => s.id);
      await fetch("/api/admin/sliders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", orderedIds }),
      });
      onShowToast("Slide order updated!");
    } catch (err) {
      console.error("Reorder error:", err);
      onShowToast("Failed to save reorder", "error");
      fetchSlides();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C2438] pb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black uppercase text-white font-jersey tracking-wide flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#C5A059]" />
            <span>Homepage Hero Sliders &amp; Banners</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Add new slides, replace banner images, modify headlines, and reorder hero carousel drops.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchSlides}
            disabled={loading}
            className="p-2.5 bg-[#0E131F] hover:bg-[#162035] border border-[#1C2438] text-neutral-300 hover:text-white transition"
            title="Refresh Sliders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#C5A059]" : ""}`} />
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#C5A059] hover:bg-[#d8b368] text-[#0A0D14] px-4 py-2.5 text-xs font-black uppercase tracking-wider font-jersey transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Slide</span>
          </button>
        </div>
      </div>

      {/* Sliders Grid List */}
      {loading && slides.length === 0 ? (
        <div className="p-12 text-center bg-[#0E131F] border border-[#1C2438]">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A059] mx-auto mb-3" />
          <p className="text-xs text-neutral-400">Loading hero slides from database...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="p-12 text-center bg-[#0E131F] border border-[#1C2438] space-y-3">
          <ImageIcon className="w-10 h-10 text-neutral-500 mx-auto" />
          <h3 className="text-base font-bold text-white uppercase font-jersey">No Sliders Found</h3>
          <p className="text-xs text-neutral-400 max-w-sm mx-auto">
            Create your first hero banner slide to showcase on the homepage carousel.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-[#C5A059] text-[#0A0D14] px-4 py-2 text-xs font-bold uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Slide</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`flex flex-col lg:flex-row items-stretch bg-[#0E131F] border transition-all ${
                slide.is_active ? "border-[#1C2438] hover:border-[#C5A059]/40" : "border-neutral-800 opacity-65"
              }`}
            >
              {/* Image Preview */}
              <div className="relative w-full lg:w-80 h-44 sm:h-52 lg:h-auto bg-black shrink-0 overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.image_url}
                  alt={slide.headline}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Badge overlay */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="bg-[#0A0D14]/90 border border-[#C5A059]/50 text-[#DFB76C] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                    #{index + 1} • {slide.badge || "SLIDE"}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white/90">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${slide.is_active ? "bg-emerald-950/80 text-emerald-400 border border-emerald-700/50" : "bg-neutral-900 text-neutral-400 border border-neutral-700"}`}>
                    {slide.is_active ? "Live on Store" : "Hidden / Inactive"}
                  </span>
                </div>
              </div>

              {/* Content & Metadata */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-white uppercase font-jersey tracking-wide">
                      {slide.headline}
                    </h3>
                  </div>
                  {slide.description && (
                    <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                      {slide.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 pt-1 text-[11px] text-[#DFB76C] font-mono">
                    <span>CTA Destination:</span>
                    <span className="bg-[#0B132B] px-2 py-0.5 border border-[#1C2438] text-white">
                      {slide.cta_link || "#latest-drops"}
                    </span>
                  </div>
                </div>

                {/* Bottom Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#1C2438]">
                  {/* Order controls */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveOrder(index, "up")}
                      className="p-1.5 bg-[#0B132B] hover:bg-[#162035] border border-[#1C2438] text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === slides.length - 1}
                      onClick={() => handleMoveOrder(index, "down")}
                      className="p-1.5 bg-[#0B132B] hover:bg-[#162035] border border-[#1C2438] text-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] text-neutral-500 font-mono ml-1">
                      Position {index + 1} of {slides.length}
                    </span>
                  </div>

                  {/* Edit / Delete / Visibility */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(slide)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border transition ${
                        slide.is_active
                          ? "bg-[#0B132B] text-neutral-300 border-[#1C2438] hover:text-white"
                          : "bg-emerald-950/40 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/60"
                      }`}
                    >
                      {slide.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{slide.is_active ? "Hide" : "Show"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(slide)}
                      className="px-3 py-1.5 bg-[#1C2438] hover:bg-[#2A3752] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#C5A059]" />
                      <span>Edit &amp; Change Image</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(slide.id, slide.headline)}
                      className="p-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-red-300 transition"
                      title="Delete Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-[#0A0D14] border border-[#1C2438] text-white shadow-2xl my-auto">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#1C2438] bg-[#0E131F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#C5A059]" />
                <h3 className="text-base font-black uppercase text-white font-jersey tracking-wide">
                  {editingSlide ? "Edit Hero Banner Slide" : "Add New Hero Banner Slide"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSlide} className="p-4 sm:p-6 space-y-5">
              {/* 1. Image Upload / URL Section */}
              <div className="space-y-3 bg-[#0E131F] p-4 border border-[#1C2438]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#C5A059]" />
                    <span>Banner Image (High Resolution) *</span>
                  </label>

                  <div className="flex items-center gap-1 bg-[#0A0D14] p-0.5 border border-[#1C2438] text-[11px]">
                    <button
                      type="button"
                      onClick={() => setImageUploadMode("upload")}
                      className={`px-2.5 py-1 transition ${
                        imageUploadMode === "upload"
                          ? "bg-[#C5A059] text-[#0A0D14] font-black"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageUploadMode("url")}
                      className={`px-2.5 py-1 transition ${
                        imageUploadMode === "url"
                          ? "bg-[#C5A059] text-[#0A0D14] font-black"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {uploadError && (
                  <div className="p-2.5 bg-red-950/60 border border-red-800 text-red-200 text-xs">
                    {uploadError}
                  </div>
                )}

                {imageUploadMode === "upload" ? (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => handleFileUpload(e.target.files || [])}
                      accept="image/*"
                      className="hidden"
                    />

                    {formData.image_url ? (
                      <div className="relative aspect-[21/9] sm:aspect-[16/7] w-full bg-black border border-[#1C2438] overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.image_url}
                          alt="Banner preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploadingImage}
                            className="px-3.5 py-2 bg-[#C5A059] text-[#0A0D14] text-xs font-black uppercase tracking-wider flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Change Image</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, image_url: "" }))}
                            className="px-3.5 py-2 bg-red-900/80 text-white text-xs font-bold uppercase tracking-wider"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragOver(false);
                          handleFileUpload(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`cursor-pointer border-2 border-dashed p-6 sm:p-8 text-center transition flex flex-col items-center justify-center ${
                          isDragOver
                            ? "border-[#C5A059] bg-[#C5A059]/10"
                            : "border-[#1C2438] hover:border-[#C5A059]/60 bg-[#0A0D14]/60 hover:bg-[#0A0D14]"
                        }`}
                      >
                        {isUploadingImage ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin mb-2" />
                            <p className="text-xs font-bold text-white">Uploading banner image...</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-[#C5A059] mb-2" />
                            <p className="text-xs font-bold text-white mb-1 uppercase tracking-wide">
                              Click to select or drag &amp; drop banner image
                            </p>
                            <p className="text-[11px] text-neutral-400">
                              Recommended: 1920x800 or 16:9 ratio (JPEG, PNG, WebP up to 10MB)
                            </p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... or /uploads/..."
                      value={formData.image_url}
                      onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                      className="w-full bg-[#0A0D14] border border-[#1C2438] px-3 py-2.5 text-xs text-white font-mono focus:border-[#C5A059] focus:outline-none"
                    />
                    {formData.image_url && (
                      <div className="relative aspect-[21/9] w-full bg-black border border-[#1C2438] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.image_url}
                          alt="URL preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Text Content */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    Badge Tag (e.g. 2024/25 SEASON)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2024/25 SEASON, HOT DROP"
                    value={formData.badge}
                    onChange={(e) => setFormData((prev) => ({ ...prev, badge: e.target.value.toUpperCase() }))}
                    className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2.5 text-xs font-bold text-white focus:border-[#C5A059] focus:outline-none uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                    CTA Link Destination *
                  </label>
                  <input
                    type="text"
                    placeholder="#latest-drops, /products, /products/rm-home-2425"
                    value={formData.cta_link}
                    onChange={(e) => setFormData((prev) => ({ ...prev, cta_link: e.target.value }))}
                    className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2.5 text-xs text-white font-mono focus:border-[#C5A059] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  Main Headline *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Current Season Kits, Master Grade Retro Vault"
                  value={formData.headline}
                  onChange={(e) => setFormData((prev) => ({ ...prev, headline: e.target.value }))}
                  className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2.5 text-xs font-black text-white uppercase font-jersey focus:border-[#C5A059] focus:outline-none tracking-wide"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                  Sub-Headline / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Player & Fan Version master grade drops with authentic crest embroidery."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-[#0E131F] border border-[#1C2438] px-3 py-2 text-xs text-white focus:border-[#C5A059] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="slide_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 accent-[#C5A059] cursor-pointer"
                />
                <label htmlFor="slide_active" className="text-xs font-bold uppercase tracking-wide text-neutral-200 cursor-pointer select-none">
                  Publish Slide Live on Homepage Carousel
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1C2438]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#0E131F] hover:bg-[#162035] border border-[#1C2438] text-neutral-300 text-xs font-bold uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#C5A059] hover:bg-[#d8b368] text-[#0A0D14] text-xs font-black uppercase tracking-wider font-jersey flex items-center gap-2 transition"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>{editingSlide ? "Save Changes" : "Create Slide"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
