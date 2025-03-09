import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import Creation from '../../../../../schemas/Creations';
import User from '../../../../../schemas/User';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { userID } = params;
        
        if (!userID) {
            return NextResponse.json({ 
                success: false, 
                error: 'User ID is required' 
            }, { status: 400 });
        }

        const user = await User.findById(userID);
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                error: 'User not found' 
            }, { status: 404 });
        }

        const userCreations = await Creation.find({ author: userID })
            .sort({ updatedAt: -1 })
            .lean();
        
        return NextResponse.json({
            success: true,
            creations: userCreations,
            count: userCreations.length
        });
    } catch (error) {
        console.error('Error fetching user creations:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
