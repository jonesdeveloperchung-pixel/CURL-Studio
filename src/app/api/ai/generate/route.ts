import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { ollamaIp, prompt, model, mode = 'generate_request' } = await req.json();

    if (!ollamaIp || !prompt || !model) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const baseUrl = ollamaIp === 'localhost' ? 'http://localhost:11434' : `http://${ollamaIp}:11434`;
    
    let systemPrompt = "";
    if (mode === 'suggest_headers') {
      systemPrompt = `You are an API assistant. Suggest a JSON object of common and necessary HTTP headers for this request: "${prompt}". 
      Return ONLY a JSON object where keys are header names and values are header values.
      Example: {"Content-Type": "application/json", "Authorization": "Bearer <token>"}`;
    } else if (mode === 'suggest_assertions') {
      systemPrompt = `You are an API assistant. Suggest JavaScript assertions using the "pm.expect" syntax for this API response description: "${prompt}". 
      Return ONLY a JSON array of strings, where each string is a line of JavaScript code.
      Example: ["pm.test('Status is 200', () => { pm.response.to.be(200); });", "pm.test('Body has id', () => { pm.expect(pm.response.json().id).to.be(1); });"]`;
    } else {
      // default: generate_request
      systemPrompt = `You are an API assistant. Generate a JSON representing an HTTP request based on this requirement: "${prompt}". 
      Return ONLY a JSON object with fields: "method", "url", "headers" (object), and "body" (string or null). 
      Example: {"method": "GET", "url": "https://api.example.com", "headers": {"Content-Type": "application/json"}, "body": null}`;
    }

    console.log(`Forwarding AI request (${mode}) to: ${baseUrl}/api/generate using model: ${model}`);

    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model,
        prompt: systemPrompt,
        stream: false,
        options: {
          temperature: 0.2 // Lower temperature for more structured output
        }
      }),
      signal: AbortSignal.timeout(90000)
    });

    if (!response.ok) {
      const errorText = await response.text();
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
