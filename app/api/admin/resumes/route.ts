import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const keywords = searchParams.get('keywords') || '';
        const email = searchParams.get('email') || '';
        const status = searchParams.get('status') || '';
        const dateFrom = searchParams.get('dateFrom') || '';
        const dateTo = searchParams.get('dateTo') || '';

        const where: any = {};

        if (keywords) {
            where.OR = [
                { desiredJobTitle: { contains: keywords, mode: 'insensitive' } },
                { personalSummary: { contains: keywords, mode: 'insensitive' } },
                { categories: { contains: keywords, mode: 'insensitive' } },
            ];
        }

        if (email) {
            where.jobSeeker = { email: { contains: email, mode: 'insensitive' } };
        }

        if (status && status !== 'Any Status') {
            where.status = status;
        }

        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom);
            if (dateTo) {
                const end = new Date(dateTo);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }

        const resumes = await prisma.resume.findMany({
            where,
            include: {
                jobSeeker: {
                    select: { firstName: true, lastName: true, email: true, phone: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ resumes, total: resumes.length });
    } catch (error: any) {
        console.error('Error fetching resumes:', error);
        return NextResponse.json({ error: 'Failed to fetch resumes', details: error?.message }, { status: 500 });
    }
}
