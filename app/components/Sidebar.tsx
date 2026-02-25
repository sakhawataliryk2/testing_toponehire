'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SidebarProps {
  jobs?: any[];
}

export default function Sidebar({ jobs = [] }: SidebarProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [alertKeywords, setAlertKeywords] = useState('');
  const [submittingAlert, setSubmittingAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [adminCategories, setAdminCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setAdminCategories(data.categories);
      })
      .catch(console.error);
  }, []);

  const handlePostJob = async () => {
    const auth = localStorage.getItem('employerAuth');
    const employerData = localStorage.getItem('employerUser');

    if (!auth || !employerData) {
      router.push('/login?returnUrl=/my-account/job-postings/add');
      return;
    }

    const emp = JSON.parse(employerData);

    try {
      const response = await fetch('/api/check-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employerEmail: emp.email }),
      });

      const data = await response.json();

      if (!response.ok || !data.subscription.hasActiveSubscription) {
        router.replace('/employer-products');
      } else {
        router.push('/my-account/job-postings/add');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      router.replace('/employer-products');
    }
  };

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmittingAlert(true);
    setAlertMessage(null);
    try {
      const res = await fetch('/api/job-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          keywords: alertKeywords.trim(),
          frequency: 'Weekly'
        }),
      });
      if (res.ok) {
        setAlertMessage({ type: 'success', text: 'Alert created successfully!' });
        setEmail('');
        setAlertKeywords('');
      } else {
        setAlertMessage({ type: 'error', text: 'Failed to create alert.' });
      }
    } catch {
      setAlertMessage({ type: 'error', text: 'An error occurred.' });
    } finally {
      setSubmittingAlert(false);
    }
  };

  // Dynamic Categories and Locations Counts
  const categoryCounts: { [key: string]: number } = {};
  const locationCounts: { [key: string]: number } = {};

  jobs.forEach(job => {
    if (job.categories) {
      job.categories.split(',').forEach((c: string) => {
        const cat = c.trim();
        if (cat) categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    }
    if (job.location) {
      const loc = job.location.trim();
      if (loc) locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    }
  });

  // Use Admin Categories as base
  let categories = adminCategories.map(cat => ({
    name: cat.name,
    count: categoryCounts[cat.name] || 0
  }));

  // Fallback to derived categories if admin list is empty for now
  if (categories.length === 0) {
    categories = Object.entries(categoryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  const locations = Object.entries(locationCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Employers Section */}
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-6 shadow-sm">
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center uppercase">For Employers</h3>
        <p className="text-gray-700 mb-4 text-center">
          Advertise your job to get qualified applicants.
        </p>
        <button
          onClick={handlePostJob}
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded transition-colors shadow-sm"
        >
          POST A JOB
        </button>
      </div>

      {/* Job Alerts Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase">Sign up for job alerts</h3>
        <form className="space-y-3" onSubmit={handleCreateAlert}>
          <input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
          />
          <input
            type="text"
            placeholder="Keywords"
            value={alertKeywords}
            onChange={(e) => setAlertKeywords(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
          />
          {alertMessage && (
            <p className={`text-xs ${alertMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {alertMessage.text}
            </p>
          )}
          <button
            type="submit"
            disabled={submittingAlert}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded transition-colors disabled:opacity-50 text-sm"
          >
            {submittingAlert ? 'CREATING...' : 'CREATE ALERT'}
          </button>
        </form>
      </div>

      {/* Category Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm text-center">
        <h4 className="text-lg font-bold text-gray-800 mb-3 border-b-2 border-yellow-400 pb-2">Refine by Categories</h4>
        <ul className="space-y-2">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <li key={index}>
                <button
                  onClick={() => router.push(`/jobs?keywords=${encodeURIComponent(category.name)}`)}
                  className="flex justify-between w-full text-gray-700 hover:text-yellow-500 transition-colors group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">{category.name}</span>
                  <span className="font-semibold text-yellow-500">{category.count}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-sm italic">No categories found</li>
          )}
        </ul>
      </div>

      {/* Location Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-yellow-400 pb-2 uppercase">Jobs by Location</h3>
        <ul className="space-y-2">
          {locations.length > 0 ? (
            locations.map((loc, index) => (
              <li key={index}>
                <button
                  onClick={() => router.push(`/jobs?location=${encodeURIComponent(loc.name)}`)}
                  className="flex justify-between w-full text-gray-700 hover:text-yellow-500 transition-colors group"
                >
                  <span className="group-hover:translate-x-1 transition-transform">{loc.name}</span>
                  <span className="font-semibold text-yellow-500">{loc.count}</span>
                </button>
              </li>
            ))
          ) : (
            <li className="text-gray-500 text-sm italic">No locations found</li>
          )}
        </ul>
      </div>
    </div>
  );
}
