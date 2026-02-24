import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const admins = await prisma.admin.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                status: true,
                notifications: true,
                createdAt: true,
            }
        });
        return NextResponse.json({ admins });
    } catch (error) {
        console.error('Error fetching admins:', error);
        return NextResponse.json({ error: 'Failed to fetch admins' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fullName, email, role, notifications } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Check if admin already exists
        const existingAdmin = await prisma.admin.findUnique({
            where: { email },
        });

        if (existingAdmin) {
            return NextResponse.json({ error: 'Admin with this email already exists' }, { status: 400 });
        }

        // Create admin - since it's an invite, we can set a dummy password or null if schema allows
        // Looking at schema, password is required. I'll set a random hash for now.
        const tempPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        const admin = await prisma.admin.create({
            data: {
                username: email, // Use email as username by default
                email,
                password: hashedPassword,
                fullName,
                role: role || 'Full Admin Access',
                status: 'Pending', // New admins are pending until they accept/login
                notifications: notifications || {},
            },
        });

        return NextResponse.json({ admin }, { status: 201 });
    } catch (error) {
        console.error('Error creating admin:', error);
        return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
    }
}
