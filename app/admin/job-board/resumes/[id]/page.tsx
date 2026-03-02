'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';

export default function ResumeDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [resume, setResume] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const auth = localStorage.getItem('adminAuth');
        if (!auth) {
            router.push('/admin/login');
        } else {
            setIsAuthenticated(true);
            fetchResume();
        }
    }, [router]);

    const fetchResume = async () => {
        try {
            const res = await fetch(`/api/admin/resumes/${id}`);
            const data = await res.json();
            console.log('Resume data:', data); // Debug log
            if (data.resume) {
                setResume(data.resume);
            } else {
                alert('Resume not found');
                router.push('/admin/job-board/resumes');
            }
        } catch (e) {
            console.error('Error fetching resume:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this resume?')) return;
        try {
            const res = await fetch(`/api/admin/resumes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Resume deleted successfully');
                router.push('/admin/job-board/resumes');
            } else {
                alert('Failed to delete resume');
            }
        } catch (e) {
            alert('Error deleting resume');
        }
    };

    if (!isAuthenticated) return null;

    if (loading) {
        return (
            <AdminLayout>
                <div className="p-6">Loading...</div>
            </AdminLayout>
        );
    }

    if (!resume) return null;

    return (
        <AdminLayout>
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/admin/job-board/resumes" className="text-purple-600 hover:underline text-sm mb-2 inline-block">
                            &larr; Back to Resumes
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Resume Details</h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Delete Resume
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                    <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Candidate Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                                <p className="font-semibold text-gray-900">
                                    {resume.jobSeeker?.firstName} {resume.jobSeeker?.lastName}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Email Address</p>
                                <p className="font-semibold text-gray-900">{resume.jobSeeker?.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                                <p className="font-semibold text-gray-900">{resume.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Current Location</p>
                                <p className="font-semibold text-gray-900">{resume.location || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Resume Content</h2>
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Desired Job Title</p>
                                <p className="text-lg font-medium text-gray-900">{resume.desiredJobTitle}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500 mb-2">Personal Summary</p>
                                <div className="p-4 bg-gray-50 rounded-lg text-gray-700 leading-relaxed italic">
                                    "{resume.personalSummary}"
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Job Type</p>
                                    <p className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                        {resume.jobType}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Categories</p>
                                    <p className="text-gray-900">{resume.categories}</p>
                                </div>
                            </div>

                            {resume.customFields && Object.keys(resume.customFields).length > 0 && (
                                <div className="pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Additional Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(resume.customFields).map(([label, value]) => (
                                            <div key={label}>
                                                <p className="text-sm text-gray-500 mb-1">{label}</p>
                                                <div className="font-medium text-gray-900">
                                                    {typeof value === 'boolean' ? (
                                                        <span className={`px-2 py-0.5 rounded text-xs ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {value ? 'Yes' : 'No'}
                                                        </span>
                                                    ) : typeof value === 'string' && (value.startsWith('http') || value.startsWith('/uploads')) ? (
                                                        <a
                                                            href={value}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-purple-600 hover:underline flex items-center gap-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                            </svg>
                                                            View File
                                                        </a>
                                                    ) : (
                                                        String(value || 'N/A')
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {resume.resumeFileUrl && (
                                <div className="pt-4 border-t border-gray-100 text-center">
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-2">Debug: File URL</p>
                                        <code className="text-xs bg-gray-100 p-2 block rounded">
                                            {resume.resumeFileUrl}
                                        </code>
                                    </div>
                                    <a
                                        href={resume.resumeFileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-50 text-purple-700 rounded-lg font-bold hover:bg-purple-100 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M8 11l4 4 4-4m-4-11v11" />
                                        </svg>
                                        Download Resume File
                                    </a>
                                </div>
                            )}

                            {!resume.resumeFileUrl && (
                                <div className="pt-4 border-t border-gray-100 text-center">
                                    <p className="text-gray-500 text-sm">No resume file uploaded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
