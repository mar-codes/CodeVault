import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/schemas/User';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { userId } = await params;

        const user = await User.findById(userId).select({
            password: 0,
            __v: 0
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json(
            { error: 'Failed to fetch user' },
            { status: 500 }
        );
    }
}
