import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper to check if curl exists
async function hasCurl() {
  try {
    await execAsync('curl --version');
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { method, url, headers, body } = await req.json();
    const useCurl = await hasCurl();

    if (useCurl) {
      return await executeWithCurl(method, url, headers, body);
    } else {
      return await executeProgrammatically(method, url, headers, body);
    }

  } catch (error: any) {
    console.error('Execution Error:', error);
    return NextResponse.json({
      error: error.message,
      status: 0
    }, { status: 500 });
  }
}

async function executeWithCurl(method: string, url: string, headers: any, body: any) {
  let curlCommand = `curl -i -s -X ${method} "${url}"`;

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      curlCommand += ` -H "${key}: ${value}"`;
    });
  }

  if (body && method !== 'GET') {
    const escapedBody = body.replace(/'/g, "'\'\''");
    curlCommand += ` -d '${escapedBody}'`;
  }

  const { stdout } = await execAsync(curlCommand, { timeout: 30000 });
  
  const parts = stdout.split('\r\n\r\n');
  const finalParts = parts.length < 2 ? stdout.split('\n\n') : parts;
  
  return parseCurlResponse(finalParts);
}

async function executeProgrammatically(method: string, url: string, headers: any, body: any) {
  console.log("Curl not found. Falling back to programmatic fetch.");
  
  const startTime = Date.now();
  const response = await fetch(url, {
    method,
    headers,
    body: method !== 'GET' ? body : undefined,
    signal: AbortSignal.timeout(30000)
  });

  const bodyText = await response.text();
  let parsedBody;
  try {
    parsedBody = JSON.parse(bodyText);
  } catch {
    parsedBody = bodyText;
  }

  return NextResponse.json({
    status: response.status,
    body: parsedBody,
    size: (Buffer.byteLength(bodyText) / 1024).toFixed(2) + ' KB',
    engine: 'native-fetch'
  });
}

function parseCurlResponse(parts: string[]) {
  const headerSection = parts[0];
  const bodySection = parts.slice(1).join('\n\n');

  const statusLine = headerSection.split('\n')[0];
  const statusMatch = statusLine.match(/HTTP\/[\d.]+ (\d+)/);
  const status = statusMatch ? parseInt(statusMatch[1]) : 200;

  let parsedBody;
  try {
    parsedBody = JSON.parse(bodySection);
  } catch {
    parsedBody = bodySection;
  }

  return NextResponse.json({
    status,
    body: parsedBody,
    size: (Buffer.byteLength(bodySection) / 1024).toFixed(2) + ' KB',
    engine: 'curl-binary'
  });
}