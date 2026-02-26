'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ApplicationModal from './ApplicationModal';

interface JobDetail {
  id: string;
  title: string;
  employer: string;
  jobDescription: string;
  jobType: string;
  categories: string;
  location: string;
  salaryFrom: string | null;
  salaryTo: string | null;
  salaryFrequency: string | null;
  howToApply: string;
  applyValue: string | null;
  postingDate: string;
  expirationDate: string | null;
  status: string;
}

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const auth = localStorage.getItem('jobSeekerAuth');
    const userData = localStorage.getItem('jobSeekerUser');
    if (auth === 'true' && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data.job);
        } else {
          setJob(null);
        }
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header activePage="jobs" />
        <div className="container mx-auto px-4 py-12 text-center text-gray-600">Loading...</div>
        <Footer />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-white">
        <Header activePage="jobs" />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 mb-4">Job not found.</p>
          <Link href="/jobs" className="text-yellow-500 hover:text-yellow-600 font-medium">
            Back to jobs
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header activePage="jobs" />
      <div className="container mx-auto px-4 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-8">
        <div className="max-w-4xl mx-auto">
          <Link href="/jobs" className="inline-flex items-center text-gray-600 hover:text-yellow-500 mb-6 text-sm">
            ← Back to jobs
          </Link>
          <div className="bg-white border border-gray-200 rounded-lg p-6 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <p className="text-gray-600 mb-4">{job.employer}</p>
            <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-6">
              <span>{job.location}</span>
              <span>•</span>
              <span>{job.jobType}</span>
              <span>•</span>
              <span>{job.categories}</span>
              <span>•</span>
              <span>Posted {formatDate(job.postingDate)}</span>
            </div>
            {(job.salaryFrom || job.salaryTo) && (
              <p className="text-gray-700 mb-4">
                Salary: ${job.salaryFrom ?? '—'} - ${job.salaryTo ?? '—'} {job.salaryFrequency ?? 'yearly'}
              </p>
            )}
            <div className="prose prose-gray max-w-none mb-8">
              <div dangerouslySetInnerHTML={{ __html: job.jobDescription }} />
            </div>
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">How to apply</h3>
              <p className="text-gray-700">
                {job.howToApply === 'email' && job.applyValue
                  ? `Email: ${job.applyValue}`
                  : job.applyValue ?? 'See job description for application instructions.'}
              </p>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col items-center">
              {isLoggedIn ? (
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="w-full md:w-auto px-12 py-4 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Apply for this job
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">Please log in as a job seeker to apply for this position.</p>
                  <Link
                    href={`/login?redirect=/jobs/${id}`}
                    className="inline-block px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all"
                  >
                    Login to Apply
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isApplyModalOpen && job && (
        <ApplicationModal
          job={job}
          user={user}
          onClose={() => setIsApplyModalOpen(false)}
        />
      )}

      <Footer />
    </div>
  );
}
