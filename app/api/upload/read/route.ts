import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const fileName = searchParams.get('file');
        const folder = searchParams.get('folder') || 'resumes';

        if (!fileName) {
            return new NextResponse('File parameter missing', { status: 400 });
        }

        // Determine the directory based on environment
        const isVercel = process.env.VERCEL === '1';
        const uploadDir = isVercel
            ? path.join('/tmp', folder)
            : path.join(process.cwd(), 'public', 'uploads', folder);

        const filePath = path.join(uploadDir, fileName);

        try {
            const fileBuffer = await readFile(filePath);

            const ext = path.extname(fileName).toLowerCase();
            let contentType = 'application/octet-stream';
            if (ext === '.pdf') contentType = 'application/pdf';
            else if (ext === '.doc') contentType = 'application/msword';
            else if (ext === '.docx') contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `inline; filename="${fileName}"`,
                },
            });
        } catch (err) {
            return new NextResponse('File not found', { status: 404 });
        }
    } catch (error) {
        return new NextResponse('Server Error', { status: 500 });
    }
}
