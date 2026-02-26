'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function JobPostingsPage() {
  const router = useRouter();
  const [employer, setEmployer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    const auth = localStorage.getItem('employerAuth');
    const employerData = localStorage.getItem('employerUser');

    if (!auth || !employerData) {
      router.push('/login');
    } else {
      const emp = JSON.parse(employerData);
      setEmployer(emp);
      fetchEmployerJobs(emp);
    }
  }, [router]);

  const fetchEmployerJobs = async (emp: any) => {
    try {
      setLoading(true);
      // Fetch jobs specifically for this employer (by company name)
      const query = new URLSearchParams({
        employer: emp.companyName || emp.email,
        status: 'Any Status', // Show both active and inactive
      });

      const response = await fetch(`/api/jobs?${query.toString()}`);
      const data = await response.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
        alert('Job deleted successfully');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to delete job'}`);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('An error occurred while deleting the job');
    }
  };

  if (loading) {
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
          <div className="flex justify-center border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              <Link
                href="/my-account"
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/my-account/job-postings"
                className="py-4 px-1 border-b-2 border-gray-900 text-gray-900 font-medium text-sm"
              >
                Job Postings
              </Link>
              <Link
                href="/my-account/applications"
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-colors"
              >
                Applications
              </Link>
              <Link
                href="/my-account/invoices"
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-colors"
              >
                Invoices
              </Link>
              <Link
                href="/my-account/company-settings"
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm transition-colors"
              >
                Company Settings
              </Link>
            </nav>
          </div>

          {/* Job Postings Content */}
          <div className="mb-6 flex justify-end">
            <Link
              href="/my-account/job-postings/add"
              className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-medium transition-colors"
            >
              Post New Job
            </Link>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {jobs.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-6 max-w-xs mx-auto text-sm">You haven't posted any jobs yet. Start hiring today by creating your first listing.</p>
                <Link
                  href="/my-account/job-postings/add"
                  className="inline-block px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl font-bold transition-all shadow-sm hover:shadow-md"
                >
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#fcfdfe] border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Job Title</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">Applications</th>
                      <th className="px-6 py-4 text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">Views</th>
                      <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">Posted On</th>
                      <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {jobs.map((job) => (
                      <tr key={job.id} className="group hover:bg-[#f8fafc] transition-colors">
                        <td className="px-6 py-5">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">{job.title}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{job.jobType} • {job.location}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold rounded-full ${job.status === 'Active'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-gray-50 text-gray-600'
                              }`}
                          >
                            <span className={`w-1 h-1 rounded-full mr-1.5 ${job.status === 'Active' ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                            {job.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-sm font-medium text-gray-700">{job.applications}</span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-sm font-medium text-gray-700">{job.views}</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm text-gray-600">{new Date(job.postingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/my-account/job-postings/edit/${job.id}`}
                              className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 text-gray-400 hover:text-yellow-600 transition-all"
                              title="Edit Job"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </Link>
                            <Link href={`/jobs/${job.id}`} target="_blank" className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 text-gray-400 hover:text-blue-600 transition-all" title="View Public Page">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Link>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 text-gray-400 hover:text-red-600 transition-all"
                              title="Delete Job"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div >
  );
}
