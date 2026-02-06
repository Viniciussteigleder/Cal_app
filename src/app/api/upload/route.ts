import { NextRequest, NextResponse } from 'next/server';
import { storageService } from '@/lib/storage';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { verifySessionCookieValue } from '@/lib/session';

export async function POST(request: NextRequest) {
    try {
        // 1. Authentication Check
        let isAuthenticated = false;
        let tenantId = 'default'; // Default for authorized mock users

        // Check Supabase Auth
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            isAuthenticated = true;
            tenantId = user.user_metadata?.tenant_id || 'default';
        } else {
            // Check Mock Session
            const cookieStore = await cookies();
            const sessionCookie = cookieStore.get('np_session');
            const session = verifySessionCookieValue(sessionCookie?.value);
            if (session) {
                isAuthenticated = true;
                tenantId = session.tenantId || 'default';
            }
        }

        if (!isAuthenticated) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Process Request
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'image', 'audio', 'pdf', 'document'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 3. Validation
        const validTypes = {
            image: ['image/jpeg', 'image/png', 'image/webp'],
            audio: ['audio/mpeg', 'audio/wav', 'audio/webm'],
            pdf: ['application/pdf'],
            document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        };

        if (type && validTypes[type as keyof typeof validTypes]) {
            if (!validTypes[type as keyof typeof validTypes].includes(file.type)) {
                return NextResponse.json({ error: `Invalid file type for ${type}` }, { status: 400 });
            }
        }

        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File size exceeds 10MB limit' }, { status: 400 });
        }

        // 4. Upload to Supabase Storage
        // Use a bucket named based on type or generic 'uploads'
        // If type is 'image', maybe 'images' bucket? Or just 'uploads' with folder?
        // Let's use 'uploads' bucket and use folders.
        const bucketName = 'uploads';
        const folder = type || 'misc';

        // Sanitize filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `${tenantId}/${folder}/${timestamp}_${originalName}`;

        const result = await storageService.uploadFile(file, bucketName, path);

        return NextResponse.json({
            success: true,
            file: {
                name: file.name,
                size: file.size,
                type: file.type,
                url: result.url,
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
        // Auth Check (Same as above)
        let isAuthenticated = false;
        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            isAuthenticated = true;
        } else {
            const cookieStore = await cookies();
            const session = verifySessionCookieValue(cookieStore.get('np_session')?.value);
            if (session) isAuthenticated = true;
        }

        if (!isAuthenticated) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const fileUrl = searchParams.get('fileUrl');

        if (!fileUrl) return NextResponse.json({ error: 'File URL is required' }, { status: 400 });

        // Extract path from URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
        // We need the path inside the bucket.
        // Simple extraction: split by bucket name.
        const bucketName = 'uploads';
        const parts = fileUrl.split(`/${bucketName}/`);
        if (parts.length < 2) {
            return NextResponse.json({ error: 'Invalid file URL for this storage' }, { status: 400 });
        }
        const path = parts[1];

        await storageService.deleteFile(bucketName, path);

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
