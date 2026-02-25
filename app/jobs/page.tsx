'use client';

import { Suspense, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobSearchBar from '../components/JobSearchBar';
import JobCard from '../components/JobCard';
import JobsSidebar from '../components/JobsSidebar';

interface Job {
  id: string;
  title: string;
  employer: string;
  jobDescription: string;
  location: string;
  postingDate: string;
  categories: string;
  jobType: string;
  salaryFrom?: string;
  salaryTo?: string;
}

function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string | null>(null);
  const [selectedLocationType, setSelectedLocationType] = useState<string | null>(null);

  const [jobSeeker, setJobSeeker] = useState<{ id: string } | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [savingJobId, setSavingJobId] = useState<string | null>(null);

  useEffect(() => {
    const auth = typeof window !== 'undefined' ? localStorage.getItem('jobSeekerAuth') : null;
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('jobSeekerUser') : null;
    if (auth && userStr) {
      try {
        const user = JSON.parse(userStr);
        setJobSeeker(user);
      } catch {
        setJobSeeker(null);
      }
    } else {
      setJobSeeker(null);
    }
  }, []);

  const fetchSavedJobs = useCallback(async (jobSeekerId: string) => {
    try {
      const res = await fetch(`/api/job-seekers/saved-jobs?jobSeekerId=${encodeURIComponent(jobSeekerId)}`);
      if (res.ok) {
        const data = await res.json();
        setSavedJobIds(new Set(data.savedJobIds ?? []));
      }
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  }, []);

  useEffect(() => {
    if (jobSeeker?.id) fetchSavedJobs(jobSeeker.id);
  }, [jobSeeker?.id, fetchSavedJobs]);

  // After login with saveJobId, auto-save that job and clear the param (once per jobSeeker + saveJobId)
  const processedSaveJobIdRef = useRef<string | null>(null);
  useEffect(() => {
    const saveJobId = searchParams.get('saveJobId');
    if (!saveJobId || !jobSeeker?.id || processedSaveJobIdRef.current === saveJobId) return;
    processedSaveJobIdRef.current = saveJobId;
    (async () => {
      try {
        const res = await fetch('/api/job-seekers/saved-jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobSeekerId: jobSeeker.id, jobId: saveJobId }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.saved !== false) {
          setSavedJobIds((prev) => new Set([...prev, saveJobId]));
        }
      } catch (_) { }
      const u = new URL(window.location.href);
      u.searchParams.delete('saveJobId');
      router.replace(u.pathname + u.search);
    })();
  }, [jobSeeker?.id, searchParams.get('saveJobId'), router]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/jobs?status=Active');
        const data = await response.json();
        if (data.jobs) {
          setJobs(data.jobs);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    // Set initial search from URL
    const k = searchParams.get('keywords');
    const l = searchParams.get('location');
    if (k) setSearchKeyword(k);
    if (l) setSearchLocation(l);
  }, [searchParams]);

  useEffect(() => {
    let filtered = jobs;

    // Search Keyword
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(kw) ||
          job.employer.toLowerCase().includes(kw) ||
          job.jobDescription.toLowerCase().includes(kw)
      );
    }

    // Search Location
    if (searchLocation) {
      const loc = searchLocation.toLowerCase();
      filtered = filtered.filter((job) =>
        job.location.toLowerCase().includes(loc)
      );
    }

    // Category Filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((job) => {
        const jobCats = job.categories.split(',').map(c => c.trim());
        return selectedCategories.some(cat => jobCats.includes(cat));
      });
    }

    // Job Type Filter
    if (selectedJobTypes.length > 0) {
      filtered = filtered.filter((job) =>
        selectedJobTypes.includes(job.jobType.trim())
      );
    }

    // Location Type Filter (Remote/Onsite)
    if (selectedLocationType) {
      filtered = filtered.filter((job) => {
        const loc = job.location.toLowerCase();
        if (selectedLocationType === 'Remote') return loc.includes('remote');
        if (selectedLocationType === 'Onsite') return !loc.includes('remote');
        return true;
      });
    }

    // Salary Range Filter
    if (selectedSalaryRange) {
      filtered = filtered.filter((job) => {
        const salary = parseInt(job.salaryTo || job.salaryFrom || '0');
        if (isNaN(salary)) return true;

        if (selectedSalaryRange === 'up to $20,000') return salary <= 20000;
        if (selectedSalaryRange === '$20,000 - $40,000') return salary >= 20000 && salary <= 40000;
        if (selectedSalaryRange === '$40,000 - $75,000') return salary >= 40000 && salary <= 75000;
        if (selectedSalaryRange === '$75,000 - $100,000') return salary >= 75000 && salary <= 100000;
        if (selectedSalaryRange === '$100,000 - $150,000') return salary >= 100000 && salary <= 150000;
        if (selectedSalaryRange === '$150,000 - $200,000') return salary >= 150000 && salary <= 200000;
        if (selectedSalaryRange === 'more than $200,000') return salary >= 200000;
        return true;
      });
    }

    setFilteredJobs(filtered);
  }, [searchKeyword, searchLocation, jobs, selectedCategories, selectedJobTypes, selectedSalaryRange, selectedLocationType]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleJobType = (jobType: string) => {
    setSelectedJobTypes(prev =>
      prev.includes(jobType) ? prev.filter(t => t !== jobType) : [...prev, jobType]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const stripHtml = (html: string) => {
    if (typeof window !== 'undefined') {
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    }
    return html.replace(/<[^>]*>/g, '').substring(0, 300);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header activePage="jobs" />
      <JobSearchBar
        keyword={searchKeyword}
        location={searchLocation}
        onKeywordChange={setSearchKeyword}
        onLocationChange={setSearchLocation}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Job Listings */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                {loading ? 'LOADING...' : `${filteredJobs.length.toLocaleString()} JOBS FOUND`}
              </h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Loading jobs...</p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No jobs found. Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    jobId={job.id}
                    date={formatDate(job.postingDate)}
                    title={job.title}
                    description={stripHtml(job.jobDescription)}
                    company={job.employer.toUpperCase()}
                    location={job.location.toUpperCase()}
                    isSaved={jobSeeker ? savedJobIds.has(job.id) : false}
                    saving={savingJobId === job.id}
                    onSaveToggle={
                      jobSeeker
                        ? async (jobId, save) => {
                          setSavingJobId(jobId);
                          try {
                            if (save) {
                              const res = await fetch('/api/job-seekers/saved-jobs', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ jobSeekerId: jobSeeker.id, jobId }),
                              });
                              const data = await res.json().catch(() => ({}));
                              if (res.ok && data.saved !== false) {
                                setSavedJobIds((prev) => new Set([...prev, jobId]));
                              } else {
                                if (jobSeeker.id) fetchSavedJobs(jobSeeker.id);
                              }
                            } else {
                              const res = await fetch(
                                `/api/job-seekers/saved-jobs?jobSeekerId=${encodeURIComponent(jobSeeker.id)}&jobId=${encodeURIComponent(jobId)}`,
                                { method: 'DELETE' }
                              );
                              if (res.ok) {
                                setSavedJobIds((prev) => {
                                  const next = new Set(prev);
                                  next.delete(jobId);
                                  return next;
                                });
                              } else if (jobSeeker.id) {
                                fetchSavedJobs(jobSeeker.id);
                              }
                            }
                          } catch (err) {
                            console.error('Failed to update saved job:', err);
                            if (jobSeeker?.id) fetchSavedJobs(jobSeeker.id);
                          } finally {
                            setSavingJobId(null);
                          }
                        }
                        : (jobId, save) => {
                          if (save) {
                            router.push(
                              '/login?returnUrl=' +
                              encodeURIComponent('/jobs') +
                              '&saveJobId=' +
                              encodeURIComponent(jobId)
                            );
                          }
                        }
                    }
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1">
            <JobsSidebar
              jobs={jobs}
              selectedCategories={selectedCategories}
              selectedJobTypes={selectedJobTypes}
              selectedSalaryRange={selectedSalaryRange}
              selectedLocationType={selectedLocationType}
              onCategoryToggle={toggleCategory}
              onJobTypeToggle={toggleJobType}
              onSalaryRangeSelect={setSelectedSalaryRange}
              onLocationTypeSelect={setSelectedLocationType}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <Header activePage="jobs" />
          <JobSearchBar onKeywordChange={() => { }} onLocationChange={() => { }} />
          <div className="container mx-auto px-4 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-8">
            <div className="text-center py-12">
              <p className="text-gray-600">Loading jobs...</p>
            </div>
          </div>
          <Footer />
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}
