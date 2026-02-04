import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'image', 'audio', 'pdf', 'document'
        const patientId = formData.get('patientId') as string;

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

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${timestamp}_${originalName}`;

        // In production, upload to S3/Supabase Storage
        // For now, save locally (mock)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Mock file path (in production, this would be S3/Supabase URL)
        const fileUrl = `/uploads/${type || 'files'}/${filename}`;

        // Return file information
        return NextResponse.json({
            success: true,
            file: {
                name: file.name,
                size: file.size,
                type: file.type,
                url: fileUrl,
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
        const { searchParams } = new URL(request.url);
        const fileUrl = searchParams.get('fileUrl');

        if (!fileUrl) {
            return NextResponse.json(
                { error: 'File URL is required' },
                { status: 400 }
            );
        }

        // In production, delete from S3/Supabase Storage
        // For now, just return success (mock)

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
