import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'resumes';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type for resumes
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOC, and DOCX files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB for resumes)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}-${randomString}.${fileExt}`;

    let fileUrl = '';

    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url') {
      // Upload to Supabase Storage if configured
      const { createClient } = require('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseKey) {
        throw new Error('Supabase URL is defined, but no valid API Key (anon/service_role) was found in environment variables.');
      }

      const supabase = createClient(supabaseUrl, supabaseKey);

      // Attempt to use 'resumes' as fallback bucket name if no folder provided
      const bucketName = 'resumes';
      const supabaseFilePath = `${folder}/${fileName}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(supabaseFilePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        console.error('Supabase upload error:', error);
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(supabaseFilePath);

      fileUrl = urlData.publicUrl;
    } else {
      // Upload to local storage (public directory)
      const path = require('path');
      const { writeFile, mkdir } = require('fs/promises');

      const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
      await mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      fileUrl = `/uploads/${folder}/${fileName}`;
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: fileName,
    });
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file', details: error?.message },
      { status: 500 }
    );
  }
}
