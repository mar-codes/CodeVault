import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const userId = decoded.userId || decoded._id || decoded.id;
        if (!userId) {
            return NextResponse.json({ error: 'User ID not found in token' }, { status: 400 });
        }

        const formData = await request.formData();
        const file = formData.get('file');
        
        console.log(`Received file from user ${userId}:`, file ? `${file.name} (${file.size} bytes)` : "No file");

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        const dataURI = `data:${file.type};base64,${base64Image}`;

        const folderPath = `avatars/user_${userId}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: folderPath,
            public_id: `avatar_${Date.now()}`, 
            resource_type: 'image',
            transformation: [
                { width: 500, height: 500, crop: 'limit' }
            ]
        });

        console.log(`Cloudinary upload successful for user ${userId}:`, result.secure_url);

        return NextResponse.json({
            url: result.secure_url,
            public_id: result.public_id,
            userId: userId
        });
    } catch (error) {
        console.error('Error in avatar upload:', error);
        return NextResponse.json(
            { error: 'Failed to upload file: ' + (error.message || 'Unknown error') },
            { status: 500 }
        );
    }
}
