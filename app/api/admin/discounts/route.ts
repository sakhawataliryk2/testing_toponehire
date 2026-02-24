import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  try {
    const discounts = await (prisma as any).discount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const serialized = discounts.map((d: any) => ({ ...d, value: Number(d.value) }));
    return NextResponse.json({ discounts: serialized });
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json({ error: 'Failed to fetch discounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, type, value, maxUses, maxUsesPerUser, appliesTo, startDate, expiryDate, status } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: code, type, value' },
        { status: 400 }
      );
    }

    if (type !== 'PERCENT' && type !== 'FIXED') {
      return NextResponse.json({ error: 'Invalid type. Use PERCENT or FIXED' }, { status: 400 });
    }

    const discount = await (prisma as any).discount.create({
      data: {
        code: String(code).trim().toUpperCase(),
        type,
        value: Number(value),
        maxUses: maxUses != null ? Math.max(0, parseInt(String(maxUses), 10)) : 1,
        maxUsesPerUser: maxUsesPerUser != null ? Math.max(0, parseInt(String(maxUsesPerUser), 10)) : 1,
        appliesTo: appliesTo || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        status: status === 'ACTIVE' ? 'ACTIVE' : status === 'EXPIRED' ? 'EXPIRED' : status === 'PENDING_USED' ? 'PENDING_USED' : 'NOT_ACTIVE',
      },
    });
    return NextResponse.json({ discount: { ...discount, value: Number(discount.value) } }, { status: 201 });
  } catch (error) {
    console.error('Error creating discount:', error);
    return NextResponse.json({ error: 'Failed to create discount' }, { status: 500 });
  }
}
