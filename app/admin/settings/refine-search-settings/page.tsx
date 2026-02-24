'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';

export default function RefineSearchSettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings state
  const [itemsLimit, setItemsLimit] = useState('20');
  const [jobSearchFields, setJobSearchFields] = useState<string[]>([
    'Categories',
    'Job Type',
    'Salary Range',
    'State',
    'City',
    'Onsite/Remote'
  ]);
  const [resumeSearchFields, setResumeSearchFields] = useState<string[]>([
    'Categories',
    'Job Type',
    'City',
    'State'
  ]);

  const [showAddJobField, setShowAddJobField] = useState(false);
  const [showAddResumeField, setShowAddResumeField] = useState(false);

  const availableJobFields = [
    'Job Title', 'Company', 'Categories', 'Job Type', 'Salary Range',
    'State', 'City', 'Onsite/Remote', 'Experience Level', 'Education', 'Date Posted'
  ];

  const availableResumeFields = [
    'Candidate Name', 'Skills', 'Categories', 'Job Type',
    'City', 'State', 'Experience Level', 'Education', 'Desired Salary'
  ];

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (!auth) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      fetchSettings();
    }
  }, [router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/system-settings');
      const data = await res.json();

      if (data.settings) {
        if (data.settings.refine_search_limit) setItemsLimit(data.settings.refine_search_limit);
        if (data.settings.refine_search_job_fields) {
          setJobSearchFields(JSON.parse(data.settings.refine_search_job_fields));
        }
        if (data.settings.refine_search_resume_fields) {
          setResumeSearchFields(JSON.parse(data.settings.refine_search_resume_fields));
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const settings = {
        refine_search_limit: itemsLimit,
        refine_search_job_fields: JSON.stringify(jobSearchFields),
        refine_search_resume_fields: JSON.stringify(resumeSearchFields)
      };

      const res = await fetch('/api/admin/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });

      if (res.ok) {
        alert('Settings saved successfully!');
      } else {
        alert('Failed to save settings');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const addField = (section: 'job' | 'resume', field: string) => {
    if (section === 'job') {
      if (!jobSearchFields.includes(field)) {
        setJobSearchFields([...jobSearchFields, field]);
      }
      setShowAddJobField(false);
    } else {
      if (!resumeSearchFields.includes(field)) {
        setResumeSearchFields([...resumeSearchFields, field]);
      }
      setShowAddResumeField(false);
    }
  };

  const removeField = (section: 'job' | 'resume', index: number) => {
    if (section === 'job') {
      const newFields = [...jobSearchFields];
      newFields.splice(index, 1);
      setJobSearchFields(newFields);
    } else {
      const newFields = [...resumeSearchFields];
      newFields.splice(index, 1);
      setResumeSearchFields(newFields);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 font-outfit">Refine Search Settings</h1>

        {/* Global Limit */}
        <div className="flex items-center gap-4 mb-10 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <label className="text-sm font-bold text-gray-600">Items Limit:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={itemsLimit}
              onChange={(e) => setItemsLimit(e.target.value)}
              className="w-24 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all font-bold text-sm shadow-sm active:transform active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <div className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 cursor-help text-xs font-bold border border-gray-200" title="Max items to show in refined search results">
              ?
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Job Search Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Job Search</h2>
            </div>
            <div className="p-6">
              <div className="space-y-1 mb-6">
                {jobSearchFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between group py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab text-gray-300 group-hover:text-gray-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 10h10v2H7zM7 13h10v2H7z" />
                          <path fillRule="evenodd" d="M12 2a10 10 0 100 20 10 10 0 000-20zM4 12a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700 font-outfit uppercase tracking-tight">{field}</span>
                    </div>
                    <button
                      onClick={() => removeField('job', index)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowAddJobField(!showAddJobField)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all font-bold text-sm shadow-sm active:transform active:scale-95"
                >
                  Add
                  <svg className={`w-4 h-4 transition-transform ${showAddJobField ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showAddJobField && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-10 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {availableJobFields.filter(f => !jobSearchFields.includes(f)).map((field) => (
                      <button
                        key={field}
                        onClick={() => addField('job', field)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors font-medium"
                      >
                        {field}
                      </button>
                    ))}
                    {availableJobFields.filter(f => !jobSearchFields.includes(f)).length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-400 italic">No more fields</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resume Search Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Resume Search</h2>
            </div>
            <div className="p-6">
              <div className="space-y-1 mb-6">
                {resumeSearchFields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between group py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="cursor-grab text-gray-300 group-hover:text-gray-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M7 10h10v2H7zM7 13h10v2H7z" />
                          <path fillRule="evenodd" d="M12 2a10 10 0 100 20 10 10 0 000-20zM4 12a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700 font-outfit uppercase tracking-tight">{field}</span>
                    </div>
                    <button
                      onClick={() => removeField('resume', index)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowAddResumeField(!showAddResumeField)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all font-bold text-sm shadow-sm active:transform active:scale-95"
                >
                  Add
                  <svg className={`w-4 h-4 transition-transform ${showAddResumeField ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showAddResumeField && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-10 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    {availableResumeFields.filter(f => !resumeSearchFields.includes(f)).map((field) => (
                      <button
                        key={field}
                        onClick={() => addField('resume', field)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors font-medium"
                      >
                        {field}
                      </button>
                    ))}
                    {availableResumeFields.filter(f => !resumeSearchFields.includes(f)).length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-400 italic">No more fields</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-10 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-base shadow-lg hover:shadow-xl active:transform active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
