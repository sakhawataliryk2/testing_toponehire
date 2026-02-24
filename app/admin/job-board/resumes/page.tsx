'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';

const ALL_COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'title', label: 'Title' },
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'postingDate', label: 'Posting Date' },
  { key: 'featured', label: 'Featured' },
  { key: 'jobType', label: 'Job Type' },
  { key: 'categories', label: 'Categories' },
  { key: 'location', label: 'Location' },
  { key: 'phone', label: 'Phone' },
  { key: 'status', label: 'Status' },
  { key: 'resumeFile', label: 'Resume File' },
];

const DEFAULT_VISIBLE: Record<string, boolean> = {
  id: false,
  title: true,
  name: true,
  email: true,
  postingDate: true,
  featured: false,
  jobType: false,
  categories: false,
  location: false,
  phone: false,
  status: true,
  resumeFile: true,
};

export default function ResumesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [resumes, setResumes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filterKeywords, setFilterKeywords] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterStatus, setFilterStatus] = useState('Any Status');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  // Columns
  const [showColMenu, setShowColMenu] = useState(false);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(DEFAULT_VISIBLE);

  // Export
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const filterRef = useRef<HTMLDivElement>(null);
  const colMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (!auth) router.push('/admin/login');
    else {
      setIsAuthenticated(true);
      fetchResumes();
    }
  }, [router]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setShowFilters(false);
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) setShowColMenu(false);
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchResumes = async (params?: {
    keywords?: string; email?: string; status?: string; dateFrom?: string; dateTo?: string;
  }) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (params?.keywords) q.set('keywords', params.keywords);
      if (params?.email) q.set('email', params.email);
      if (params?.status && params.status !== 'Any Status') q.set('status', params.status);
      if (params?.dateFrom) q.set('dateFrom', params.dateFrom);
      if (params?.dateTo) q.set('dateTo', params.dateTo);

      const res = await fetch(`/api/admin/resumes?${q.toString()}`);
      const data = await res.json();
      if (data.resumes) {
        setResumes(data.resumes);
        setTotal(data.total ?? data.resumes.length);
      }
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchResumes({ keywords: filterKeywords, email: filterEmail, status: filterStatus, dateFrom: filterDateFrom, dateTo: filterDateTo });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setFilterKeywords('');
    setFilterEmail('');
    setFilterStatus('Any Status');
    setFilterDateFrom('');
    setFilterDateTo('');
    fetchResumes();
    setShowFilters(false);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete resume "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/resumes/${id}`, { method: 'DELETE' });
      if (res.ok) { setResumes(prev => prev.filter(r => r.id !== id)); setTotal(p => p - 1); }
      else alert('Failed to delete');
    } catch (e) { alert('Error deleting'); }
  };

  // CSV Export helpers
  const escapeCsvCell = (val: any) => {
    const str = (val ?? '').toString();
    if (str.includes(',') || str.includes('"') || str.includes('\n')) return '"' + str.replace(/"/g, '""') + '"';
    return str;
  };

  const buildCsvContent = (data: any[]) => {
    const cols = ALL_COLUMNS.filter(c => visibleCols[c.key]);
    const header = cols.map(c => escapeCsvCell(c.label)).join(',');
    const rows = data.map(r => cols.map(c => {
      if (c.key === 'id') return escapeCsvCell(r.id);
      if (c.key === 'title') return escapeCsvCell(r.desiredJobTitle);
      if (c.key === 'name') return escapeCsvCell(`${r.jobSeeker?.firstName || ''} ${r.jobSeeker?.lastName || ''}`);
      if (c.key === 'email') return escapeCsvCell(r.jobSeeker?.email);
      if (c.key === 'postingDate') return escapeCsvCell(new Date(r.createdAt).toLocaleDateString('en-US'));
      if (c.key === 'resumeFile') return escapeCsvCell(r.resumeFileUrl || '');
      if (c.key === 'featured') return escapeCsvCell(r.featured ? 'Yes' : 'No');
      return escapeCsvCell(r[c.key]);
    }).join(','));
    return [header, ...rows].join('\r\n');
  };

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob(['\uFEFF' + content], { type: mime + ';charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const dateStr = new Date().toISOString().slice(0, 10);

  const handleExportCurrent = (format: 'csv' | 'excel') => {
    setExporting(true); setShowExportMenu(false);
    try {
      const content = buildCsvContent(resumes);
      downloadFile(content, `resumes_${dateStr}.${format === 'csv' ? 'csv' : 'xls'}`,
        format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel');
    } finally { setExporting(false); }
  };

  const handleExportAll = async (format: 'csv' | 'excel') => {
    setExporting(true); setShowExportMenu(false);
    try {
      const res = await fetch('/api/admin/resumes');
      const data = await res.json();
      const content = buildCsvContent(data.resumes || []);
      downloadFile(content, `all_resumes_${dateStr}.${format === 'csv' ? 'csv' : 'xls'}`,
        format === 'csv' ? 'text/csv' : 'application/vnd.ms-excel');
    } finally { setExporting(false); }
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Resumes</h1>

          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="relative" ref={filterRef}>
              <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-sm overflow-hidden">
                <div className="pl-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Filter Resumes
                  <svg className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {showFilters && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-20 p-4 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Keywords</label>
                    <input
                      type="text"
                      value={filterKeywords}
                      onChange={e => setFilterKeywords(e.target.value)}
                      placeholder="Keywords"
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Job Seeker Email</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={filterEmail}
                        onChange={e => setFilterEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 pr-8"
                      />
                      {filterEmail && (
                        <button onClick={() => setFilterEmail('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">×</button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">From</label>
                      <input type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">To</label>
                      <input type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)}
                        className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Any Status</label>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400">
                      <option>Any Status</option>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button onClick={handleFilter}
                      className="flex-1 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">Filter</button>
                    <button onClick={handleClearFilters}
                      className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors">Clear</button>
                  </div>
                </div>
              )}
            </div>

            {/* Import */}
            <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm">
              Import
            </button>

            {/* Export Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                disabled={exporting}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 bg-white shadow-sm disabled:opacity-60"
              >
                {exporting ? 'Exporting...' : 'Export'}
                <svg className={`w-3.5 h-3.5 transition-transform ${showExportMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden">
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase">Current View ({resumes.length})</p>
                  </div>
                  <button onClick={() => handleExportCurrent('csv')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Export as CSV
                  </button>
                  <button onClick={() => handleExportCurrent('excel')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 border-b border-gray-100">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Export as Excel
                  </button>
                  <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase">All Records</p>
                  </div>
                  <button onClick={() => handleExportAll('csv')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    Export All as CSV
                  </button>
                  <button onClick={() => handleExportAll('excel')} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Export All as Excel
                  </button>
                </div>
              )}
            </div>

            {/* Add New Resume */}
            <Link
              href="/admin/job-board/resumes/add"
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
            >
              Add New Resume
            </Link>
          </div>
        </div>

        {/* Count + Column Toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-600 font-medium">
            {loading ? 'Loading...' : `${total} resume${total !== 1 ? 's' : ''} found`}
          </p>
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
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-2">
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
                  {visibleCols.id && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap">ID</th>}
                  {visibleCols.title && (
                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      <span className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">Title ↕</span>
                    </th>
                  )}
                  {visibleCols.name && (
                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      <span className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">Name ↕</span>
                    </th>
                  )}
                  {visibleCols.email && (
                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">
                      <span className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">Email ↕</span>
                    </th>
                  )}
                  {visibleCols.postingDate && (
                    <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide whitespace-nowrap">
                      <span className="flex items-center gap-1 cursor-pointer hover:text-indigo-600">Posting Date ↕</span>
                    </th>
                  )}
                  {visibleCols.featured && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Featured</th>}
                  {visibleCols.jobType && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Job Type</th>}
                  {visibleCols.categories && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Categories</th>}
                  {visibleCols.location && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Location</th>}
                  {visibleCols.phone && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Phone</th>}
                  {visibleCols.status && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>}
                  {visibleCols.resumeFile && <th className="px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Resume File</th>}
                  <th className="px-4 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-16 text-center text-gray-400 italic text-sm">Loading resumes...</td>
                  </tr>
                ) : resumes.length === 0 ? (
                  <tr>
                    <td colSpan={15} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <svg className="w-12 h-12 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-medium">No resumes found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  resumes.map((resume) => (
                    <tr key={resume.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-3">
                        <input type="checkbox" className="w-4 h-4 accent-indigo-600" />
                      </td>
                      {visibleCols.id && (
                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">{resume.id.slice(0, 7)}</td>
                      )}
                      {visibleCols.title && (
                        <td className="px-4 py-3 max-w-[180px]">
                          <Link href={`/admin/job-board/resumes/${resume.id}`} className="font-medium text-indigo-600 hover:text-indigo-800 truncate block">
                            {resume.desiredJobTitle}
                          </Link>
                        </td>
                      )}
                      {visibleCols.name && (
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                          {resume.jobSeeker?.firstName} {resume.jobSeeker?.lastName}
                        </td>
                      )}
                      {visibleCols.email && (
                        <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px] truncate" title={resume.jobSeeker?.email}>
                          {resume.jobSeeker?.email}
                        </td>
                      )}
                      {visibleCols.postingDate && (
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(resume.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      )}
                      {visibleCols.featured && (
                        <td className="px-4 py-3">
                          {resume.featured ? (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">Yes</span>
                          ) : (
                            <span className="text-gray-400 text-xs">No</span>
                          )}
                        </td>
                      )}
                      {visibleCols.jobType && <td className="px-4 py-3 text-gray-600 text-sm">{resume.jobType || 'N/A'}</td>}
                      {visibleCols.categories && <td className="px-4 py-3 text-gray-600 text-sm max-w-[120px] truncate">{resume.categories || 'N/A'}</td>}
                      {visibleCols.location && <td className="px-4 py-3 text-gray-600 text-sm">{resume.location || 'N/A'}</td>}
                      {visibleCols.phone && <td className="px-4 py-3 text-gray-600 text-sm">{resume.phone || resume.jobSeeker?.phone || 'N/A'}</td>}
                      {visibleCols.status && (
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${resume.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                            {resume.status || 'Active'}
                          </span>
                        </td>
                      )}
                      {visibleCols.resumeFile && (
                        <td className="px-4 py-3">
                          {resume.resumeFileUrl ? (
                            <a href={resume.resumeFileUrl} target="_blank" rel="noopener noreferrer"
                              className="text-indigo-600 hover:underline text-xs font-medium truncate block max-w-[120px]"
                              title={resume.resumeFileUrl.split('/').pop()}>
                              {resume.resumeFileUrl.split('/').pop()}
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs italic">No file</span>
                          )}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/job-board/resumes/${resume.id}`}
                            className="text-gray-400 hover:text-indigo-600 transition-colors" title="View">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                          <button onClick={() => handleDelete(resume.id, resume.desiredJobTitle)}
                            className="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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
      </div>
    </AdminLayout>
  );
}
