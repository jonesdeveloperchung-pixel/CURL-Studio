import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const environments = await prisma.environment.findMany({
      include: {
        variables: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(environments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch environments' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, variables } = await req.json();
    const environment = await prisma.environment.create({
      data: {
        name,
        variables: {
          create: variables || []
        }
      },
      include: {
        variables: true
      }
    });
    return NextResponse.json(environment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create environment' }, { status: 500 });
  }
}
