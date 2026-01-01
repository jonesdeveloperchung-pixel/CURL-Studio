import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { runScript, ScriptContext } from '@/lib/script-engine';
import { prisma } from '@/lib/prisma';
import WebSocket from 'ws';

const execAsync = promisify(exec);

async function executeWebSocket(url: string, message: string | object) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const ws = new WebSocket(url);
    let responseData = '';

    ws.on('open', () => {
      if (message) {
        ws.send(typeof message === 'string' ? message : JSON.stringify(message));
      } else {
        setTimeout(() => ws.close(), 1000);
      }
    });

    ws.on('message', (data) => {
      responseData = data.toString();
      ws.close();
    });

    ws.on('close', () => {
      resolve({
        status: 101,
        body: responseData || 'Connection closed',
        timings: { total: Date.now() - startTime },
        engine: 'ws-library'
      });
    });

    ws.on('error', (err) => {
      resolve({
        status: 0,
        body: `WebSocket Error: ${err.message}`,
        timings: { total: Date.now() - startTime },
        engine: 'ws-library'
      });
    });

    setTimeout(() => {
      if (ws.readyState !== WebSocket.CLOSED) {
        ws.close();
      }
    }, 10000);
  });
}

async function executeGrpc(_url: string, _body: unknown, _headers: unknown) {
  return {
    status: 0,
    body: "gRPC support requires a .proto file. Dynamic invocation not yet implemented in this prototype.",
    timings: { total: 0 },
    engine: 'grpc-js'
  };
}

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
    const data = await req.json();
    let method = data.method as string;
    let url = data.url as string;
    let body = data.body;
    const { preRequestScript, postResponseScript, environmentId } = data;
    const headers = data.headers as Record<string, string>;

    const variables: Record<string, string> = {};
    const dbVars = await prisma.envVariable.findMany({
      where: {
        OR: [
          { environmentId: null },
          { environmentId: environmentId || undefined }
        ],
        enabled: true
      }
    });
    dbVars.forEach(v => {
      variables[v.key] = v.value;
    });

    const resolveVars = (str: string) => {
      if (!str) return str;
      return str.replace(/\{\{(.*?)\}\\/g, (_, key) => variables[key] || `{{${key}}}`);
    };

    url = resolveVars(url);
    if (typeof body === 'string') body = resolveVars(body);
    
    const resolvedHeaders: Record<string, string> = {};
    if (headers) {
      Object.entries(headers).forEach(([k, v]) => {
        resolvedHeaders[resolveVars(k)] = resolveVars(v as string);
      });
    }

    const logs: string[] = [];
    const tests: Record<string, boolean> = {};

    const context: ScriptContext = {
      request: { method, url, headers: resolvedHeaders, body },
      variables,
      tests,
      log: (msg) => logs.push(typeof msg === 'string' ? msg : JSON.stringify(msg))
    };

    if (preRequestScript) {
      try {
        runScript(preRequestScript, context);
        method = context.request.method;
        url = context.request.url;
        body = context.request.body;
      } catch (e: any) {
        return NextResponse.json({ error: `Pre-request script failed: ${e.message}`, logs }, { status: 400 });
      }
    }

    let response: any;
    const protocol = data.protocol || 'HTTP';

    if (protocol === 'WS' || protocol === 'WebSocket') {
      response = await executeWebSocket(url, body);
    } else if (protocol === 'gRPC') {
      response = await executeGrpc(url, body, resolvedHeaders);
    } else {
      const useCurl = await hasCurl();
      if (useCurl) {
        response = await executeWithCurl(method, url, context.request.headers, body);
      } else {
        response = await executeProgrammatically(method, url, context.request.headers, body);
      }
    }

    if (postResponseScript) {
      context.response = {
        status: response.status,
        headers: response.headers || {},
        body: response.body
      };
      try {
        runScript(postResponseScript, context);
      } catch (e: any) {
        logs.push(`Post-response script failed: ${e.message}`);
      }
    }

    await prisma.history.create({
      data: {
        method,
        url,
        status: response.status,
        time: Math.round(response.timings?.total || 0),
        size: response.size,
        response: typeof response.body === 'string' ? response.body : JSON.stringify(response.body),
        headers: JSON.stringify(response.headers)
      }
    });

    return NextResponse.json({
      ...response,
      logs,
      tests,
      variables: context.variables
    });

  } catch (error: any) {
    console.error('Execution Error:', error);
    return NextResponse.json({
      error: error.message,
      status: 0
    }, { status: 500 });
  }
}

