import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Increment view count
    const job = await prisma.job.update({
      where: { id },
      data: {
        views: {
          increment: 1
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    return NextResponse.json({
      job: {
        ...job,
        postingDate: job.postingDate?.toISOString(),
        expirationDate: job.expirationDate?.toISOString() ?? null,
        createdAt: job.createdAt.toISOString(),
        updatedAt: job.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    return NextResponse.json({ error: 'Failed to fetch job' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.job.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Extract updateable fields
    const {
      title,
      jobDescription,
      jobType,
      categories,
      location,
      salaryFrom,
      salaryTo,
      salaryFrequency,
      howToApply,
      applyValue,
      status,
      expirationDate
    } = body;

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title,
        jobDescription,
        jobType,
        categories,
        location,
        salaryFrom: salaryFrom ? salaryFrom.toString() : null,
        salaryTo: salaryTo ? salaryTo.toString() : null,
        salaryFrequency,
        howToApply,
        applyValue,
        status,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Job updated successfully',
      job: updatedJob
    });
  } catch (error) {
    console.error('Error updating job:', error);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
