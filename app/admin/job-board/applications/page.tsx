'use client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';

const STATUS_OPTIONS = ['New', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'];

const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700',
  Reviewed: 'bg-yellow-100 text-yellow-700',
  Shortlisted: 'bg-purple-100 text-purple-700',
  Rejected: 'bg-red-100 text-red-700',
  Hired: 'bg-green-100 text-green-700',
};

const ALL_COLUMNS = [
  { key: 'applicationDate', label: 'Application Date' },
  { key: 'jobTitle', label: 'Job Title' },
  { key: 'companyName', label: 'Company Name' },
  { key: 'applicantName', label: 'Applicant Name' },
  { key: 'applicantEmail', label: 'Applicant Email' },
  { key: 'applicantPhone', label: 'Applicant Phone' },
  { key: 'resumeTitle', label: 'Resume' },
  { key: 'status', label: 'Application Status' },
  { key: 'coverLetter', label: 'Cover Letter' },
];

export default function ApplicationsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterJobTitle, setFilterJobTitle] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterApplicant, setFilterApplicant] = useState('');
  const [filterStatus, setFilterStatus] = useState('Any status');

  // Column visibility
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    applicationDate: false,
    jobTitle: true,
    companyName: true,
    applicantName: true,
    applicantEmail: true,
    applicantPhone: true,
    resumeTitle: true,
    status: true,
    coverLetter: true,
  });

  // Status dropdown per row
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  // Export
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const filterRef = useRef<HTMLDivElement>(null);
  const colMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (!auth) router.push('/admin/login');
    else {
      setIsAuthenticated(true);
      fetchApplications();
    }
  }, [router]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false);
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) setShowColMenu(false);
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false);
      setOpenStatusId(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchApplications = async (params?: {
    jobTitle?: string; company?: string; applicant?: string; status?: string;
  }) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (params?.jobTitle) q.set('jobTitle', params.jobTitle);
      if (params?.company) q.set('companyName', params.company);
      if (params?.applicant) q.set('applicant', params.applicant);
      if (params?.status && params.status !== 'Any status') q.set('status', params.status);

      const res = await fetch(`/api/admin/applications?${q.toString()}`);
      const data = await res.json();
      if (data.applications) {
        setApplications(data.applications);
        setTotal(data.total);
      }
    } catch (e) {
      console.error('Error fetching applications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchApplications({
      jobTitle: filterJobTitle,
      company: filterCompany,
      applicant: filterApplicant,
      status: filterStatus,
    });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilterJobTitle('');
    setFilterCompany('');
    setFilterApplicant('');
    setFilterStatus('Any status');
    fetchApplications();
    setShowFilters(false);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setApplications(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (e) {
      console.error('Status update error:', e);
    }
    setOpenStatusId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete application from "${name}"?`)) return;
    try {
      await fetch(`/api/admin/applications/${id}`, { method: 'DELETE' });
      setApplications(prev => prev.filter(a => a.id !== id));
      setTotal(prev => prev - 1);
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  // Properly escape a CSV cell value
  const escapeCsvCell = (val: any): string => {
    const str = (val ?? '').toString();
    // If it contains commas, newlines or quotes, wrap in double-quotes and escape inner quotes
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  const buildCsvContent = (data: any[]) => {
    const cols = ALL_COLUMNS.filter(c => visibleCols[c.key]);
    const headerRow = cols.map(c => escapeCsvCell(c.label)).join(',');
    const dataRows = data.map(a =>
      cols.map(c => {
        if (c.key === 'applicationDate') return escapeCsvCell(new Date(a.applicationDate).toLocaleDateString('en-US'));
        return escapeCsvCell(a[c.key]);
      }).join(',')
    );
    return [headerRow, ...dataRows].join('\r\n');
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    // Add BOM for Excel UTF-8 compatibility
    const bom = mimeType.includes('csv') ? '\uFEFF' : '';
    const blob = new Blob([bom + content], { type: mimeType + ';charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTimestampedFilename = (base: string, ext: string) => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10); // e.g. 2026-02-24
    return `${base}_${date}.${ext}`;
  };

  const handleExportCurrent = async (format: 'csv' | 'excel') => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const content = buildCsvContent(applications);
      if (format === 'csv') {
        downloadFile(content, getTimestampedFilename('applications', 'csv'), 'text/csv');
      } else {
        // For Excel we use .csv with BOM — works perfectly in Excel
        downloadFile(content, getTimestampedFilename('applications', 'xls'), 'application/vnd.ms-excel');
      }
    } finally {
      setExporting(false);
    }
  };

  const handleExportAll = async (format: 'csv' | 'excel') => {
    setExporting(true);
    setShowExportMenu(false);
    try {
      const res = await fetch('/api/admin/applications');
      const data = await res.json();
      const allApps = data.applications || [];
      const content = buildCsvContent(allApps);
      if (format === 'csv') {
        downloadFile(content, getTimestampedFilename('all_applications', 'csv'), 'text/csv');
      } else {
        downloadFile(content, getTimestampedFilename('all_applications', 'xls'), 'application/vnd.ms-excel');
      }
    } finally {
      setExporting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>

          <div className="flex items-center gap-3">
            {/* Filter Search Bar */}
            <div className="relative" ref={filterRef}>
              <div className="flex items-center border border-gray-200 rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="pl-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Filter Applications
                  <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Job Title or ID</label>
                    <input
                      type="text"
                      value={filterJobTitle}
                      onChange={e => setFilterJobTitle(e.target.value)}
                      placeholder="Job Title or ID"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Company name or email</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filterCompany}
                        onChange={e => setFilterCompany(e.target.value)}
                        placeholder="Company name or email"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-8"
                      />
                      {filterCompany && (
                        <button onClick={() => setFilterCompany('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Applicant name or email</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filterApplicant}
                        onChange={e => setFilterApplicant(e.target.value)}
                        placeholder="Applicant name or email"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-8"
                      />
                      {filterApplicant && (
                        <button onClick={() => setFilterApplicant('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">×</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Any status</label>
                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option>Any status</option>
                      {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleFilter}
                      className="flex-1 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Filter
                    </button>
                    <button
                      onClick={handleClearFilters}
                      className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60"
              >
                {exporting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                    <svg className={`w-3 h-3 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Current View ({applications.length} rows)</p>
                  </div>
                  <button
                    onClick={() => handleExportCurrent('csv')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export as CSV (.csv)
                  </button>
                  <button
                    onClick={() => handleExportCurrent('excel')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border-b border-gray-100"
                  >
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Export as Excel (.xls)
                  </button>

                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">All Records</p>
                  </div>
                  <button
                    onClick={() => handleExportAll('csv')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export All as CSV (.csv)
                  </button>
                  <button
                    onClick={() => handleExportAll('excel')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Export All as Excel (.xls)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Count + Column Toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600 font-medium">
            {loading ? 'Loading...' : `${total} application${total !== 1 ? 's' : ''} found`}
          </p>

          {/* Column Visibility Toggle */}
          <div className="relative" ref={colMenuRef}>
            <button
              onClick={() => setShowColMenu(!showColMenu)}
              className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm"
              title="Toggle Columns"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            {showColMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2">
                {ALL_COLUMNS.map(col => (
                  <label key={col.key} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleCols[col.key]}
                      onChange={() => setVisibleCols(prev => ({ ...prev, [col.key]: !prev[col.key] }))}
                      className="w-4 h-4 accent-indigo-600"
                    />
                    <span className="text-sm text-gray-700">{col.label}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 w-8">
                    <input type="checkbox" className="w-4 h-4 accent-indigo-600" />
                  </th>
                  {visibleCols.applicationDate && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap">Application Date</th>}
                  {visibleCols.jobTitle && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap">Job Title</th>}
                  {visibleCols.companyName && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap">Company Name</th>}
                  {visibleCols.applicantName && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap">Applicant Name</th>}
                  {visibleCols.applicantEmail && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap">Applicant Email</th>}
                  {visibleCols.applicantPhone && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap">Applicant Phone</th>}
                  {visibleCols.resumeTitle && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Resume</th>}
                  {visibleCols.status && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Application Status</th>}
                  {visibleCols.coverLetter && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Cover Letter</th>}
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-16 text-center text-gray-400 italic text-sm">
                      Loading applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <svg className="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-medium">No applications found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  applications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="w-4 h-4 accent-indigo-600" />
                      </td>
                      {visibleCols.applicationDate && (
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(app.applicationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                      )}
                      {visibleCols.jobTitle && (
                        <td className="px-4 py-3 font-medium text-indigo-600 hover:text-indigo-800 cursor-pointer max-w-[160px] truncate" title={app.jobTitle}>
                          {app.jobTitle}
                        </td>
                      )}
                      {visibleCols.companyName && (
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{app.companyName}</td>
                      )}
                      {visibleCols.applicantName && (
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{app.applicantName}</td>
                      )}
                      {visibleCols.applicantEmail && (
                        <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px] truncate" title={app.applicantEmail}>
                          {app.applicantEmail}
                        </td>
                      )}
                      {visibleCols.applicantPhone && (
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{app.applicantPhone || 'N/A'}</td>
                      )}
                      {visibleCols.resumeTitle && (
                        <td className="px-4 py-3 text-gray-600 max-w-[140px] truncate" title={app.resumeTitle}>
                          {app.resumeTitle || 'N/A'}
                        </td>
                      )}
                      {visibleCols.status && (
                        <td className="px-4 py-3">
                          <div className="relative inline-block">
                            <button
                              onClick={(e) => { e.stopPropagation(); setOpenStatusId(openStatusId === app.id ? null : app.id); }}
                              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${STATUS_COLORS[app.status] || 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-opacity`}
                            >
                              {app.status}
                            </button>
                            {openStatusId === app.id && (
                              <div className="absolute left-0 mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-xl z-30 py-1">
                                {STATUS_OPTIONS.map(s => (
                                  <button
                                    key={s}
                                    onClick={() => handleStatusChange(app.id, s)}
                                    className={`w-full text-left px-3 py-2 text-xs font-semibold hover:bg-gray-50 transition-colors ${s === app.status ? 'text-indigo-600' : 'text-gray-700'}`}
                                  >
                                    {s}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleCols.coverLetter && (
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[180px] truncate" title={app.coverLetter || ''}>
                          {app.coverLetter || '—'}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(app.id, app.applicantName)}
                          className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
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
    </AdminLayout>
  );
}
