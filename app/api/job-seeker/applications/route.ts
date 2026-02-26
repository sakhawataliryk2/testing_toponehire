import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const applications = await (prisma as any).application.findMany({
            where: {
                applicantEmail: { equals: email, mode: 'insensitive' }
            },
            orderBy: { applicationDate: 'desc' },
        });

        return NextResponse.json({ applications, total: applications.length });
    } catch (error: any) {
        console.error('Error fetching job seeker applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch applications', details: error?.message },
            { status: 500 }
        );
    }
}
