import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { ollamaIp, prompt, model } = await req.json();

    if (!ollamaIp || !prompt || !model) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const baseUrl = ollamaIp === 'localhost' ? 'http://localhost:11434' : `http://${ollamaIp}:11434`;
    
    console.log(`Forwarding AI request to: ${baseUrl}/api/generate using model: ${model}`);

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: `You are an API assistant. Generate a JSON representing an HTTP request based on this requirement: "${prompt}". 
        Return ONLY a JSON object with fields: "method", "url", "headers" (object), and "body" (string or null). 
        Example: {"method": "GET", "url": "https://api.example.com", "headers": {"Content-Type": "application/json"}, "body": null}`,
        stream: false
      }),
      // Add a timeout to avoid hanging - increased to 90s for larger models
      signal: AbortSignal.timeout(90000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ollama Error (${response.status}):`, errorText);
      return NextResponse.json({ error: `Ollama server error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ 
      error: error.name === 'TimeoutError' ? 'AI engine timed out' : error.message 
    }, { status: 500 });
  }
}
