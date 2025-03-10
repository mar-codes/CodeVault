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

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const body = await request.json();
        const { url } = body;
        
        if (!url) {
            return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
        }

        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        const fileNameWithoutExtension = fileName.split('.')[0];
        const folderPath = url.match(/\/avatars\/([^\/]+)/);
        
        let publicId;
        if (folderPath && folderPath[1]) {
            publicId = `avatars/${folderPath[1]}`;
        } else {
            publicId = `avatars/${fileNameWithoutExtension}`;
        }

        const result = await cloudinary.uploader.destroy(publicId);
        
        return NextResponse.json({ 
            result,
            message: 'Avatar deleted successfully' 
        });
    } catch (error) {
        console.error('Error in avatar deletion:', error);
        return NextResponse.json(
            { error: 'Failed to delete avatar' },
            { status: 500 }
        );
    }
}
