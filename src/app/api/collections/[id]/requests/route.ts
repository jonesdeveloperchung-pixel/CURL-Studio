import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: collectionId } = await params;
    const { name, method, url, headers, body } = await req.json();

    const request = await prisma.request.create({
      data: {
        name,
        method,
        url,
        headers: JSON.stringify(headers),
        body,
        collectionId
      }
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error('Failed to create request in collection:', error);
    return NextResponse.json({ error: 'Failed to create request in collection' }, { status: 500 });
  }
}
