import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

interface EmployerSubscription {
  hasActiveSubscription: boolean;
  message?: string;
}

export async function checkEmployerSubscription(employerEmail: string): Promise<EmployerSubscription> {
  try {
    console.log('🔍 Checking subscription for:', employerEmail);
    
    // Find employer by email
    const employer = await prisma.employer.findUnique({
      where: { email: employerEmail },
    });

    if (!employer) {
      console.log('❌ Employer not found:', employerEmail);
      return {
        hasActiveSubscription: false,
        message: 'Employer not found. Please login again.',
      };
    }

    console.log('✅ Employer found:', employer.id);

    // Check if employer has any paid orders
    const orders = await prisma.order.findMany({
      where: {
        employerId: employer.id,
        status: 'PAID',
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('📋 Found orders:', orders.length);

    if (orders.length === 0) {
      console.log('❌ No paid orders found');
      return {
        hasActiveSubscription: false,
        message: 'No active subscription found. Please purchase a plan to post jobs.',
      };
    }

    console.log('📋 Orders:', orders.map(o => ({ id: o.id, status: o.status, product: o.product.name })));

    // SIMPLIFIED: If any paid order exists, allow job posting
    console.log('✅ Paid order found, allowing job posting!');
    return {
      hasActiveSubscription: true,
    };
  } catch (error) {
    console.error('❌ Error checking employer subscription:', error);
    return {
      hasActiveSubscription: false,
      message: 'Unable to verify subscription. Please contact support.',
    };
  }
}
