import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            jobSeekerId,
            desiredJobTitle,
            jobType,
            categories,
            personalSummary,
            resumeFileUrl,
            location,
            phone,
            letEmployersFind,
            status,
            workExperience,
            education,
        } = body;

        if (!jobSeekerId) {
            return NextResponse.json({ error: 'jobSeekerId is required' }, { status: 400 });
        }
        if (!desiredJobTitle) {
            return NextResponse.json({ error: 'Desired job title is required' }, { status: 400 });
        }

        const resume = await prisma.resume.create({
            data: {
                jobSeekerId,
                desiredJobTitle,
                jobType: jobType || 'Full Time',
                categories: categories || '',
                personalSummary: personalSummary || '',
                resumeFileUrl: resumeFileUrl || null,
                location: location || '',
                phone: phone || '',
                letEmployersFind: letEmployersFind !== false,
                status: status || 'Active',
                workExperience: workExperience || null,
                education: education || null,
            },
        });

        return NextResponse.json({ resume }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating resume:', error);
        return NextResponse.json(
            { error: 'Failed to create resume', details: error?.message },
            { status: 500 }
        );
    }
}
