'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '../../components/AdminLayout';

export default function SystemSettingsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [settings, setSettings] = useState<any>({
    // General
    siteName: 'TopOneHire',
    siteEmail: 'information@toponehire.com',
    customDomain: 'toponehire.com',
    maintenanceMode: 'false',
    maintenanceIpRange: '',
    timezone: 'America/New_York',
    dateFormat: 'Jan 30, 2026',
    gaConnected: 'true',
    gtmConnected: 'false',
    facebookPixelId: '',
    // Job Board
    enablePrivateJobAccess: 'false',
    onlyRegisteredCanApply: 'true',
    employerEmailVerification: 'false',
    jobSeekerEmailVerification: 'false',
    requireEmployerApproval: 'No approval is required',
    requireJobSeekerApproval: 'false',
    autoJobAlertSignUp: 'None',
    hideZeroJobCompanies: 'true',
    deleteExpiredJobs: 'true',
    deleteExpiredDays: '10',
    searchByLocation: 'true',
    displayRadiusIn: 'Miles',
    limitLocationSelection: '1 selected',
    apiKey: '',
    // Ecommerce
    currency: 'USD - United States Dollar',
    taxRate: '6.25',
    billingAddress: 'TopOneHire DBA Complete Staffing Solutions, Inc.\nInformation@TopOneHire.com\n401-244-7790',
    // SEO
    homepageTitle: 'TopOneHire - Job Board for U.S. job seekers.',
    metaDescription: 'TopOneHire is a national job board serving the United States. Employers can post jobs and search resumes while job seekers can find jobs and create alerts.',
    metaKeywords: 'jobs, careers, toponecareers, job board, job search, job seeking, candidates, employers, toponehire, topone, top one',
    // Privacy
    termsOptIn: 'true',
    privacyOptIn: 'true',
    newsletterOptIn: 'false',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('General Settings');

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/system-settings');
      const data = await res.json();
      if (data.settings && Object.keys(data.settings).length > 0) {
        setSettings((prev: any) => ({ ...prev, ...data.settings }));
      }
    } catch (e) {
      console.error('Error fetching settings:', e);
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
      fetchSettings();
    }
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    try {
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
    } catch (e) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: String(value) }));
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">Loading settings...</div>
      </AdminLayout>
    );
  }

  const tabs = [
    'General Settings',
    'Job Board Settings',
    'Ecommerce Settings',
    'SEO',
    'Privacy Protection',
  ];

  const helpIcon = (
    <div className="group relative flex items-center">
      <svg className="w-5 h-5 text-sky-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f8f9fc] p-8 font-sans">
        <h1 className="text-2xl font-medium text-[#4a4a4a] mb-6">System Settings</h1>

        <div className="bg-white rounded shadow-sm overflow-hidden border border-[#edeff2]">
          {/* Tab Navigation */}
          <div className="flex bg-[#f1f2f4] border-b border-[#edeff2]">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-[13px] font-medium transition-all border-r border-[#edeff2] ${activeTab === tab
                  ? 'bg-white text-[#333]'
                  : 'text-[#666] hover:bg-[#ebedf0]'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-10 min-h-[500px]">
            {/* General Settings */}
            {activeTab === 'General Settings' && (
              <div className="space-y-6 max-w-5xl">
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Site Name</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleChange('siteName', e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-[#d1d3e2] rounded text-[13px] outline-none focus:border-purple-400"
                  />
                </div>
                <div className="flex gap-8 items-start">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333] pt-2">Site Email</label>
                  <div className="flex-1 space-y-2">
                    <input
                      type="email"
                      value={settings.siteEmail}
                      onChange={(e) => handleChange('siteEmail', e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-[#d1d3e2] rounded text-[13px] outline-none focus:border-purple-400"
                    />
                    <div className="inline-block px-1.5 py-0.5 bg-[#00c292] text-white text-[10px] font-bold rounded">Verified</div>
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Custom Domain Name</label>
                  <input
                    type="text"
                    value={settings.customDomain}
                    onChange={(e) => handleChange('customDomain', e.target.value)}
                    className="flex-1 px-4 py-2 bg-white border border-[#d1d3e2] rounded text-[13px] outline-none focus:border-purple-400"
                  />
                </div>
                <div className="flex gap-8 items-start">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333] pt-2">Enable Maintenance Mode</label>
                  <div className="flex-1 space-y-2">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode === 'true'}
                      onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                      className="w-4 h-4 rounded border-[#d1d3e2] text-purple-600"
                    />
                    <p className="text-[12px] text-[#666]">enter IP or IP range to access the site</p>
                    <textarea
                      value={settings.maintenanceIpRange}
                      onChange={(e) => handleChange('maintenanceIpRange', e.target.value)}
                      className="w-full h-20 px-4 py-2 bg-[#f1f2f4] border border-[#d1d3e2] rounded text-[13px] outline-none focus:border-purple-400"
                    />
                  </div>
                  <div className="pt-1.5">{helpIcon}</div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none bg-white font-medium text-[#666] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_15px_center] bg-no-repeat"
                  >
                    <option>America/New_York</option>
                  </select>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Date Format</label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => handleChange('dateFormat', e.target.value)}
                    className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none bg-white font-medium text-[#666] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_15px_center] bg-no-repeat"
                  >
                    <option>Jan 30, 2026</option>
                  </select>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Google Analytics & Search Console</label>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-[13px] text-[#666]">Connected to <b>TopOneHire</b></span>
                    <span className="px-1.5 py-0.5 bg-[#f1f2f4] text-[#666] text-[10px] rounded font-bold">G-EEL8BXZK25</span>
                    <span className="text-[13px] text-[#666]">GA account</span>
                    <button className="px-4 py-1 bg-[#00c292] text-white text-[13px] font-bold rounded">Disconnect</button>
                    <div className="flex gap-3 ml-2">
                      <span className="text-[11px] text-[#6b7280] italic flex items-center gap-1">Google Analytics <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></span>
                      <span className="text-[11px] text-[#6b7280] italic flex items-center gap-1">Google Search Console <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg></span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Google Tag Manager</label>
                  <div className="flex-1 flex items-center gap-3">
                    <button className="px-4 py-1 bg-[#00c292] text-white text-[13px] font-bold rounded">Connect</button>
                    {helpIcon}
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Facebook Pixel ID</label>
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="text"
                      value={settings.facebookPixelId || ''}
                      onChange={(e) => handleChange('facebookPixelId', e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none focus:border-purple-400"
                    />
                    {helpIcon}
                  </div>
                </div>
              </div>
            )}

            {/* Job Board Settings */}
            {activeTab === 'Job Board Settings' && (
              <div className="space-y-6 max-w-5xl">
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Enable Private Job Access</label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.enablePrivateJobAccess === 'true'}
                      onChange={(e) => handleChange('enablePrivateJobAccess', e.target.checked)}
                      className="w-4 h-4 rounded border-[#d1d3e2] text-purple-600"
                    />
                    {helpIcon}
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Only registered job seekers can apply</label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.onlyRegisteredCanApply === 'true'}
                      onChange={(e) => handleChange('onlyRegisteredCanApply', e.target.checked)}
                      className="w-4 h-4 rounded border-[#d1d3e2] text-purple-600 shadow-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Employer Email Verification</label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.employerEmailVerification === 'true'}
                      onChange={(e) => handleChange('employerEmailVerification', e.target.checked)}
                      className="w-4 h-4 rounded border-[#d1d3e2] text-purple-600"
                    />
                    {helpIcon}
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Job Seeker Email Verification</label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.jobSeekerEmailVerification === 'true'}
                      onChange={(e) => handleChange('jobSeekerEmailVerification', e.target.checked)}
                      className="w-4 h-4 rounded border-[#d1d3e2] text-purple-600"
                    />
                    {helpIcon}
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Require Employer Approval</label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={settings.requireEmployerApproval}
                      onChange={(e) => handleChange('requireEmployerApproval', e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] text-[#666]"
                    />
                    {helpIcon}
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Require Job Seeker Approval</label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.requireJobSeekerApproval === 'true'}
                      onChange={(e) => handleChange('requireJobSeekerApproval', e.target.checked)}
                      className="w-4 h-4 rounded border-[#d1d3e2] text-purple-600"
                    />
                    {helpIcon}
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Automatic Job Alert Sign Up</label>
                  <div className="flex-1 flex items-center gap-2">
                    <select
                      value={settings.autoJobAlertSignUp}
                      onChange={(e) => handleChange('autoJobAlertSignUp', e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] text-[#666] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_15px_center] bg-no-repeat"
                    >
                      <option>None</option>
                    </select>
                    {helpIcon}
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Recruiting Pipeline</label>
                  <div className="flex-1 flex items-center gap-3">
                    <div className="flex-1 px-4 py-2 bg-white border border-[#d1d3e2] rounded flex gap-2 overflow-x-auto">
                      {['New', 'Interview', 'Made Offer', 'Disqualified'].map(s => (
                        <span key={s} className="px-2 py-0.5 bg-[#f1f2f4] text-[#666] text-[11px] font-bold rounded whitespace-nowrap">{s}</span>
                      ))}
                    </div>
                    <button className="px-4 py-1.5 bg-[#00c292] text-white text-[13px] font-bold rounded">Edit</button>
                    {helpIcon}
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Hide companies with 0 jobs</label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={settings.hideZeroJobCompanies === 'true'}
                      onChange={(e) => handleChange('hideZeroJobCompanies', e.target.checked)}
                      className="w-4 h-4 rounded border-[#d1d3e2] text-purple-600"
                    />
                    {helpIcon}
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Delete Expired Jobs</label>
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={settings.deleteExpiredJobs === 'true'}
                      onChange={(e) => handleChange('deleteExpiredJobs', e.target.checked)}
                      className="w-4 h-4 rounded border-[#d1d3e2] text-purple-600"
                    />
                    <span className="text-[13px] text-[#666]">after</span>
                    <input
                      type="number"
                      value={settings.deleteExpiredDays}
                      onChange={(e) => handleChange('deleteExpiredDays', e.target.value)}
                      className="w-20 px-3 py-1.5 border border-[#d1d3e2] rounded text-[13px] outline-none"
                    />
                    <span className="text-[13px] text-[#666]">days</span>
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Search by location</label>
                  <div className="flex-1">
                    <input
                      type="checkbox"
                      checked={settings.searchByLocation === 'true'}
                      onChange={(e) => handleChange('searchByLocation', e.target.checked)}
                      className="w-4 h-4 rounded border-[#d1d3e2] text-purple-600"
                    />
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Display radius in</label>
                  <select
                    value={settings.displayRadiusIn}
                    onChange={(e) => handleChange('displayRadiusIn', e.target.value)}
                    className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] text-[#666] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_15px_center] bg-no-repeat"
                  >
                    <option>Miles</option>
                  </select>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Limit location selection to</label>
                  <div className="flex-1 flex items-center gap-2">
                    <select
                      value={settings.limitLocationSelection}
                      onChange={(e) => handleChange('limitLocationSelection', e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] text-[#666] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_15px_center] bg-no-repeat"
                    >
                      <option>1 selected</option>
                    </select>
                    {helpIcon}
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">API Key</label>
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={settings.apiKey || ''}
                      onChange={(e) => handleChange('apiKey', e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none focus:border-purple-400"
                    />
                    {helpIcon}
                  </div>
                </div>
              </div>
            )}

            {/* Ecommerce Settings */}
            {activeTab === 'Ecommerce Settings' && (
              <div className="space-y-6 max-w-5xl">
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Currency</label>
                  <div className="flex-1 flex items-center gap-2">
                    <select
                      value={settings.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] text-[#666] appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_15px_center] bg-no-repeat"
                    >
                      <option>USD - United States Dollar</option>
                    </select>
                    {helpIcon}
                  </div>
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Tax</label>
                  <div className="flex-1 flex items-center">
                    <input
                      type="text"
                      value={settings.taxRate}
                      onChange={(e) => handleChange('taxRate', e.target.value)}
                      className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded-l text-[13px] outline-none"
                    />
                    <span className="px-4 py-2 bg-[#f1f2f4] border border-l-0 border-[#d1d3e2] rounded-r text-[13px] text-[#666]">%</span>
                  </div>
                </div>
                <div className="flex gap-8 items-start">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333] pt-2">Billing Address</label>
                  <textarea
                    value={settings.billingAddress}
                    onChange={(e) => handleChange('billingAddress', e.target.value)}
                    className="flex-1 h-32 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none"
                  />
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'SEO' && (
              <div className="space-y-6 max-w-5xl">
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Homepage Title</label>
                  <input
                    type="text"
                    value={settings.homepageTitle}
                    onChange={(e) => handleChange('homepageTitle', e.target.value)}
                    className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none"
                  />
                </div>
                <div className="flex gap-8 items-start">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333] pt-2">Meta Description</label>
                  <textarea
                    value={settings.metaDescription}
                    onChange={(e) => handleChange('metaDescription', e.target.value)}
                    className="flex-1 h-32 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none"
                  />
                </div>
                <div className="flex gap-8 items-start">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333] pt-2">Meta Keywords</label>
                  <textarea
                    value={settings.metaKeywords}
                    onChange={(e) => handleChange('metaKeywords', e.target.value)}
                    className="flex-1 h-24 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none"
                  />
                </div>
                <div className="flex gap-8 items-center">
                  <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">301 Redirects</label>
                  <button className="px-4 py-2 bg-[#00c292] text-white text-[13px] font-bold rounded">Edit Redirects</button>
                </div>
              </div>
            )}

            {/* Privacy Protection Tab */}
            {activeTab === 'Privacy Protection' && (
              <div className="max-w-5xl">
                <p className="text-[13px] text-[#666] mb-10">Privacy protection settings allow you to collect additional consent from your users to better comply with GDPR regulations.</p>
                <div className="space-y-6">
                  <div className="flex gap-8 items-center">
                    <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Terms of use opt-in on sign up</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.termsOptIn === 'true'}
                        onChange={(e) => handleChange('termsOptIn', e.target.checked)}
                        className="w-5 h-5 rounded border-[#d1d3e2] text-purple-600 shadow-sm"
                      />
                      {helpIcon}
                    </div>
                  </div>
                  <div className="flex gap-8 items-center">
                    <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Privacy policy opt-in on sign up</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.privacyOptIn === 'true'}
                        onChange={(e) => handleChange('privacyOptIn', e.target.checked)}
                        className="w-5 h-5 rounded border-[#d1d3e2] text-purple-600 shadow-sm"
                      />
                      {helpIcon}
                    </div>
                  </div>
                  <div className="flex gap-8 items-center">
                    <label className="w-1/4 text-right text-[13px] font-bold text-[#333]">Newsletter opt-in on sign up</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={settings.newsletterOptIn === 'true'}
                        onChange={(e) => handleChange('newsletterOptIn', e.target.checked)}
                        className="w-5 h-5 rounded border-[#d1d3e2] text-purple-600"
                      />
                      {helpIcon}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-12 flex ml-[25%] pl-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-2.5 bg-[#6c6fe2] text-white text-[13px] font-bold rounded shadow-sm hover:brightness-105 transition-all"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
