'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';

interface Job {
  id: string;
  title: string;
  employer: string;
  product: string | null;
  postingDate: string;
  expirationDate: string | null;
  applications: number;
  status: string;
  featured: boolean;
  jobType: string;
  categories: string;
  salaryFrom: string | null;
  salaryTo: string | null;
  salaryFrequency: string | null;
  howToApply: string;
  applyValue: string | null;
  views: number;
  postedBy: string;
}

export default function JobPostingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [visibleColumns, setVisibleColumns] = useState({
    id: true,
    title: true,
    employer: true,
    product: true,
    postingDate: true,
    expirationDate: true,
    applications: true,
    status: true,
    featured: true,
    jobType: true,
    categories: true,
    salaryRange: true,
    howToApply: true,
    views: true,
    postedBy: true,
    experience: false,
    location: false,
  });
  const [showColumnMenu, setShowColumnMenu] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    status: 'Any Status',
    employer: '',
    fromDate: '',
    toDate: '',
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      // For Admin, pass status to override the 'Active' default in the API
      params.append('status', filters.status);
      if (filters.employer) params.append('employer', filters.employer);

      const response = await fetch(`/api/jobs?${params.toString()}`);
      const data = await response.json();

      if (data.jobs) {
        // Uniqueness check to prevent duplicates if any from API
        const uniqueJobsMap = new Map();
        data.jobs.forEach((job: any) => {
          uniqueJobsMap.set(job.id, job);
        });

        const uniqueJobs = Array.from(uniqueJobsMap.values());

        const formattedJobs = uniqueJobs.map((job: any) => ({
          ...job,
          postingDate: new Date(job.postingDate).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          expirationDate: job.expirationDate
            ? new Date(job.expirationDate).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
            : null,
        }));
        setJobs(formattedJobs);
        setFilteredJobs(formattedJobs);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs();
    }
  }, [isAuthenticated, filters]);

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (!auth) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = (a as any)[sortColumn];
    const bValue = (b as any)[sortColumn];
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedJobs(sortedJobs.map((job) => job.id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleExport = () => {
    const count = selectedJobs.length || filteredJobs.length;
    setShowExportModal(true);
  };

  const confirmExport = () => {
    // Export logic here
    alert(`Exporting ${selectedJobs.length || filteredJobs.length} jobs...`);
    setShowExportModal(false);
    setSelectedJobs([]);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        // Refresh local state to remove the job
        setJobs(jobs.filter(j => j.id !== id));
        setFilteredJobs(filteredJobs.filter(j => j.id !== id));
        alert('Job deleted successfully');
      } else {
        alert(data.error || 'Failed to delete job');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/job-board/job-postings/import"
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Import
            </Link>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Export
            </button>
            <Link
              href="/admin/job-board/job-postings/add"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add New Job
            </Link>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search by Job Title or Employer"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Job Count */}
        {loading ? (
          <p className="text-gray-600 mb-4 italic">Fetching latest data...</p>
        ) : (
          <p className="text-gray-600 mb-4">{filteredJobs.length} jobs found</p>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Title, description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employer Name</label>
                <input
                  type="text"
                  value={filters.employer}
                  onChange={(e) => setFilters({ ...filters, employer: e.target.value })}
                  placeholder="Filter by company..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="hidden">
                {/* Reserved for source */}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="Any Status">Any Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={() => setFilters({ search: '', status: 'Any Status', employer: '', fromDate: '', toDate: '' })}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedJobs.length === sortedJobs.length && sortedJobs.length > 0}
                      onChange={handleSelectAll}
                      className="rounded"
                    />
                  </th>
                  {visibleColumns.id && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      <button onClick={() => handleSort('id')} className="flex items-center gap-1 hover:text-blue-600">
                        ID
                      </button>
                    </th>
                  )}
                  {visibleColumns.title && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      <button onClick={() => handleSort('title')} className="flex items-center gap-1 hover:text-blue-600">
                        Title
                      </button>
                    </th>
                  )}
                  {visibleColumns.employer && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      <button onClick={() => handleSort('employer')} className="flex items-center gap-1 hover:text-blue-600">
                        Employer
                      </button>
                    </th>
                  )}
                  {visibleColumns.product && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Product
                    </th>
                  )}
                  {visibleColumns.jobType && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Type
                    </th>
                  )}
                  {visibleColumns.categories && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Categories
                    </th>
                  )}
                  {visibleColumns.salaryRange && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Salary
                    </th>
                  )}
                  {visibleColumns.howToApply && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Apply Info
                    </th>
                  )}
                  {visibleColumns.views && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Views
                    </th>
                  )}
                  {visibleColumns.postedBy && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Posted By
                    </th>
                  )}
                  {visibleColumns.postingDate && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Posting Date
                    </th>
                  )}
                  {visibleColumns.expirationDate && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Expiration Date
                    </th>
                  )}
                  {visibleColumns.applications && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Applications
                    </th>
                  )}
                  {visibleColumns.status && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Status
                    </th>
                  )}
                  {visibleColumns.featured && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                      Featured
                    </th>
                  )}
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-700 relative">
                    <button
                      onClick={() => setShowColumnMenu(!showColumnMenu)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    </button>
                    {showColumnMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2 text-left">
                        {Object.entries(visibleColumns).map(([key, visible]) => (
                          <label key={key} className="flex items-center px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={visible}
                              onChange={(e) =>
                                setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })
                              }
                              className="mr-2"
                            />
                            <span className="text-sm text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={18} className="px-4 py-8 text-center text-gray-500">
                      Loading jobs...
                    </td>
                  </tr>
                ) : sortedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={18} className="px-4 py-8 text-center text-gray-500">
                      No jobs found
                    </td>
                  </tr>
                ) : (
                  sortedJobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={() => handleSelectJob(job.id)}
                          className="rounded"
                        />
                      </td>
                      {visibleColumns.id && <td className="px-4 py-3 text-sm text-gray-900">{job.id}</td>}
                      {visibleColumns.title && (
                        <td className="px-4 py-3 text-sm text-gray-900">{job.title}</td>
                      )}
                      {visibleColumns.employer && (
                        <td className="px-4 py-3 text-sm text-gray-900">{job.employer}</td>
                      )}
                      {visibleColumns.product && (
                        <td className="px-4 py-3 text-sm text-gray-500">{job.product || '-'}</td>
                      )}
                      {visibleColumns.jobType && (
                        <td className="px-4 py-3 text-sm text-gray-900">{job.jobType}</td>
                      )}
                      {visibleColumns.categories && (
                        <td className="px-4 py-3 text-sm text-gray-900">{job.categories}</td>
                      )}
                      {visibleColumns.salaryRange && (
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {job.salaryFrom && job.salaryTo
                            ? `$${job.salaryFrom} - $${job.salaryTo} ${job.salaryFrequency || 'yearly'}`
                            : '-'}
                        </td>
                      )}
                      {visibleColumns.howToApply && (
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {job.applyValue || '-'}
                        </td>
                      )}
                      {visibleColumns.views && (
                        <td className="px-4 py-3 text-sm text-gray-900">{job.views}</td>
                      )}
                      {visibleColumns.postedBy && (
                        <td className="px-4 py-3 text-sm text-gray-900">{job.postedBy}</td>
                      )}
                      {visibleColumns.postingDate && (
                        <td className="px-4 py-3 text-sm text-gray-900">{job.postingDate}</td>
                      )}
                      {visibleColumns.expirationDate && (
                        <td className="px-4 py-3 text-sm text-gray-500">{job.expirationDate || '-'}</td>
                      )}
                      {visibleColumns.applications && (
                        <td className="px-4 py-3 text-sm text-gray-900">{job.applications} applications</td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${job.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : job.status === 'Inactive'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                              }`}
                          >
                            {job.status}
                          </span>
                        </td>
                      )}
                      {visibleColumns.featured && (
                        <td className="px-4 py-3 text-sm text-gray-500">{job.featured ? '★' : '-'}</td>
                      )}
                      <td className="px-4 py-3 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleDelete(job.id)}
                            className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-md transition-colors"
                            title="Delete Job"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Export these {selectedJobs.length || filteredJobs.length} jobs?
                </h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
