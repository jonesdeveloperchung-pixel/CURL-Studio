import { NextRequest, NextResponse } from 'next/server';
import { exportToPostman } from '@/lib/importers';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postmanJson = await exportToPostman(id);
    return NextResponse.json(postmanJson);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export collection' }, { status: 500 });
  }
}