async function executeWithCurl(method: string, url: string, headers: Record<string, string>, body: any) {
  // Use a unique marker to separate HTTP response from performance metrics
  const marker = "----CURL-METRICS-SEPARATOR----";
  const writeOutFormat = `${marker}%{time_namelookup}|%{time_connect}|%{time_appconnect}|%{time_pretransfer}|%{time_redirect}|%{time_starttransfer}|%{time_total}|%{size_download}`;
  
  let curlCommand = `curl -i -s -X ${method} "${url}" -w "${writeOutFormat}"`;

  if (headers) {
    Object.entries(headers).forEach(([key, value]) => {
      curlCommand += ` -H "${key}: ${value}"`;
    });
  }

  if (body && method !== 'GET') {
    const escapedBody = typeof body === 'string' ? body.replace(/'/g, "'\\''") : JSON.stringify(body).replace(/'/g, "'\\''");
    curlCommand += ` -d '${escapedBody}'`;
  }

  const { stdout } = await execAsync(curlCommand, { timeout: 30000 });
  
  const parts = stdout.split(marker);
  const restOutput = parts[0];
  const timingsLine = parts[1] || "";

  // Parse Timings
  const timingParts = timingsLine.split('|');
  const t_dns = (parseFloat(timingParts[0]) || 0) * 1000;
  const t_connect = (parseFloat(timingParts[1]) || 0) * 1000;
  const t_appconnect = (parseFloat(timingParts[2]) || 0) * 1000;
  const t_pretransfer = (parseFloat(timingParts[3]) || 0) * 1000;
  const t_starttransfer = (parseFloat(timingParts[5]) || 0) * 1000;
  const t_total = (parseFloat(timingParts[6]) || 0) * 1000;

  const timings = {
    dns: t_dns,
    tcp: t_connect > t_dns ? t_connect - t_dns : 0,
    tls: t_appconnect > t_connect ? t_appconnect - t_connect : 0,
    ttfb: t_starttransfer,
    transfer: t_total > t_starttransfer ? t_total - t_starttransfer : 0,
    total: t_total
  };

  // Split headers and body
  // Headers and body are separated by \r\n\r\n or \n\n
  const headerEndIndex = restOutput.indexOf('\r\n\r\n');
  const separatorLength = 4;
  let bodyStartIndex = headerEndIndex + separatorLength;

  if (headerEndIndex === -1) {
    const altHeaderEndIndex = restOutput.indexOf('\n\n');
    if (altHeaderEndIndex !== -1) {
      bodyStartIndex = altHeaderEndIndex + 2;
    } else {
      bodyStartIndex = restOutput.length;
    }
  }

  const headerSection = restOutput.substring(0, bodyStartIndex).trim();
  const bodySection = restOutput.substring(bodyStartIndex);

  const statusLine = headerSection.split(/\r?\n/)[0];
  const statusMatch = statusLine.match(/HTTP\/[\d.]+ (\d+)/);
  const status = statusMatch ? parseInt(statusMatch[1]) : 200;

  const resHeaders: Record<string, string> = {};
  headerSection.split(/\r?\n/).slice(1).forEach(line => {
    const [key, ...values] = line.split(':');
    if (key && values.length) {
      resHeaders[key.trim().toLowerCase()] = values.join(':').trim();
    }
  });

  let parsedBody;
  try {
    parsedBody = JSON.parse(bodySection);
  } catch {
    parsedBody = bodySection;
  }

  return {
    status,
    body: parsedBody,
    headers: resHeaders,
    size: (Buffer.byteLength(bodySection) / 1024).toFixed(2) + ' KB',
    timings,
    engine: 'curl-binary'
  };
}

async function executeProgrammatically(method: string, url: string, headers: Record<string, string>, body: any) {
  const startTime = Date.now();
  const response = await fetch(url, {
    method,
    headers,
    body: method !== 'GET' ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
    signal: AbortSignal.timeout(30000)
  });

  const bodyText = await response.text();
  const endTime = Date.now();

  let parsedBody;
  try {
    parsedBody = JSON.parse(bodyText);
  } catch {
    parsedBody = bodyText;
  }

  const resHeaders: Record<string, string> = {};
  response.headers.forEach((v, k) => {
    resHeaders[k.toLowerCase()] = v;
  });

  return {
    status: response.status,
    body: parsedBody,
    headers: resHeaders,
    size: (Buffer.byteLength(bodyText) / 1024).toFixed(2) + ' KB',
    timings: {
      total: endTime - startTime
    },
    engine: 'native-fetch'
  };
}
