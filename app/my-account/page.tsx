'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MyAccountPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [employer, setEmployer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('employerAuth');
    const employerData = localStorage.getItem('employerUser');

    if (!auth || !employerData) {
      router.push('/login');
    } else {
      setEmployer(JSON.parse(employerData));
      setLoading(false);
    }
  }, [router]);

  // Fetch employer statistics
  const fetchStats = async () => {
    if (!employer) return;

    setLoadingStats(true);
    try {
      const response = await fetch(`/api/employers/${employer.id}/stats?timeRange=${encodeURIComponent(timeRange)}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      } else {
        console.error('Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch stats when employer or timeRange changes
  useEffect(() => {
    fetchStats();
  }, [employer, timeRange]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const getStatsArray = () => {
    const defaultStats = {
      jobsPosted: 0,
      jobViews: 0,
      applications: 0,
      applyClicks: 0,
      applyRate: '0.00%',
      activeJobs: 0,
    };

    const currentStats = stats || defaultStats;

    return [
      {
        label: 'Total Jobs',
        value: currentStats.jobsPosted.toString(),
        icon: (
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        ),
        color: 'blue',
      },
      {
        label: 'Active Jobs',
        value: (currentStats.activeJobs || 0).toString(),
        icon: (
          <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        ),
        color: 'green',
      },
      {
        label: 'Job Views',
        value: currentStats.jobViews.toString(),
        icon: (
          <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        ),
        color: 'orange',
      },
      {
        label: 'Applications',
        value: currentStats.applications.toString(),
        icon: (
          <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01" />
            </svg>
          </div>
        ),
        color: 'purple',
      },
      {
        label: 'Conversion',
        value: currentStats.applyRate,
        icon: (
          <div className="w-12 h-12 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        ),
        color: 'pink',
      },
    ];
  };

  return (
    <div className="min-h-screen bg-white">
      <Header activePage="my-account" />

      <div className="container mx-auto px-4 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">My Account</h1>

          {/* Tabs Navigation */}
          <div className="flex justify-center border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              <Link
                href="/my-account"
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${pathname === '/my-account'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Dashboard
              </Link>
              <Link
                href="/my-account/job-postings"
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${pathname === '/my-account/job-postings'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Job Postings
              </Link>
              <Link
                href="/my-account/applications"
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${pathname === '/my-account/applications'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Applications
              </Link>
              <Link
                href="/my-account/invoices"
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${pathname === '/my-account/invoices'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Invoices
              </Link>
              <Link
                href="/my-account/company-settings"
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${pathname === '/my-account/company-settings'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                Company Settings
              </Link>
            </nav>
          </div>

          {/* Dashboard Content */}
          {pathname === '/my-account' && (
            <div>
              {/* Time Range Filter */}
              <div className="mb-6 flex items-center gap-3">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                >
                  <option>Last 7 days</option>
                  <option>Last 30 days</option>
                  <option>Last 90 days</option>
                  <option>Last year</option>
                  <option>All time</option>
                </select>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
                {getStatsArray().map((stat, index) => (
                  <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                    {loadingStats && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      {stat.icon}
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{timeRange.split(' ')[1] || 'Time'}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform origin-left">{stat.value}</div>
                      <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                    </div>
                    <div className={`absolute bottom-0 left-0 h-1 bg-${stat.color}-500 w-0 group-hover:w-full transition-all duration-300`}></div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
