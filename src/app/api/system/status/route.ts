import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  const status = {
    curl: false,
    activeEngine: 'native-fetch',
    database: true,
  };

  try {
    await execAsync('curl --version');
    status.curl = true;
    status.activeEngine = 'curl-binary';
  } catch (e) {
    status.curl = false;
    status.activeEngine = 'native-fetch';
  }

  return NextResponse.json(status);
}
