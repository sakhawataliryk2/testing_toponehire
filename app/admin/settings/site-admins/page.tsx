'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';
import Link from 'next/link';

export default function SiteAdminsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<'list' | 'add'>('list');
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'Full Admin Access',
    notifications: {
      jobPosted: false,
      employerSignUp: false,
      resumeCreated: false,
      jobSeekerSignUp: false,
      newOrder: false,
      jobLimitReached: false,
    }
  });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/site-admins');
      const data = await res.json();
      if (data.admins) {
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
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
      fetchAdmins();
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/admin/site-admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        alert('Invite sent successfully!');
        setFormData({
          fullName: '',
          email: '',
          role: 'Full Admin Access',
          notifications: {
            jobPosted: false,
            employerSignUp: false,
            resumeCreated: false,
            jobSeekerSignUp: false,
            newOrder: false,
            jobLimitReached: false,
          }
        });
        setView('list');
        fetchAdmins();
      } else {
        alert(data.error || 'Failed to send invite');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name || 'this admin'}?`)) return;

    try {
      const res = await fetch(`/api/admin/site-admins/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchAdmins();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Breadcrumbs */}
        <div className="mb-4">
          <nav className="text-sm font-medium text-gray-500">
            <span className="hover:text-gray-700 cursor-pointer" onClick={() => setView('list')}>Site admins</span>
            {view === 'add' && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Add new Admin</span>
              </>
            )}
          </nav>
        </div>

        {view === 'list' ? (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Site Admins</h1>
              <button
                onClick={() => setView('add')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                Add New Admin
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Permissions</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">Loading admins...</td>
                    </tr>
                  ) : admins.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">No admins found</td>
                    </tr>
                  ) : (
                    admins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{admin.fullName || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{admin.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{admin.role}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${admin.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {admin.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <button
                            onClick={() => handleDelete(admin.id, admin.fullName)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-8 font-outfit">Add New Admin</h1>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-bold text-gray-700 text-right pr-4">Full Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-bold text-gray-700 text-right pr-4">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-sm font-bold text-gray-700 text-right pr-4">Permissions</label>
                <div className="flex gap-0 border border-gray-200 rounded-md overflow-hidden w-fit shadow-sm">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'Full Admin Access' })}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${formData.role === 'Full Admin Access' ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    Full Admin Access
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'Limited Access' })}
                    className={`px-4 py-2 text-sm font-medium border-l border-gray-200 transition-colors ${formData.role === 'Limited Access' ? 'bg-gray-200 text-gray-900' : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                  >
                    Limited Access
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-start gap-4">
                <div className="flex items-center justify-end pr-4 mt-1">
                  <label className="text-sm font-bold text-gray-700">Notification Preferences</label>
                  <div className="ml-1 text-blue-400 cursor-help" title="These users will receive emails for the selected events">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="space-y-3 pt-1">
                  {[
                    { id: 'jobPosted', label: 'Job Posted' },
                    { id: 'employerSignUp', label: 'Employer Sign Up' },
                    { id: 'resumeCreated', label: 'Resume Created' },
                    { id: 'jobSeekerSignUp', label: 'Job Seeker Sign Up' },
                    { id: 'newOrder', label: 'New Order' },
                    { id: 'jobLimitReached', label: 'Job Limit Reached' },
                  ].map((pref) => (
                    <label key={pref.id} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={(formData.notifications as any)[pref.id]}
                        onChange={(e) => setFormData({
                          ...formData,
                          notifications: { ...formData.notifications, [pref.id]: e.target.checked }
                        })}
                        className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors uppercase font-medium tracking-tight">
                        {pref.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 pt-4">
                <div />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-fit px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
