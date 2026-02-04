# 📁 FILE STORAGE INTEGRATION GUIDE
## Supabase Storage - Complete Implementation

**Estimated Time**: 1-2 hours  
**Difficulty**: Easy  
**Prerequisites**: Supabase project set up

---

## 📋 **STEP-BY-STEP INTEGRATION**

### **Step 1: Storage Buckets Already Created** ✅

From DATABASE_SETUP_GUIDE.md, you should have:
- ✅ `images` bucket (public)
- ✅ `audio` bucket (private)
- ✅ `documents` bucket (private)
- ✅ `exams` bucket (private)

---

### **Step 2: Update Upload API** (20 minutes)

Replace the mock implementation in `/src/app/api/upload/route.ts`:

```typescript
// File: /src/app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'image', 'audio', 'pdf', 'document'
    const patientId = formData.get('patientId') as string;
    const userId = formData.get('userId') as string; // From auth

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = {
      image: ['image/jpeg', 'image/png', 'image/webp'],
      audio: ['audio/mpeg', 'audio/wav', 'audio/webm'],
      pdf: ['application/pdf'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    };

    if (type && validTypes[type as keyof typeof validTypes]) {
      if (!validTypes[type as keyof typeof validTypes].includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type for ${type}` },
          { status: 400 }
        );
      }
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Determine bucket
    const bucketMap = {
      image: 'images',
      audio: 'audio',
      pdf: 'exams',
      document: 'documents',
    };
    const bucket = bucketMap[type as keyof typeof bucketMap] || 'documents';

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${userId}/${timestamp}_${sanitizedName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filename);

    return NextResponse.json({
      success: true,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        url: urlData.publicUrl,
        path: filename,
        bucket,
        uploadedAt: new Date().toISOString(),
      },
      message: 'File uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('filePath');
    const bucket = searchParams.get('bucket');

    if (!filePath || !bucket) {
      return NextResponse.json(
        { error: 'File path and bucket are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
```

---

### **Step 3: Create Upload Helper** (10 minutes)

Create a client-side helper:

```typescript
// File: /src/lib/upload.ts

export async function uploadFile(
  file: File,
  type: 'image' | 'audio' | 'pdf' | 'document',
  userId: string,
  patientId?: string
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  formData.append('userId', userId);
  if (patientId) {
    formData.append('patientId', patientId);
  }

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  return response.json();
}

export async function deleteFile(filePath: string, bucket: string) {
  const response = await fetch(
    `/api/upload?filePath=${encodeURIComponent(filePath)}&bucket=${bucket}`,
    { method: 'DELETE' }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Delete failed');
  }

  return response.json();
}
```

---

### **Step 4: Update Food Recognition to Use Real Uploads** (15 minutes)

```typescript
// In your food capture page component:

import { uploadFile } from '@/lib/upload';

async function handlePhotoCapture(photoBlob: Blob) {
  try {
    // Convert blob to file
    const file = new File([photoBlob], `food-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    });

    // Upload to Supabase
    const uploadResult = await uploadFile(file, 'image', userId, patientId);

    // Send to AI for recognition
    const response = await fetch('/api/ai/food-recognition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: uploadResult.file.url,
        patientId,
      }),
    });

    const result = await response.json();
    // Handle result...
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

### **Step 5: Update Exam Upload** (15 minutes)

```typescript
// In exam upload component:

import { uploadFile } from '@/lib/upload';

async function handleExamUpload(file: File) {
  try {
    // Upload PDF/image
    const uploadResult = await uploadFile(file, 'pdf', userId, patientId);

    // Create exam record
    const response = await fetch('/api/exams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patientId,
        examType: selectedExamType,
        examDate: selectedDate,
        fileUrl: uploadResult.file.url,
        results: {}, // Will be filled by OCR
      }),
    });

    // Optionally, run OCR analysis
    const ocrResponse = await fetch('/api/ai/exam-analyzer-ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: uploadResult.file.url,
        examType: selectedExamType,
        patientId,
      }),
    });

    const ocrResult = await ocrResponse.json();
    // Update exam with OCR results...
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

### **Step 6: Test File Upload** (10 minutes)

Create a test page:

```typescript
// test-upload.tsx
'use client';

import { useState } from 'react';
import { uploadFile } from '@/lib/upload';

export default function TestUpload() {
  const [result, setResult] = useState<any>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadFile(file, 'image', 'test-user-id');
      setResult(result);
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test File Upload</h1>
      <input type="file" onChange={handleUpload} accept="image/*" />
      {result && (
        <div className="mt-4">
          <p className="text-green-500">✅ Upload successful!</p>
          <img src={result.file.url} alt="Uploaded" className="mt-4 max-w-md" />
          <pre className="mt-4 bg-slate-800 p-4 rounded">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

---

## ✅ **VERIFICATION CHECKLIST**

- [ ] Storage buckets created in Supabase
- [ ] Upload API updated with real Supabase calls
- [ ] Upload helper created
- [ ] Food recognition updated to use uploads
- [ ] Exam upload updated
- [ ] Test upload page created
- [ ] Test upload successful
- [ ] Files visible in Supabase Storage dashboard

---

## 🎯 **STORAGE LIMITS**

**Free Tier**:
- 1 GB storage
- 2 GB bandwidth/month

**Pro Tier** ($25/month):
- 100 GB storage
- 200 GB bandwidth/month

**Estimated Usage** (100 active patients):
- Food photos: ~500 MB/month
- Exam PDFs: ~200 MB/month
- Audio notes: ~100 MB/month
- **Total**: ~800 MB/month (fits in free tier!)

---

## 🚨 **SECURITY NOTES**

1. **Always validate file types** before upload
2. **Always check file sizes** (max 10MB)
3. **Always sanitize filenames** (remove special chars)
4. **Always use user-specific folders** (`userId/filename`)
5. **Never trust client-side validation** alone

---

**File Storage integration complete! Ready for production use.** 🚀
