import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const resumes = await prisma.resume.findMany({
            include: {
                jobSeeker: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ resumes });
    } catch (error: any) {
        console.error('Error fetching resumes for admin:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resumes', details: error?.message },
            { status: 500 }
        );
    }
}
