import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function GET(request) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const timestamp = Math.round(new Date().getTime() / 1000);
        
        const signature = cloudinary.utils.api_sign_request({
            timestamp: timestamp,
            folder: 'avatars',
            upload_preset: 'codevault_avatars'
        }, process.env.CLOUDINARY_API_SECRET);

        return NextResponse.json({ timestamp, signature });
    } catch (error) {
        console.error('Error generating signature:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
