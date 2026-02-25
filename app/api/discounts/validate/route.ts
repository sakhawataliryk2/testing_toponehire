import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, productId, userId } = body;

        if (!code) {
            return NextResponse.json({ error: 'Discount code is required' }, { status: 400 });
        }

        // Use type casting to bypass Prisma generation issues if needed
        const discount = await (prisma as any).discount.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!discount) {
            return NextResponse.json({ error: 'Invalid discount code' }, { status: 404 });
        }

        // Check status
        if (discount.status !== 'ACTIVE') {
            return NextResponse.json({ error: 'This discount code is not active' }, { status: 400 });
        }

        // Check dates
        const now = new Date();
        if (new Date(discount.startDate) > now) {
            return NextResponse.json({ error: 'This discount code is not yet valid' }, { status: 400 });
        }
        if (discount.expiryDate && new Date(discount.expiryDate) < now) {
            return NextResponse.json({ error: 'This discount code has expired' }, { status: 400 });
        }

        // Check max uses
        if (discount.maxUses > 0 && discount.usedCount >= discount.maxUses) {
            return NextResponse.json({ error: 'This discount code has reached its usage limit' }, { status: 400 });
        }

        // Check appliesTo
        if (discount.appliesTo && discount.appliesTo !== 'All') {
            const applicableProducts = discount.appliesTo.split(',').map((s: string) => s.trim());

            const product = await prisma.product.findUnique({ where: { id: productId } });

            const isMatch = product && (
                applicableProducts.includes(product.id) ||
                applicableProducts.includes(product.name)
            );

            if (!isMatch) {
                return NextResponse.json({ error: 'This discount code is not applicable to this product' }, { status: 400 });
            }
        }

        // In a real app, we'd check maxUsesPerUser here as well if userId is provided
        // For now, return the discount details
        return NextResponse.json({
            valid: true,
            discount: {
                id: discount.id,
                code: discount.code,
                type: discount.type,
                value: Number(discount.value),
            }
        });

    } catch (error: any) {
        console.error('Error validating discount:', error);
        return NextResponse.json({ error: 'Failed to validate discount code' }, { status: 500 });
    }
}
