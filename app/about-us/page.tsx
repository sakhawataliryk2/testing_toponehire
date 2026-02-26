import Header from '../components/Header';
import Footer from '../components/Footer';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header activePage="about-us" />

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-12 lg:px-16 xl:px-24 2xl:px-32 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About Us</h1>

            {/* Logo */}
            <div className="mb-6">
              <Image
                src="/images/logo.jpg"
                alt="TopOneHire Logo"
                width={200}
                height={60}
                className="h-12 w-auto mx-auto"
              />
            </div>

            <p className="text-gray-700 text-lg mb-8">
              At TopOneHire, our mission is to make jobs more accessible and easier to find in the United States.
              We strive to provide a platform that connects employers, job seekers, and recruiters with each other,
              allowing them to quickly and easily identify job opportunities across the country.
            </p>
            <p className="text-gray-700 text-lg mb-8">
              Our goal is to create a comprehensive resource for jobs, making it easy for people of all backgrounds
              and skill sets to find the jobs they are looking for. We understand that having access to jobs can help
              build strong communities, so we are committed to empowering individuals with access to jobs that meet
              their individual needs and interests.
            </p>
            <p className="text-gray-700 text-lg mb-8">
              With our comprehensive database of jobs from every region of the United States, we hope to provide an
              efficient way for everyone to find jobs that match their skills and interests. We believe jobs should
              be accessible to everyone, and our mission is to make that a reality.
            </p>
          </div>

          {/* What We Offer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* For Job Seekers */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Job Seekers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Access to thousands of job opportunities across various industries
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Easy-to-use resume builder and profile management tools
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Personalized job recommendations based on your skills and preferences
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Direct communication with potential employers
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Career resources and guidance to help you succeed
                </li>
              </ul>
            </div>

            {/* For Employers */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">For Employers</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Access to a diverse pool of qualified candidates
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Advanced filtering and search capabilities
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Streamlined recruitment process with applicant tracking
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Flexible posting options and subscription plans
                </li>
                <li className="flex items-start">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Dedicated support and account management services
                </li>
              </ul>
            </div>
          </div>

          {/* Our Values */}
          <div className="bg-yellow-50 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">People-First</h3>
                <p className="text-gray-600 text-sm">We prioritize the needs and success of both job seekers and employers in everything we do.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Quality & Excellence</h3>
                <p className="text-gray-600 text-sm">We maintain the highest standards in our platform and services to ensure exceptional outcomes.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Innovation</h3>
                <p className="text-gray-600 text-sm">We continuously evolve our platform with cutting-edge technology and creative solutions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
