import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ollamaIp = searchParams.get('ip');

    if (!ollamaIp) {
      return NextResponse.json({ error: 'Missing IP parameter' }, { status: 400 });
    }

    const baseUrl = ollamaIp === 'localhost' ? 'http://localhost:11434' : `http://${ollamaIp}:11434`;
    
    const response = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error(`Ollama server returned ${response.status}`);
    }

    const data = await response.json();
    // Map names to a simple array
    const models = data.models?.map((m: any) => m.name) || [];
    return NextResponse.json({ models });

  } catch (error: any) {
    console.error('AI Models Proxy Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
