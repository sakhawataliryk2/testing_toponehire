import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
    try {
        const settings = await (prisma as any).systemSetting.findMany();

        // Convert to a key-value object for easier frontend use
        const settingsObj = settings.reduce((acc: any, setting: any) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});

        return NextResponse.json({ settings: settingsObj });
    } catch (error: any) {
        console.error('Error fetching system settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings', details: error?.message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { settings } = body; // This should be an object of key-value pairs

        if (!settings || typeof settings !== 'object') {
            return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 });
        }

        // Update or create each setting
        const updatePromises = Object.entries(settings).map(([key, value]) => {
            return (prisma as any).systemSetting.upsert({
                where: { key },
                update: { value: String(value) },
                create: { key, value: String(value) },
            });
        });

        await Promise.all(updatePromises);

        return NextResponse.json({ message: 'Settings saved successfully' });
    } catch (error: any) {
        console.error('Error saving system settings:', error);
        return NextResponse.json(
            { error: 'Failed to save settings', details: error?.message },
            { status: 500 }
        );
    }
}
