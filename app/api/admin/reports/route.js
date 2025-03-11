import { NextResponse } from 'next/server';
import Report from '../../../../schemas/Report';
import connectDB from '@/lib/connectDB';

export async function GET(request) {
  try {
    await connectDB();
    const reports = await Report.find({}).sort({ createdAt: -1 });
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const { reportId, status } = await request.json();
    await Report.findByIdAndUpdate(reportId, { status });
    return NextResponse.json({ message: 'Report status updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
