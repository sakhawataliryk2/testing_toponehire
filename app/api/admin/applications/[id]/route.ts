import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status } = body;

        const application = await (prisma as any).application.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json({ application });
    } catch (error: any) {
        console.error('Error updating application:', error);
        return NextResponse.json(
            { error: 'Failed to update application', details: error?.message },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await (prisma as any).application.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting application:', error);
        return NextResponse.json(
            { error: 'Failed to delete application', details: error?.message },
            { status: 500 }
        );
    }
}
