'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsConditionsPage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header activePage="terms" />

            <main className="flex-grow container mx-auto px-4 py-16 md:px-12 lg:px-24 xl:px-32">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-serif text-gray-900 mb-12 text-center">
                        Terms & Conditions
                    </h1>

                    <div className="space-y-10 text-gray-600 leading-relaxed">
                        {/* Introduction */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Introduction</h2>
                            <p>Please read these Terms & Conditions carefully before using TopOneHire.</p>
                            <p>TopOneHire reserves the right to modify these Terms & Conditions at any time.</p>
                        </section>

                        {/* Services Provided */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Services Provided</h2>
                            <p>TopOneHire provides a service to bring Job Seekers and Employers together. Job Seekers and Employers can register, create profiles/job posts and search for jobs and resumes.</p>
                        </section>

                        {/* Privacy Policy */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Privacy Policy</h2>
                            <p className="mb-4">Job Seeker personal data will be available to Employers visiting TopOneHire. Personal data includes a Name which is mandatory, an email Address which is mandatory and a Telephone Number which is optional.</p>
                            <p className="mb-4">Personal data provided by the user may be used by TopOneHire to notify the user of any news, and or promotional offers relating only to the TopOneHire website. The user can unsubscribe from these notifications at anytime.</p>
                            <p>TopOneHire will not disclose user personal data to any third party.</p>
                        </section>

                        {/* Website Use */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Website Use</h2>
                            <p className="mb-4">TopOneHire may not be used for any of the following purposes:</p>
                            <ul className="list-decimal list-inside ml-4 space-y-2 mb-4">
                                <li>To contact TopOneHire users regarding any issue apart from the purpose of recruitment.</li>
                                <li>To contact TopOneHire users to offer any services from a 3rd party company.</li>
                                <li>To post any illegal content.</li>
                            </ul>
                            <p className="mb-4">The user is required to provide truthful information in their profile or job post.</p>
                            <p>It is prohibited to use any text or images from TopOneHire for personal or commercial use.</p>
                        </section>

                        {/* User Information */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">User Information</h2>
                            <p className="mb-4">TopOneHire does not hold responsibility for any untruthful and/or inaccurate information included in job posts and profiles.</p>
                            <p>TopOneHire reserves the right to edit or delete any information submitted by the user to the website.</p>
                        </section>

                        {/* Liability */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Liability</h2>
                            <p>TopOneHire will not be responsible for any loss or damage the user may encounter from using the website.</p>
                        </section>

                        {/* Cookies Policy */}
                        <section>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Cookies Policy</h2>
                            <p className="mb-4">Our website uses cookies.</p>
                            <p className="mb-4">A cookie is a file containing an identifier (a string of letters and numbers) that is sent by a web server to a web browser and is stored by the browser. The identifier is then sent back to the server each time the browser requests a page from the server.</p>
                            <p className="mb-4">We use Google Analytics to analyse the use of our website.</p>
                            <p className="mb-4">Our analytics service provider generates statistical and other information about website use by means of cookies.</p>
                            <p>You can delete cookies already stored on your computer. Please visit the 'Help' option in your browser menu to learn how to do this. Deleting cookies will have a negative impact on the usability of this website.</p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
