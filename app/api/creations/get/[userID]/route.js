import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import Creation from '../../../../../schemas/Creations';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { userID } = await params;
        
        if (!userID || userID === "undefined") {
            return NextResponse.json({ 
                success: false, 
                error: 'Valid User ID is required' 
            }, { status: 400 });
        }

        const query = { owner: userID };
        console.log('Query:', query);

        const userCreations = await Creation.find(query)
            .sort({ updatedAt: -1 })
            .lean();
            
        console.log('Found creations for user:', userCreations);

        if (!userCreations || userCreations.length === 0) {
            return NextResponse.json({
                success: true,
                creations: [],
                count: 0,
                message: 'No creations found for this user'
            });
        }
        
        return NextResponse.json({
            success: true,
            creations: userCreations,
            count: userCreations.length
        });
    } catch (error) {
        console.error('Error in GET creations:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}