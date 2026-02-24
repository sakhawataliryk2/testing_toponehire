import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';

        const where: any = {};
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
            ];
        }

        const jobSeekers = await prisma.jobSeeker.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                location: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });

        return NextResponse.json({ jobSeekers, total: jobSeekers.length });
    } catch (error: any) {
        console.error('Error fetching job seekers:', error);
        return NextResponse.json({ error: 'Failed to fetch job seekers', details: error?.message }, { status: 500 });
    }
}
