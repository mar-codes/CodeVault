import { NextResponse } from 'next/server';
import Creation from '../../../../schemas/Creations';
import connectDB from '@/lib/connectDB';

export async function GET(request) {
  try {
    await connectDB();
    const creations = await Creation.find({}).sort({ createdAt: -1 });
    return NextResponse.json(creations);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const creationId = url.pathname.split('/').pop();
    await Creation.findByIdAndDelete(creationId);
    return NextResponse.json({ message: 'Creation deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
