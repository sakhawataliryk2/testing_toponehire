import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const companyName = searchParams.get('companyName') || '';

        if (!companyName) {
            return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
        }

        const applications = await (prisma as any).application.findMany({
            where: {
                companyName: { equals: companyName, mode: 'insensitive' }
            },
            orderBy: { applicationDate: 'desc' },
        });

        return NextResponse.json({ applications, total: applications.length });
    } catch (error: any) {
        console.error('Error fetching employer applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch applications', details: error?.message },
            { status: 500 }
        );
    }
}
