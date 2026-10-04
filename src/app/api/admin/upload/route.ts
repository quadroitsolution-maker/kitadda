import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// Allowed mime types for image uploads
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Support either single 'file' or multiple 'files'
    const files: File[] = [];
    const singleFile = formData.get("file");
    if (singleFile instanceof File) {
      files.push(singleFile);
    }
    const multipleFiles = formData.getAll("files");
    for (const item of multipleFiles) {
      if (item instanceof File && !files.includes(item)) {
        files.push(item);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { success: false, error: `File "${file.name}" exceeds the 10MB limit.` },
          { status: 400 }
        );
      }

      if (!ALLOWED_MIME_TYPES.has(file.type) && !file.type.startsWith("image/")) {
        return NextResponse.json(
          { success: false, error: `File "${file.name}" is not an allowed image format.` },
          { status: 400 }
        );
      }

      // Determine extension
      let ext = path.extname(file.name).toLowerCase().replace(".", "");
      if (!ext) {
        if (file.type === "image/jpeg") ext = "jpg";
        else if (file.type === "image/png") ext = "png";
        else if (file.type === "image/webp") ext = "webp";
        else if (file.type === "image/gif") ext = "gif";
        else if (file.type === "image/avif") ext = "avif";
        else ext = "jpg";
      }

      // Create unique filename
      const cleanBase = path.basename(file.name, path.extname(file.name))
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .slice(0, 30);
      const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const filename = `${cleanBase || "kit"}-${uniqueSuffix}.${ext}`;
      const filePath = path.join(uploadsDir, filename);

      // Convert to buffer and save
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;
      uploadedUrls.push(publicUrl);
    }

    return NextResponse.json({
      success: true,
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length,
      message: `${uploadedUrls.length} image(s) uploaded successfully`,
    });
  } catch (error) {
    console.error("Admin POST /api/admin/upload error:", error);
    const message = error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
