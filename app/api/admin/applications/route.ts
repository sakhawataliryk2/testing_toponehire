import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const jobTitle = searchParams.get('jobTitle') || '';
        const companyName = searchParams.get('companyName') || '';
        const applicantSearch = searchParams.get('applicant') || '';
        const status = searchParams.get('status') || '';

        const where: any = {};

        if (jobTitle) {
            where.jobTitle = { contains: jobTitle, mode: 'insensitive' };
        }
        if (companyName) {
            where.companyName = { contains: companyName, mode: 'insensitive' };
        }
        if (applicantSearch) {
            where.OR = [
                { applicantName: { contains: applicantSearch, mode: 'insensitive' } },
                { applicantEmail: { contains: applicantSearch, mode: 'insensitive' } },
            ];
        }
        if (status && status !== 'Any status') {
            where.status = status;
        }

        const applications = await (prisma as any).application.findMany({
            where,
            orderBy: { applicationDate: 'desc' },
        });

        return NextResponse.json({ applications, total: applications.length });
    } catch (error: any) {
        console.error('Error fetching applications:', error);
        return NextResponse.json(
            { error: 'Failed to fetch applications', details: error?.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            jobId, jobTitle, companyName, applicantName,
            applicantEmail, applicantPhone, resumeTitle, coverLetter
        } = body;

        if (!jobTitle || !companyName || !applicantName || !applicantEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const application = await (prisma as any).application.create({
            data: {
                jobId: jobId || '',
                jobTitle,
                companyName,
                applicantName,
                applicantEmail,
                applicantPhone: applicantPhone || null,
                resumeTitle: resumeTitle || null,
                coverLetter: coverLetter || null,
                status: 'New',
            },
        });

        return NextResponse.json({ application }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating application:', error);
        return NextResponse.json(
            { error: 'Failed to create application', details: error?.message },
            { status: 500 }
        );
    }
}
