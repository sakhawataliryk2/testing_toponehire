'use client';

import { useState } from 'react';

interface JobsSidebarProps {
  jobs?: any[];
  selectedCategories?: string[];
  selectedJobTypes?: string[];
  selectedSalaryRange?: string | null;
  selectedLocationType?: string | null;
  onCategoryToggle?: (category: string) => void;
  onJobTypeToggle?: (jobType: string) => void;
  onSalaryRangeSelect?: (range: string | null) => void;
  onLocationTypeSelect?: (type: string | null) => void;
}

export default function JobsSidebar({
  jobs = [],
  selectedCategories = [],
  selectedJobTypes = [],
  selectedSalaryRange = null,
  selectedLocationType = null,
  onCategoryToggle,
  onJobTypeToggle,
  onSalaryRangeSelect,
  onLocationTypeSelect,
}: JobsSidebarProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Calculate real counts from "all" jobs (unfiltered by sidebar, but filtered by search)
  const categoryCounts: { [key: string]: number } = {};
  const jobTypeCounts: { [key: string]: number } = {};
  let onsiteCount = 0;
  let remoteCount = 0;

  jobs.forEach((job) => {
    // Count categories
    if (job.categories) {
      const cats = job.categories.split(',').map((c: string) => c.trim());
      cats.forEach((cat: string) => {
        if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    }

    // Count job types
    if (job.jobType) {
      const type = job.jobType.trim();
      if (type) jobTypeCounts[type] = (jobTypeCounts[type] || 0) + 1;
    }

    // Count location type
    const loc = job.location?.toLowerCase() || '';
    if (loc.includes('remote')) {
      remoteCount++;
    } else {
      onsiteCount++;
    }
  });

  const categories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const jobTypes = Object.entries(jobTypeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const salaryRanges = [
    { label: 'up to $20,000', min: 0, max: 20000 },
    { label: '$20,000 - $40,000', min: 20000, max: 40000 },
    { label: '$40,000 - $75,000', min: 40000, max: 75000 },
    { label: '$75,000 - $100,000', min: 75000, max: 100000 },
    { label: '$100,000 - $150,000', min: 100000, max: 150000 },
    { label: '$150,000 - $200,000', min: 150000, max: 200000 },
    { label: 'more than $200,000', min: 200000, max: 1000000 },
  ];

  return (
    <div className="space-y-6">
      {/* Email Job Alerts */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Email me jobs like this</h3>
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!email.trim()) return;
            setSubmitting(true);
            setMessage(null);
            try {
              const res = await fetch('/api/job-alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), frequency: 'Daily' }),
              });
              const data = await res.json();
              if (res.ok) {
                setMessage({ type: 'success', text: data.message || 'Alert created successfully.' });
                setEmail('');
              } else {
                setMessage({ type: 'error', text: data.error || 'Failed to create alert.' });
              }
            } catch {
              setMessage({ type: 'error', text: 'Failed to create alert.' });
            } finally {
              setSubmitting(false);
            }
          }}
        >
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          {message && (
            <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'CREATE ALERT'}
          </button>
        </form>
      </div>

      {/* Refine by Categories */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Refine by Categories</h3>
          {selectedCategories.length > 0 && (
            <button
              onClick={() => selectedCategories.forEach(c => onCategoryToggle?.(c))}
              className="text-xs text-yellow-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <ul className="space-y-2">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <li key={index}>
                <button
                  onClick={() => onCategoryToggle?.(category.name)}
                  className={`flex w-full justify-between items-center text-left transition-colors hover:text-yellow-500 ${selectedCategories.includes(category.name) ? 'text-yellow-500 font-bold' : 'text-gray-700'
                    }`}
                >
                  <span>{category.name}</span>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${selectedCategories.includes(category.name) ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {category.count}
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-sm italic">No categories available</li>
          )}
        </ul>
      </div>

      {/* Refine by Job Type */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Refine by Job Type</h3>
          {selectedJobTypes.length > 0 && (
            <button
              onClick={() => selectedJobTypes.forEach(t => onJobTypeToggle?.(t))}
              className="text-xs text-yellow-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <ul className="space-y-2">
          {jobTypes.length > 0 ? (
            jobTypes.map((type, index) => (
              <li key={index}>
                <button
                  onClick={() => onJobTypeToggle?.(type.name)}
                  className={`flex w-full justify-between items-center text-left transition-colors hover:text-yellow-500 ${selectedJobTypes.includes(type.name) ? 'text-yellow-500 font-bold' : 'text-gray-700'
                    }`}
                >
                  <span>{type.name}</span>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${selectedJobTypes.includes(type.name) ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {type.count}
                  </span>
                </button>
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-sm italic">No job types available</li>
          )}
        </ul>
      </div>

      {/* Refine by Salary Range */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Refine by Salary</h3>
          {selectedSalaryRange && (
            <button
              onClick={() => onSalaryRangeSelect?.(null)}
              className="text-xs text-yellow-600 hover:underline"
            >
              Clear
            </button>
          )}
        </div>
        <ul className="space-y-2">
          {salaryRanges.map((range, index) => (
            <li key={index}>
              <button
                onClick={() => onSalaryRangeSelect?.(range.label === selectedSalaryRange ? null : range.label)}
                className={`flex w-full items-center text-left transition-colors hover:text-yellow-500 ${selectedSalaryRange === range.label ? 'text-yellow-500 font-bold' : 'text-gray-700'
                  }`}
              >
                <span>{range.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Refine by Onsite/Remote */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Refine by Location</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onLocationTypeSelect?.(selectedLocationType === 'Onsite' ? null : 'Onsite')}
              className={`flex w-full justify-between items-center text-left transition-colors hover:text-yellow-500 ${selectedLocationType === 'Onsite' ? 'text-yellow-500 font-bold' : 'text-gray-700'
                }`}
            >
              <span>Onsite</span>
              <span className={`text-sm px-2 py-0.5 rounded-full ${selectedLocationType === 'Onsite' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                }`}>
                {onsiteCount}
              </span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onLocationTypeSelect?.(selectedLocationType === 'Remote' ? null : 'Remote')}
              className={`flex w-full justify-between items-center text-left transition-colors hover:text-yellow-500 ${selectedLocationType === 'Remote' ? 'text-yellow-500 font-bold' : 'text-gray-700'
                }`}
            >
              <span>Remote</span>
              <span className={`text-sm px-2 py-0.5 rounded-full ${selectedLocationType === 'Remote' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                }`}>
                {remoteCount}
              </span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
