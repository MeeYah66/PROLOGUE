import { createClient } from "@/lib/supabase/client";

const BUCKET = "covers";

/**
 * Upload a cover image to Supabase Storage.
 * Returns the public URL of the uploaded image.
 *
 * Bucket must be public so URLs work without signed tokens.
 * Path format: {userId}/{bookId}/cover.{ext}
 */
export async function uploadCoverImage(bookId: string, file: File): Promise<string> {
  const supabase = createClient();

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
