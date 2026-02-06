import { createSupabaseAdminClient } from './supabase/admin';

export class StorageService {
  private _supabase: ReturnType<typeof createSupabaseAdminClient> | null = null;

  /** Lazy-init so the Supabase client is only created at runtime, not at build time. */
  private get supabase() {
    if (!this._supabase) {
      this._supabase = createSupabaseAdminClient();
    }
    return this._supabase;
  }

  /**
   * Upload a file to Supabase Storage
   * @param file - The file object to upload
   * @param bucket - The storage bucket name
   * @param path - Optional path/filename. If not provided, generates a unique name.
   * @returns Public URL of the uploaded file
   */
  async uploadFile(file: File, bucket: string, path?: string): Promise<{ url: string; path: string }> {
    try {
      // 1. Ensure bucket exists (optional, mostly for dev convenience)
      const { data: buckets } = await this.supabase.storage.listBuckets();
      if (!buckets?.find((b) => b.name === bucket)) {
        await this.supabase.storage.createBucket(bucket, {
          public: true, // Make files publicly accessible by default for this app
          fileSizeLimit: 10485760, // 10MB
        });
      }

      // 2. Generate path if not provided
      const fileName = path || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

      // 3. Upload file
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) throw error;

      // 4. Get Public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        path: fileName,
      };
    } catch (error) {
      console.error('Storage Upload Error:', error);
      throw error;
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  }
}

export const storageService = new StorageService();

/**
 * Standalone upload helper used by server actions and API routes.
 * Builds a tenant/patient-scoped path and returns a simple success/error shape.
 */
export async function uploadFile(
  file: File,
  bucket: string,
  tenantId: string,
  patientId: string
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  try {
    const scopedPath = `${tenantId}/${patientId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const result = await storageService.uploadFile(file, bucket, scopedPath);
    return { success: true, url: result.url, path: result.path };
  } catch (error) {
    console.error('uploadFile helper error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  }
}
