import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const environment = await prisma.environment.findUnique({
      where: { id },
      include: { variables: true }
    });
    if (!environment) {
      return NextResponse.json({ error: 'Environment not found' }, { status: 404 });
    }
    return NextResponse.json(environment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch environment' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { name, variables } = await req.json();
    
    const updateData: any = { name };
    
    if (variables) {
      await prisma.envVariable.deleteMany({
        where: { environmentId: id }
      });
      updateData.variables = {
        create: variables
      };
    }

    const environment = await prisma.environment.update({
      where: { id },
      data: updateData,
      include: { variables: true }
    });
    return NextResponse.json(environment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update environment' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.environment.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete environment' }, { status: 500 });
  }
}