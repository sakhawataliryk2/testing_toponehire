import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const [
            jobsCount,
            employerCount,
            jobSeekerCount,
            resumesCount,
            orders
        ] = await Promise.all([
            prisma.job.count(),
            prisma.employer.count(),
            prisma.jobSeeker.count(),
            prisma.resume.count(),
            prisma.order.findMany({
                where: { status: 'PAID' },
                select: { total: true }
            })
        ]);

        const totalSales = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);

        return NextResponse.json({
            stats: {
                sales: `$${totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                jobsPosted: jobsCount.toString(),
                employers: employerCount.toString(),
                jobSeekers: jobSeekerCount.toString(),
                resumes: resumesCount.toString(),
                // Add more as needed
            }
        });
    } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        );
    }
}
