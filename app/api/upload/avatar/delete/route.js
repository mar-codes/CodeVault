import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import User from '@/schemas/User';
import { getPublicIdFromUrl } from '@/lib/cloudinary';

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

        const { url, publicId } = await request.json();

        if (!url && !publicId) {
            return NextResponse.json({ error: 'No URL or Public ID provided' }, { status: 400 });
        }

        const urlParts = url.split('/upload/');
        if (urlParts.length !== 2) {
            return NextResponse.json({ error: 'Invalid avatar URL format' }, { status: 400 });
        }


        let cloudinaryPublicId = urlParts[1].split('.')[0];
        
        cloudinaryPublicId = cloudinaryPublicId.replace(/^v\d+\//, '');
        

        const userFolder = `user_${userId}`;
        if (!cloudinaryPublicId.includes(userFolder)) {
            console.warn(`Security: User ${userId} attempted to delete avatar not in their folder: ${cloudinaryPublicId}`);
            return NextResponse.json({ error: 'You can only delete your own avatar' }, { status: 403 });
        }

        const result = await cloudinary.uploader.destroy(cloudinaryPublicId);

        if (result.result !== 'ok') {
            console.error(`Failed to delete avatar: ${result.result}`);
            throw new Error(`Failed to delete from Cloudinary: ${result.result}`);
        }

        await connectDB();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        user.avatar = null;
        await user.save();

        return NextResponse.json({ 
            success: true,
            message: 'Avatar deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting avatar:', error);
        return NextResponse.json(
            { error: 'Failed to delete avatar: ' + (error.message || 'Unknown error') },
            { status: 500 }
        );
    }
}
