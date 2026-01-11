"use client";

import { useState } from 'react';
import { CldImage } from 'next-cloudinary';
import AvatarPlaceholder from './AvatarPlaceholder';

interface ProfilePictureUploadProps {
    currentImageUrl?: string | null;
    onImageUpdate: (imageUrl: string, description: string) => void;
    isOwnProfile: boolean;
}

export default function ProfilePictureUpload({
    currentImageUrl,
    onImageUpdate,
    isOwnProfile
}: ProfilePictureUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentImageUrl);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith(`image/`)) {
            alert(`Please select an image file`);
            return;
        }

        console.log('🔍 File details:', {
            name: file.name,
            type: file.type,
            size: file.size
        });

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append(`file`, file);

            console.log('🚀 Making upload request...');
            const response = await fetch(`/api/upload`, {
                method: `POST`,
                body: formData,
            });

            console.log('📡 Response received:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok
            });

            // Get the response text to see what error message is being returned
            const responseText = await response.text();
            console.log('📄 Response body:', responseText);

            if (!response.ok) {
                // Try to parse as JSON to get the error message
                try {
                    const errorData = JSON.parse(responseText);
                    throw new Error(`Upload failed: ${errorData.error || responseText}`);
                } catch {
                    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
                }
            }

            const data = JSON.parse(responseText);
            const { url } = data;
            setPreviewUrl(url);
            onImageUpdate(url, '');

        } catch (error) {
            console.error('❌ Upload error:', error);
            alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                {previewUrl ? (
                    <CldImage
                        src={previewUrl}
                        alt="Profile picture"
                        width={128}
                        height={128}
                        crop="fill"
                        className="object-cover"
                    />
                ) : (
                    <AvatarPlaceholder size={128} className="mb-2 mx-auto" />
                )}
            </div>
            
            {isOwnProfile && (
                <>
                    <div className="flex items-center justify-center">
                        <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            uploading
                                ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}>
                            {uploading ? 'Uploading...' : 'Change Picture'}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={uploading}
                                className="hidden"
                            />
                        </label>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        JPG, PNG, or WebP. Max 5MB.
                    </p>
                </>
            )}
        </div>
    );
}