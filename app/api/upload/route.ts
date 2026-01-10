import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getAuth } from '@clerk/nextjs/server';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
    return NextResponse.json({ message: "Upload API is working! Use POST to upload files." });
}

export async function POST(request: NextRequest) {
    try {
        console.log('🚀 Upload API called');
        
        // Debug environment variables
        console.log('🔍 Environment variables:');
        console.log('CLOUD_NAME:', process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
        console.log('API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING');
        console.log('API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');
        
        // Check authentication
        const { userId: loggedInUserId } = getAuth(request);
        console.log('🔍 User ID:', loggedInUserId);
        
        if (!loggedInUserId) {
            console.log('❌ No user ID - unauthorized');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse form data
        console.log('🔍 Parsing form data...');
        const data = await request.formData();
        const file = data.get('file') as File;
        
        console.log('🔍 File received:', {
            name: file?.name,
            type: file?.type,
            size: file?.size
        });

        if (!file) {
            console.log('❌ No file in request');
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            console.log('❌ Invalid file type:', file.type);
            return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            console.log('❌ File too large:', file.size);
            return NextResponse.json({ error: 'File too large' }, { status: 400 });
        }

        // Convert to buffer
        console.log('🔍 Converting file to buffer...');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        console.log('🔍 Buffer size:', buffer.length);

        // Upload to Cloudinary
        console.log('🔍 Uploading to Cloudinary...');
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    resource_type: 'image',
                    folder: 'weave/profile-pictures',
                    public_id: `profile_${loggedInUserId}_${Date.now()}`,
                    transformation: [
                        { width: 400, height: 400, crop: 'fill' },
                        { quality: 'auto' },
                        { format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ Cloudinary error:', error);
                        reject(error);
                    } else {
                        console.log('✅ Cloudinary success:', result?.secure_url);
                        resolve(result);
                    }
                }
            ).end(buffer);
        });

        return NextResponse.json({ 
            url: (result as any).secure_url,
            public_id: (result as any).public_id 
        });

    } catch (error) {
        console.error('❌ Upload error:', error);
        
        // Better error handling - log the full error object
        console.error('❌ Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            name: error instanceof Error ? error.name : undefined,
            cause: error instanceof Error ? error.cause : undefined
        });
        
        // Return detailed error information
        return NextResponse.json({ 
            error: 'Upload failed',
            details: error instanceof Error ? error.message : String(error),
            type: typeof error,
            errorName: error instanceof Error ? error.name : 'Unknown'
        }, { status: 500 });
    }
}