'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

const STATUS_COLORS: Record<string, string> = {
    New: 'bg-blue-100 text-blue-700',
    Reviewed: 'bg-yellow-100 text-yellow-700',
    Shortlisted: 'bg-purple-100 text-purple-700',
    Rejected: 'bg-red-100 text-red-700',
    Hired: 'bg-green-100 text-green-700',
};

const STATUS_OPTIONS = ['New', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];

export default function EmployerApplicationsPage() {
    const router = useRouter();
    const [employer, setEmployer] = useState<any>(null);
    const [applications, setApplications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [customFields, setCustomFields] = useState<any[]>([]);
    const [openStatusId, setOpenStatusId] = useState<string | null>(null);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const auth = localStorage.getItem('employerAuth');
        const employerData = localStorage.getItem('employerUser');

        if (!auth || !employerData) {
            router.push('/login');
        } else {
            const emp = JSON.parse(employerData);
            setEmployer(emp);
            fetchData(emp.companyName);
        }
    }, [router]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenStatusId(null);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const fetchData = async (companyName: string) => {
        setLoading(true);
        try {
            // Fetch custom fields first
            const fieldsRes = await fetch('/api/admin/custom-fields?context=APPLICATION');
            const fieldsData = await fieldsRes.json();
            if (fieldsData.fields) setCustomFields(fieldsData.fields);

            // Fetch applications
            const res = await fetch(`/api/employer/applications?companyName=${encodeURIComponent(companyName)}`);
            const data = await res.json();
            if (data.applications) setApplications(data.applications);
        } catch (e) {
            console.error('Error fetching data:', e);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/applications/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
            }
        } catch (e) {
            console.error('Status update error:', e);
        }
        setOpenStatusId(null);
    };

    if (loading && !employer) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-gray-600">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Header activePage="my-account" />

            <div className="container mx-auto px-4 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-12">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">My Account</h1>

                    {/* Tabs Navigation */}
                    <div className="flex justify-center border-b border-gray-200 mb-8 overflow-x-auto">
                        <nav className="flex space-x-8">
                            <Link href="/my-account" className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors whitespace-nowrap">Dashboard</Link>
                            <Link href="/my-account/job-postings" className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors whitespace-nowrap">Job Postings</Link>
                            <Link href="/my-account/applications" className="py-4 px-1 border-b-2 border-gray-900 text-gray-900 font-medium text-sm whitespace-nowrap">Applications</Link>
                            <Link href="/my-account/invoices" className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors whitespace-nowrap">Invoices</Link>
                            <Link href="/my-account/company-settings" className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm transition-colors whitespace-nowrap">Company Settings</Link>
                        </nav>
                    </div>

                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Manage Applications</h2>
                        <span className="text-sm font-medium text-gray-500">{applications.length} applications found</span>
                    </div>

                    {/* Applications Table */}
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px]">Date</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px]">Job Title</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px]">Applicant</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px]">Resume</th>
                                        <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px]">Status</th>
                                        {customFields.map(f => (
                                            <th key={f.id} className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px] whitespace-nowrap">{f.caption}</th>
                                        ))}
                                        <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-[10px]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan={10} className="px-6 py-12 text-center text-gray-400 italic">Loading applications...</td></tr>
                                    ) : applications.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 text-gray-400">
                                                    <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <p className="text-lg font-medium">No applications yet</p>
                                                    <p className="text-sm">Wait for job seekers to apply to your postings.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        applications.map((app) => (
                                            <tr key={app.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap font-medium">
                                                    {new Date(app.applicationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900">{app.jobTitle}</td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-gray-900">{app.applicantName}</div>
                                                    <div className="text-xs text-gray-500">{app.applicantEmail}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {app.resumeId ? (
                                                        <Link
                                                            href={`/resume/${app.resumeId}`}
                                                            target="_blank"
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-xs font-bold hover:bg-yellow-100 transition-colors"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            View Resume
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">No resume</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="relative inline-block">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setOpenStatusId(openStatusId === app.id ? null : app.id); }}
                                                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-all shadow-sm flex items-center gap-1.5`}
                                                        >
                                                            {app.status}
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                        {openStatusId === app.id && (
                                                            <div ref={menuRef} className="absolute left-0 mt-2 w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1 overflow-hidden">
                                                                {STATUS_OPTIONS.map(s => (
                                                                    <button
                                                                        key={s}
                                                                        onClick={() => handleStatusChange(app.id, s)}
                                                                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors ${s === app.status ? 'text-yellow-600 bg-yellow-50/30' : 'text-gray-700'}`}
                                                                    >
                                                                        {s}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                {customFields.map(f => (
                                                    <td key={f.id} className="px-6 py-4 text-gray-600 text-xs font-medium whitespace-nowrap">
                                                        {app.customFields?.[f.caption] || app.customFields?.[f.id] || '—'}
                                                    </td>
                                                ))}
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => {
                                                            if (app.coverLetter) alert(`Cover Letter:\n\n${app.coverLetter}`);
                                                            else alert('No cover letter provided.');
                                                        }}
                                                        className="text-gray-400 hover:text-gray-900 transition-colors font-bold text-xs underline underline-offset-4"
                                                    >
                                                        Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
