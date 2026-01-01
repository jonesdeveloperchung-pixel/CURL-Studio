import { NextRequest, NextResponse } from 'next/server';
import { importPostmanCollection } from '@/lib/importers';

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    // Detect format (basic detection for Postman v2.1)
    if (json.info && json.info.schema && json.info.schema.includes('postman')) {
      const collection = await importPostmanCollection(json);
      return NextResponse.json(collection);
    }
    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Failed to import collection' }, { status: 500 });
  }
}
