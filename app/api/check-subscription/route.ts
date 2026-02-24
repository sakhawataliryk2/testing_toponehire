import { NextRequest, NextResponse } from 'next/server';
import { checkEmployerSubscription } from '../../../lib/subscription-check';

export async function POST(request: NextRequest) {
  try {
    const { employerEmail } = await request.json();

    if (!employerEmail) {
      return NextResponse.json(
        { error: 'Employer email is required' },
        { status: 400 }
      );
    }

    const subscription = await checkEmployerSubscription(employerEmail);

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error checking subscription:', error);
    return NextResponse.json(
      { error: 'Failed to check subscription' },
      { status: 500 }
    );
  }
}
