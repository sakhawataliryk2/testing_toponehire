import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const employer = searchParams.get('employer');
    const featured = searchParams.get('featured');
    const limitParam = searchParams.get('limit');
    const take = limitParam ? Math.min(parseInt(limitParam, 10) || 50, 100) : undefined;

    const where: any = {};

    if (employer) {
      where.OR = [
        { employer: { equals: employer, mode: 'insensitive' } },
      ];
    }

    if (search) {
      const searchFilter = [
        { title: { contains: search, mode: 'insensitive' } },
        { employer: { contains: search, mode: 'insensitive' } },
      ];
      if (where.OR) {
        // Handle both employer filter and search
        where.AND = [
          { OR: where.OR },
          { OR: searchFilter }
        ];
        delete where.OR;
      } else {
        where.OR = searchFilter;
      }
    }

    if (status && status !== 'Any Status') {
      where.status = status;
    } else {
      // For public jobs page, default to Active jobs
      where.status = 'Active';
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (searchParams.get('countOnly') === 'true') {
      const count = await prisma.job.count({ where });
      return NextResponse.json({ count });
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { postingDate: 'desc' },
      ...(take && { take }),
    });

    return NextResponse.json({ jobs, count: jobs.length });
  } catch (error: any) {
    console.error('Error fetching jobs:', error);
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development'
      ? error?.message || String(error)
      : 'Failed to fetch jobs';
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      employer,
      product,
      jobDescription,
      jobType,
      categories,
      location,
      salaryFrom,
      salaryTo,
      salaryFrequency,
      howToApply,
      applyValue,
      featured,
      status,
      expirationDate,
    } = body;

    // Validate required fields
    if (!title || !employer || !jobDescription || !jobType || !categories) {
      return NextResponse.json(
        { error: 'Missing required fields: title, employer, jobDescription, jobType, categories' },
        { status: 400 }
      );
    }

    // Check for logical duplicates within the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingJob = await prisma.job.findFirst({
      where: {
        title,
        employer,
        jobType,
        postingDate: {
          gte: tenMinutesAgo
        }
      }
    });

    if (existingJob) {
      return NextResponse.json(
        { error: 'A similar job was already posted recently. Please check your job list.' },
        { status: 409 }
      );
    }

    const job = await prisma.job.create({
      data: {
        title,
        employer,
        product: product || null,
        jobDescription,
        jobType,
        categories,
        location: location || 'Onsite',
        salaryFrom: salaryFrom || null,
        salaryTo: salaryTo || null,
        salaryFrequency: salaryFrequency || 'yearly',
        howToApply: howToApply || 'email',
        applyValue: applyValue || null,
        featured: featured || false,
        status: status || 'Active',
        expirationDate: expirationDate ? new Date(expirationDate) : null,
      },
    });

    return NextResponse.json({ job }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating job:', error);
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development'
      ? error?.message || String(error)
      : 'Failed to create job';
    return NextResponse.json(
      { error: 'Failed to create job', details: errorMessage },
      { status: 500 }
    );
  }
}
