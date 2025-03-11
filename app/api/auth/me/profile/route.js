import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/schemas/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

function extractPublicIdFromUrl(url) {
    if (!url) return null;
    
    try {
        const matches = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
        return matches && matches[1];
    } catch (error) {
        console.error("Error extracting public ID:", error);
        return null;
    }
}

async function deleteCloudinaryImage(publicId) {
    if (!publicId) return;
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/upload/remove`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ publicId }),
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to delete image:", errorData);
        }
        
        return response.ok;
    } catch (error) {
        console.error("Error deleting cloudinary image:", error);
        return false;
    }
}

export async function PUT(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const data = await request.json();
        
        await connectDB();

        const currentUser = await User.findById(decoded.userId);
        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (data.avatar && data.avatar !== currentUser.avatar) {
            const oldAvatarPublicId = extractPublicIdFromUrl(currentUser.avatar);
            
            if (oldAvatarPublicId) {
                await deleteCloudinaryImage(oldAvatarPublicId);
                console.log(`Deleted old avatar: ${oldAvatarPublicId}`);
            }
        }

        const updates = {
            avatar: data.avatar || currentUser.avatar,
            displayName: data.displayName,
            username: data.username,
            bio: data.bio,
            location: data.location,
            website: data.website,
            github: data.github,
            twitter: data.twitter,
            skills: Array.isArray(data.skills) ? data.skills : currentUser.skills,
            bannerColor: typeof data.bannerColor === 'number' ? data.bannerColor : currentUser.bannerColor
        };

        Object.keys(updates).forEach(key => 
            updates[key] === undefined && delete updates[key]
        );

        const updatedUser = await User.findByIdAndUpdate(
            decoded.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
        }

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ 
            error: error.name === 'ValidationError' 
                ? Object.values(error.errors).map(e => e.message).join(', ')
                : "Failed to update profile: " + (error.message || "Unknown error")
        }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await connectDB();

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
