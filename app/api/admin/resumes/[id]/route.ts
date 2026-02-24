import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const resume = await prisma.resume.findUnique({
            where: { id },
            include: {
                jobSeeker: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        location: true,
                    }
                }
            },
        });

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        return NextResponse.json({ resume });
    } catch (error: any) {
        console.error('Error fetching resume:', error);
        return NextResponse.json(
            { error: 'Failed to fetch resume', details: error?.message },
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
        await prisma.resume.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Resume deleted successfully' });
    } catch (error: any) {
        console.error('Error deleting resume:', error);
        return NextResponse.json(
            { error: 'Failed to delete resume', details: error?.message },
            { status: 500 }
        );
    }
}
