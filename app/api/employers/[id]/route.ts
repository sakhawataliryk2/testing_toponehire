import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const employer = await prisma.employer.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        location: true,
        companyName: true,
        website: true,
        logoUrl: true,
        companyDescription: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!employer) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    return NextResponse.json({ employer });
  } catch (error) {
    console.error('Error fetching employer:', error);
    return NextResponse.json({ error: 'Failed to fetch employer' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { companyName, website, location, phone, companyDescription, currentPassword, newPassword } = body;

    const existing = await prisma.employer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
    }

    const updateData: any = {
      companyName: companyName || undefined,
      website: website || undefined,
      location: location || undefined,
      phone: phone || undefined,
      companyDescription: companyDescription || undefined,
    };

    if (currentPassword != null && newPassword != null && newPassword.trim() !== '') {
      const valid = await bcrypt.compare(currentPassword, existing.password);
      if (!valid) {
        return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      updateData.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    const employer = await prisma.employer.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        location: true,
        companyName: true,
        website: true,
        logoUrl: true,
        companyDescription: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ employer });
  } catch (error) {
    console.error('Error updating employer:', error);
    return NextResponse.json({ error: 'Failed to update employer' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.employer.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Employer deleted successfully' });
  } catch (error) {
    console.error('Error deleting employer:', error);
    return NextResponse.json({ error: 'Failed to delete employer' }, { status: 500 });
  }
}
