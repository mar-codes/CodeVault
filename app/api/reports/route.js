import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Report from '@/schemas/Report';

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { title, description, type, pageUrl, priority, userId } = body;

    const report = await Report.create({
      title,
      description,
      type,
      pageUrl,
      priority,
      userId: userId || null,
      isAnonymous: !userId
    });

    return NextResponse.json({
      success: true,
      data: report
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}
