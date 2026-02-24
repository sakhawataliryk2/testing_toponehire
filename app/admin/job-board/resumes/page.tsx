'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';

export default function ResumesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/resumes');
      const data = await res.json();
      if (data.resumes) {
        setResumes(data.resumes);
      }
    } catch (e) {
      console.error('Error fetching resumes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (!auth) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      fetchResumes();
    }
  }, [router]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete resume "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/resumes/${id}`, { method: 'DELETE' });
      if (res.ok) fetchResumes();
      else alert('Failed to delete');
    } catch (e) {
      alert('Error deleting');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Resumes</h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Candidate</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Desired Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Location</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date Added</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Resume File</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : resumes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No resumes found.
                  </td>
                </tr>
              ) : (
                resumes.map((resume) => (
                  <tr key={resume.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {resume.jobSeeker?.firstName} {resume.jobSeeker?.lastName}
                      </div>
                      <div className="text-xs text-gray-500">{resume.jobSeeker?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{resume.desiredJobTitle}</td>
                    <td className="px-4 py-3 text-gray-600">{resume.location || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${resume.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {resume.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">
                      {new Date(resume.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {resume.resumeFileUrl ? (
                        <a
                          href={resume.resumeFileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-900 font-medium"
                          title="Download Resume"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M8 11l4 4 4-4m-4-11v11" />
                          </svg>
                          Download
                        </a>
                      ) : (
                        <span className="text-gray-400 text-xs italic">No file</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium">
                      <Link
                        href={`/admin/job-board/resumes/${resume.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDelete(resume.id, resume.desiredJobTitle)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
