'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';

export default function AddJobPage() {
  const router = useRouter();
  const [employer, setEmployer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [availableCategories, setAvailableCategories] = useState<any[]>([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    jobTitle: '',
    jobDescription: '',
    jobType: '',
    categories: '',
    locationType: 'Onsite',
    locationDetails: '',
    salaryFrom: '',
    salaryTo: '',
    salaryFrequency: 'yearly',
    howToApply: 'email',
    applyValue: '',
    expirationDate: '',
  });

  useEffect(() => {
    const auth = localStorage.getItem('employerAuth');
    const employerData = localStorage.getItem('employerUser');

    if (!auth || !employerData) {
      router.push('/login?redirect=/my-account/job-postings/add');
    } else {
      const emp = JSON.parse(employerData);
      setEmployer(emp);
      // Empty applyValue as requested
      setFormData(prev => ({
        ...prev,
        applyValue: '',
      }));
      setLoading(false);
      checkSubscription(emp.email);
      fetchCategories();
    }
  }, [router]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.categories) {
        setAvailableCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const checkSubscription = async (employerEmail: string) => {
    setCheckingSubscription(true);
    try {
      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employerEmail }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to check subscription');

      if (!data.subscription.hasActiveSubscription) {
        router.replace('/employer-products');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      router.replace('/employer-products');
    } finally {
      setCheckingSubscription(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (catName: string) => {
    setFormData(prev => ({ ...prev, categories: catName }));
    setShowCategorySelector(false);
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      setFormData((prev) => ({ ...prev, jobDescription: editorRef.current!.innerHTML }));
    }
  };

  const applyFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleEditorInput();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobDescription || formData.jobDescription === '<br>' || formData.jobDescription === '') {
      alert('Please enter a job description');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.jobTitle,
          employer: employer?.companyName || employer?.email || '',
          product: null,
          jobDescription: formData.jobDescription,
          jobType: formData.jobType,
          categories: formData.categories,
          location: `${formData.locationType}${formData.locationDetails ? ` - ${formData.locationDetails}` : ''}`,
          salaryFrom: formData.salaryFrom || null,
          salaryTo: formData.salaryTo || null,
          salaryFrequency: formData.salaryFrequency,
          howToApply: formData.howToApply,
          applyValue: formData.applyValue || null,
          featured: false,
          status: 'Active',
          expirationDate: formData.expirationDate || null,
        }),
      });

      if (response.ok) {
        alert('Job posted successfully!');
        router.push('/my-account/job-postings');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to post job'}`);
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('An error occurred while posting the job');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4 font-medium uppercase tracking-widest text-sm">
            {checkingSubscription ? 'Securing Access...' : 'Loading...'}
          </div>
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Header activePage="my-account" />

      <div className="container mx-auto px-4 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2 uppercase" style={{ fontFamily: 'serif' }}>Post a Job</h1>
            <p className="text-gray-500 text-sm">Fill in the details below to find your next great hire.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-10 shadow-sm space-y-8">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-tight">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="jobTitle"
                placeholder="e.g. Senior Software Engineer"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 font-medium text-gray-900"
                required
              />
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-tight">
                Job Description <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-t-xl bg-gray-50/50 p-2 flex items-center gap-1 flex-wrap">
                <button type="button" onClick={() => applyFormat('bold')} className="p-2.5 hover:bg-white hover:shadow-sm rounded transition-all text-sm font-bold w-10 h-10 flex items-center justify-center border border-transparent hover:border-gray-200" title="Bold">B</button>
                <button type="button" onClick={() => applyFormat('italic')} className="p-2.5 hover:bg-white hover:shadow-sm rounded transition-all text-sm italic w-10 h-10 flex items-center justify-center border border-transparent hover:border-gray-200" title="Italic">I</button>
                <button type="button" onClick={() => applyFormat('underline')} className="p-2.5 hover:bg-white hover:shadow-sm rounded transition-all text-sm underline w-10 h-10 flex items-center justify-center border border-transparent hover:border-gray-200" title="Underline">U</button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button type="button" onClick={() => { const u = prompt('URL:'); if (u) applyFormat('createLink', u); }} className="p-2.5 hover:bg-white hover:shadow-sm rounded transition-all text-sm w-10 h-10 flex items-center justify-center border border-transparent hover:border-gray-200" title="Link">🔗</button>
                <button type="button" onClick={() => applyFormat('insertUnorderedList')} className="p-2.5 hover:bg-white hover:shadow-sm rounded transition-all text-sm w-10 h-10 flex items-center justify-center border border-transparent hover:border-gray-200" title="Bullets">•</button>
                <button type="button" onClick={() => applyFormat('insertOrderedList')} className="p-2.5 hover:bg-white hover:shadow-sm rounded transition-all text-sm w-10 h-10 flex items-center justify-center border border-transparent hover:border-gray-200" title="List">1.</button>
                <div className="w-px h-6 bg-gray-300 mx-1"></div>
                <button type="button" onClick={() => applyFormat('justifyLeft')} className="p-2.5 hover:bg-white hover:shadow-sm rounded transition-all text-sm w-10 h-10 flex items-center justify-center border border-transparent hover:border-gray-200" title="Left">⬅</button>
                <button type="button" onClick={() => applyFormat('justifyCenter')} className="p-2.5 hover:bg-white hover:shadow-sm rounded transition-all text-sm w-10 h-10 flex items-center justify-center border border-transparent hover:border-gray-200" title="Center">⬌</button>
                <button type="button" onClick={() => applyFormat('justifyRight')} className="p-2.5 hover:bg-white hover:shadow-sm rounded transition-all text-sm w-10 h-10 flex items-center justify-center border border-transparent hover:border-gray-200" title="Right">➡</button>
              </div>
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                onBlur={handleEditorInput}
                className="w-full min-h-[300px] px-6 py-5 border border-gray-300 border-t-0 rounded-b-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-y leading-relaxed"
                data-placeholder="Describe the responsibilities, requirements, and culture..."
                suppressContentEditableWarning={true}
              />
            </div>

            {/* Job Type & Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-tight">
                  Job Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none bg-white font-medium text-gray-900"
                  required
                >
                  <option value="">Select Job Type</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-tight">
                  Categories <span className="text-red-500">*</span>
                </label>
                {/* Selected Category Display */}
                <div
                  className="flex items-center px-4 py-3 min-h-[54px] border border-gray-300 rounded-lg bg-gray-50 cursor-pointer focus-within:ring-2 focus-within:ring-yellow-500 transition-all justify-between"
                  onClick={() => setShowCategorySelector(!showCategorySelector)}
                >
                  {formData.categories ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-yellow-100 text-yellow-800 text-sm font-bold border border-yellow-200">
                      {formData.categories}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, categories: '' })); }}
                        className="ml-2 text-yellow-600 hover:text-yellow-900"
                      >
                        ✕
                      </button>
                    </span>
                  ) : (
                    <span className="text-gray-400 font-medium">Select a category...</span>
                  )}
                  <div className="text-gray-400">
                    {showCategorySelector ? '▴' : '▾'}
                  </div>
                </div>

                {showCategorySelector && (
                  <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl max-h-[400px] overflow-hidden flex flex-col animate-in fade-in duration-200">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Categories</span>
                        <button type="button" onClick={() => setShowCategorySelector(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
                      </div>
                      <input
                        type="text"
                        placeholder="Search categories..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        onChange={(e) => {
                          const val = e.target.value.toLowerCase();
                          const items = document.querySelectorAll('.category-item');
                          items.forEach((item: any) => {
                            const text = item.textContent?.toLowerCase() || '';
                            item.style.display = text.includes(val) ? 'flex' : 'none';
                          });
                        }}
                      />
                    </div>

                    <div className="overflow-y-auto p-4 max-h-[250px] grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {availableCategories.map(cat => (
                        <label key={cat.id} className="category-item flex items-center p-2.5 hover:bg-yellow-50 rounded-lg cursor-pointer transition-colors group">
                          <input
                            type="radio"
                            name="category-selection"
                            checked={formData.categories === cat.name}
                            onChange={() => handleCategoryToggle(cat.name)}
                            className="mr-3 w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400"
                          />
                          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100">
              <label className="block text-sm font-bold text-gray-800 mb-4 uppercase tracking-tight">Location</label>
              <div className="flex gap-10 mb-5">
                {['Onsite', 'Remote', 'Hybrid'].map(type => (
                  <label key={type} className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="locationType"
                      value={type}
                      checked={formData.locationType === type}
                      onChange={handleInputChange}
                      className="mr-2.5 w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400"
                    />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors uppercase tracking-tight">{type}</span>
                  </label>
                ))}
              </div>
              <input
                type="text"
                name="locationDetails"
                value={formData.locationDetails}
                onChange={handleInputChange}
                placeholder="e.g. New York, NY or Worldwide"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white font-medium"
              />
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-tight">Salary Range</label>
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    name="salaryFrom"
                    value={formData.salaryFrom}
                    onChange={handleInputChange}
                    placeholder="From"
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
                  />
                </div>
                <span className="text-gray-400 font-bold">—</span>
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    name="salaryTo"
                    value={formData.salaryTo}
                    onChange={handleInputChange}
                    placeholder="To"
                    className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 font-medium"
                  />
                </div>
                <select
                  name="salaryFrequency"
                  value={formData.salaryFrequency}
                  onChange={handleInputChange}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white font-bold text-sm uppercase tracking-wider"
                >
                  <option value="hourly">hourly</option>
                  <option value="monthly">monthly</option>
                  <option value="yearly">yearly</option>
                </select>
              </div>
            </div>

            {/* How to Apply */}
            <div className="bg-yellow-50/30 p-6 rounded-xl border border-yellow-100">
              <label className="block text-sm font-bold text-gray-800 mb-4 uppercase tracking-tight">How to Apply</label>
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="flex gap-6">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="howToApply"
                      value="email"
                      checked={formData.howToApply === 'email'}
                      onChange={handleInputChange}
                      className="mr-2.5 w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400"
                    />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors uppercase tracking-tight">By Email</span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="radio"
                      name="howToApply"
                      value="url"
                      checked={formData.howToApply === 'url'}
                      onChange={handleInputChange}
                      className="mr-2.5 w-4 h-4 text-yellow-500 border-gray-300 focus:ring-yellow-400"
                    />
                    <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors uppercase tracking-tight">By URL</span>
                  </label>
                </div>
                <div className="flex-1 w-full">
                  <input
                    type={formData.howToApply === 'email' ? 'email' : 'url'}
                    name="applyValue"
                    value={formData.applyValue}
                    onChange={handleInputChange}
                    placeholder={formData.howToApply === 'email' ? 'e.g. hr@company.com' : 'e.g. https://company.com/apply'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2 uppercase tracking-tight">Expiration Date</label>
              <div className="relative">
                <input
                  type="date"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white font-medium"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8 border-t border-gray-100 mt-10">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-900 font-extrabold rounded-xl text-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest"
              >
                {submitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'POST JOB NOW'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
