'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  Reviewed: 'bg-yellow-100 text-yellow-700',
  Shortlisted: 'bg-purple-100 text-purple-700',
  Rejected: 'bg-red-100 text-red-700',
  Hired: 'bg-green-100 text-green-700',
};

export default function MyApplicationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = localStorage.getItem('jobSeekerAuth');
    const userData = localStorage.getItem('jobSeekerUser');
    if (!auth || !userData) {
      router.push('/login');
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchApplications(parsedUser.email);
    }
  }, [router]);

  const fetchApplications = async (email: string) => {
    try {
      const res = await fetch(`/api/job-seeker/applications?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
      }
    } catch (e) {
      console.error('Error fetching applications:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600 font-medium">Loading applications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center" style={{ fontFamily: 'serif' }}>
            My Account
          </h1>

          {/* Tabs Navigation */}
          <div className="flex justify-center border-b border-gray-200 mb-10 overflow-x-auto">
            <nav className="flex space-x-8">
              <Link
                href="/my-listings/resume"
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-bold text-sm transition-colors whitespace-nowrap"
              >
                My Resumes
              </Link>
              <Link
                href="/my-listings/applications"
                className={`py-4 px-1 border-b-2 font-bold text-sm transition-colors whitespace-nowrap ${pathname === '/my-listings/applications'
                  ? 'border-yellow-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                My Applications
              </Link>
              <Link
                href="/my-listings/saved-jobs"
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-bold text-sm transition-colors whitespace-nowrap"
              >
                Saved Jobs
              </Link>
              <Link
                href="/my-listings/account-settings"
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-bold text-sm transition-colors whitespace-nowrap"
              >
                Account Settings
              </Link>
            </nav>
          </div>

          <div className="bg-white">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Your Applications</h2>
              <span className="text-sm font-medium text-gray-500">{applications.length} submitted</span>
            </div>

            {applications.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-16 text-center">
                <div className="max-w-xs mx-auto">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-600 font-medium mb-6">You haven't applied to any jobs yet.</p>
                  <Link
                    href="/jobs"
                    className="inline-block px-8 py-3 bg-yellow-500 text-white font-bold rounded-xl shadow-lg hover:bg-yellow-600 transition-all transform hover:-translate-y-0.5"
                  >
                    Browse Jobs
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-gray-900">{app.jobTitle}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'}`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-7h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          {app.companyName}
                        </div>
                        <div className="flex items-center gap-1.5 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                          </svg>
                          Applied on {new Date(app.applicationDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {app.resumeId && (
                        <Link
                          href={`/resume/${app.resumeId}`}
                          target="_blank"
                          className="flex-1 md:flex-none text-center px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          View Resume
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          if (app.coverLetter) alert(`Cover Letter:\n\n${app.coverLetter}`);
                          else alert('No cover letter was submitted with this application.');
                        }}
                        className="flex-1 md:flex-none text-center px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-gray-800 transition-colors"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
