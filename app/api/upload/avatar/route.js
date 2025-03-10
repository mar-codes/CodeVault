import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/connectDB';
import User from '@/schemas/User';
import { validateImageUpload } from '@/middleware/fileValidation';

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

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const fileForValidation = {
            mimetype: file.type,
            size: file.size,
            buffer: await file.arrayBuffer()
        };

        try {
            await validateImageUpload({ file: fileForValidation });
        } catch (validationError) {
            return NextResponse.json({ error: validationError.message }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');
        const dataURI = `data:${file.type};base64,${base64Image}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'avatars',
            upload_preset: 'codevault_avatars'
        });

        return NextResponse.json({
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Error in avatar upload:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
