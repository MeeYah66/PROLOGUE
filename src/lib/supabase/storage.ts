import { createClient } from "@/lib/supabase/client";

const BUCKET = "covers";
const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_COVER_BYTES = 8 * 1024 * 1024;
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

export function validateImageUpload(
  file: File,
  options: { maxBytes: number; label: string }
): void {
  const mime = file.type.toLowerCase();
  if (!ALLOWED_IMAGE_MIME_TYPES.has(mime)) {
    throw new Error(`${options.label} must be JPG, PNG, or WEBP.`);
  }
  if (file.size > options.maxBytes) {
    const maxMb = Math.round(options.maxBytes / (1024 * 1024));
    throw new Error(`${options.label} must be under ${maxMb} MB.`);
  }
}

/**
 * Upload a cover image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 *
 * Bucket must be public so URLs work without signed tokens.
 * Path format: {userId}/{bookId}/cover.{ext}
 */
export async function uploadCoverImage(bookId: string, file: File): Promise<string> {
  const supabase = createClient();
  validateImageUpload(file, { maxBytes: MAX_COVER_BYTES, label: "Cover image" });

  // Get current user to build the path
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/${bookId}/cover.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Upload a user avatar to Supabase Storage.
 * Returns the public URL of the uploaded image.
 * Path format: avatars/{userId}/profile.{ext}
 */
export async function uploadAvatarImage(file: File): Promise<string> {
  const supabase = createClient();
  validateImageUpload(file, { maxBytes: MAX_AVATAR_BYTES, label: "Avatar image" });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const ext  = file.name.split(".").pop() ?? "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Delete the cover image for a book from Supabase Storage.
 */
export async function deleteCoverImage(bookId: string): Promise<void> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Try common extensions
  const extensions = ["jpg", "jpeg", "png", "webp", "gif"];
  const paths = extensions.map((ext) => `${user.id}/${bookId}/cover.${ext}`);

  // Remove ignores "not found" errors gracefully
  await supabase.storage.from(BUCKET).remove(paths);
}

/**
 * Upload a public HTML preview that can be opened without authentication.
 */
export async function uploadPublicSharePreview(
  bookId: string,
  html: string
): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const token = crypto.randomUUID();
  const path = `${user.id}/${bookId}/shares/${token}.html`;
  const file = new File([html], `${token}.html`, { type: "text/html;charset=utf-8" });

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      upsert: false,
      contentType: "text/html; charset=utf-8",
      cacheControl: "3600",
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
