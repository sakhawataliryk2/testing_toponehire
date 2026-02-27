'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function ResumePreviewPage() {
  const params = useParams();
  const resumeId = params?.id as string;
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (resumeId) fetchResume();
  }, [resumeId]);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/resumes/${resumeId}`);
      if (response.status === 404) { setNotFound(true); return; }
      const data = await response.json();
      if (data.resume) setResume(data.resume);
      else setNotFound(true);
    } catch (error) {
      console.error('Error fetching resume:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper: get value from direct field or fallback to customFields JSON
  const getField = (resume: any, directKey: string, ...captionKeywords: string[]) => {
    // First check direct DB field
    if (resume[directKey] && resume[directKey].trim?.() !== '') return resume[directKey];
    // Fallback: search inside customFields JSON object
    if (resume.customFields && typeof resume.customFields === 'object') {
      for (const [caption, value] of Object.entries(resume.customFields)) {
        const cl = caption.toLowerCase();
        if (captionKeywords.every(kw => cl.includes(kw))) return value as string;
      }
    }
    return '';
  };

  const parseJSON = (str: string | null | undefined) => {
    if (!str) return [];
    try { return JSON.parse(str); } catch { return []; }
  };

  const handleDownloadResumeFile = async (url: string) => {
    if (!url) return;
    setIsDownloading(true);
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = url.split('/').pop() || 'Resume_File';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback to opening directly
      window.open(url, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="font-medium">Loading resume...</span>
        </div>
      </div>
    );
  }

  if (notFound || !resume) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-gray-500 text-lg">Resume not found.</p>
          <Link href="/my-listings/resume" className="mt-4 inline-block text-yellow-600 font-bold hover:underline">← Back to My Resumes</Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Extract fields with smart fallback
  const desiredJobTitle = getField(resume, 'desiredJobTitle', 'desired', 'job', 'title');
  const jobType = getField(resume, 'jobType', 'job', 'type');
  const categories = getField(resume, 'categories', 'categor');
  const location = getField(resume, 'location', 'location');
  const phone = getField(resume, 'phone', 'phone');
  const personalSummary = getField(resume, 'personalSummary', 'personal', 'summary');
  const workExperiences = parseJSON(resume.workExperience);
  const educations = parseJSON(resume.education);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Actions */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Link href="/my-listings/resume" className="text-sm text-gray-500 hover:text-yellow-600 transition-colors flex items-center gap-1.5 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                My Resumes
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Resume Preview</h1>
            </div>
            <div className="flex gap-3">
              {resume.resumeFileUrl && (
                <button
                  onClick={() => handleDownloadResumeFile(resume.resumeFileUrl)}
                  disabled={isDownloading}
                  className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download Resume File
                    </>
                  )}
                </button>
              )}
              <Link
                href={`/add-listing?listing_type_id=Resume&edit=${resume.id}`}
                className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold rounded-xl transition-colors shadow-sm"
              >
                Edit Resume
              </Link>
            </div>
          </div>

          {/* Resume Card */}
          <div id="resume-card" className="bg-white border border-gray-200 rounded-3xl p-10 shadow-sm space-y-10">

            {/* Name / Title Banner */}
            <div className="border-b border-gray-100 pb-8">
              <h2 className="text-3xl font-extrabold text-gray-900 mb-1">
                {resume.jobSeeker?.firstName && resume.jobSeeker?.lastName
                  ? `${resume.jobSeeker.firstName} ${resume.jobSeeker.lastName}`
                  : desiredJobTitle || 'Resume'}
              </h2>
              {desiredJobTitle && (
                <p className="text-lg text-yellow-600 font-semibold">{desiredJobTitle}</p>
              )}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                {location && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {location}
                  </span>
                )}
                {phone && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {phone}
                  </span>
                )}
                {resume.jobSeeker?.email && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {resume.jobSeeker.email}
                  </span>
                )}
              </div>
            </div>

            {/* Job Details */}
            {(jobType || categories) && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {jobType && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Job Type</p>
                    <p className="font-semibold text-gray-900">{jobType}</p>
                  </div>
                )}
                {categories && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Category</p>
                    <p className="font-semibold text-gray-900">{categories}</p>
                  </div>
                )}
              </div>
            )}

            {/* Personal Summary */}
            {personalSummary && (
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-1 bg-yellow-400 rounded-full inline-block"></span>
                  Personal Summary
                </h3>
                <div
                  className="prose max-w-none text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: personalSummary }}
                />
              </div>
            )}

            {/* Work Experience */}
            {workExperiences.length > 0 && (
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-6 h-1 bg-yellow-400 rounded-full inline-block"></span>
                  Work Experience
                </h3>
                <div className="space-y-6">
                  {workExperiences.map((exp: any, index: number) => (
                    <div key={index} className="relative pl-6 border-l-2 border-yellow-300">
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                      <h4 className="text-base font-bold text-gray-900">{exp.position}</h4>
                      <p className="text-yellow-700 font-semibold text-sm">{exp.company}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{exp.from} – {exp.present ? 'Present' : exp.to}</p>
                      {exp.description && (
                        <div
                          className="mt-2 prose prose-sm max-w-none text-gray-600"
                          dangerouslySetInnerHTML={{ __html: exp.description }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {educations.length > 0 && (
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
                  <span className="w-6 h-1 bg-blue-400 rounded-full inline-block"></span>
                  Education
                </h3>
                <div className="space-y-4">
                  {educations.map((edu: any, index: number) => (
                    <div key={index} className="relative pl-6 border-l-2 border-blue-200">
                      <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-400"></div>
                      <h4 className="text-base font-bold text-gray-900">{edu.degree}</h4>
                      <p className="text-blue-700 font-semibold text-sm">{edu.institution}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{edu.from} – {edu.present ? 'Present' : edu.to}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Fields (extra ones not in standard fields) */}
            {resume.customFields && typeof resume.customFields === 'object' && Object.keys(resume.customFields).length > 0 && (
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="w-6 h-1 bg-purple-400 rounded-full inline-block"></span>
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(resume.customFields as Record<string, any>).map(([key, value]) => {
                    // Skip null, undefined, empty, or raw objects (e.g. un-uploaded File objects)
                    if (!value || typeof value === 'object') return null;
                    const strVal = String(value);
                    if (!strVal.trim()) return null;
                    // Detect if it's a URL (file/image upload)
                    const isUrl = strVal.startsWith('http://') || strVal.startsWith('https://') || strVal.startsWith('/');
                    return (
                      <div key={key} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">{key}</p>
                        {isUrl ? (
                          <button
                            onClick={() => handleDownloadResumeFile(strVal)}
                            className="font-bold text-yellow-600 hover:underline text-sm text-left break-all"
                          >
                            Download File ↓
                          </button>
                        ) : (
                          <p className="font-medium text-gray-900 text-sm">{strVal}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
