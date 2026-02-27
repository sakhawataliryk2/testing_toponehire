'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ApplicationModalProps {
    job: any;
    user: any;
    onClose: () => void;
}

export default function ApplicationModal({ job, user, onClose }: ApplicationModalProps) {
    const [step, setStep] = useState(1);
    const [resumes, setResumes] = useState<any[]>([]);
    const [loadingResumes, setLoadingResumes] = useState(false);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [coverLetter, setCoverLetter] = useState('');
    const [customFields, setCustomFields] = useState<any[]>([]);
    const [formValues, setFormValues] = useState<Record<string, any>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // URL to create a new resume and come back to this job (with modal auto-open)
    const createResumeUrl = `/add-listing?listing_type_id=Resume&returnTo=${encodeURIComponent(`/jobs/${job.id}?openModal=1`)}`;


    // Fetch resumes
    useEffect(() => {
        const fetchResumes = async () => {
            setLoadingResumes(true);
            try {
                const res = await fetch(`/api/resumes?jobSeekerId=${user.id}`);
                const data = await res.json();
                if (data.resumes) {
                    setResumes(data.resumes);
                    if (data.resumes.length > 0) {
                        setSelectedResumeId(data.resumes[0].id);
                    }
                }
            } catch (e) {
                console.error('Error fetching resumes:', e);
            } finally {
                setLoadingResumes(false);
            }
        };
        if (user?.id) fetchResumes();
    }, [user.id]);

    // Fetch custom application fields
    useEffect(() => {
        const fetchCustomFields = async () => {
            try {
                const res = await fetch('/api/admin/custom-fields?context=APPLICATION');
                const data = await res.json();
                if (data.fields) {
                    setCustomFields(data.fields);
                }
            } catch (e) {
                console.error('Error fetching custom fields:', e);
            }
        };
        fetchCustomFields();
    }, []);

    const handleInputChange = (fieldId: string, value: any) => {
        setFormValues(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const selectedResume = resumes.find(r => r.id === selectedResumeId);

            const response = await fetch('/api/admin/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobId: job.id,
                    jobTitle: job.title,
                    companyName: job.employer,
                    applicantName: `${user.firstName} ${user.lastName}`,
                    applicantEmail: user.email,
                    applicantPhone: user.phone || '',
                    resumeId: selectedResumeId,
                    resumeTitle: selectedResume?.desiredJobTitle || 'My Resume',
                    coverLetter,
                    customFields: formValues,
                }),
            });

            if (response.ok) {
                alert('Application submitted successfully!');
                onClose();
            } else {
                const err = await response.json();
                alert(err.error || 'Failed to submit application');
            }
        } catch (e) {
            console.error('Submission error:', e);
            alert('An error occurred during submission.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const nextStep = () => {
        if (step === 3) {
            const missingRequired = customFields.find(f => f.required && !formValues[f.id]);
            if (missingRequired) {
                alert(`Please fill in the required field: ${missingRequired.caption}`);
                return;
            }
        }
        setStep(prev => prev + 1);
    };
    const prevStep = () => setStep(prev => prev - 1);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Apply for {job.title}</h2>
                        <p className="text-sm text-gray-500">{job.employer}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Steps Progress */}
                <div className="px-8 py-4 bg-white">
                    <div className="flex items-center justify-between">
                        {[1, 2, 3, 4].map((s) => (
                            <div key={s} className="flex flex-col items-center flex-1 relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${step >= s ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-400'
                                    }`}>
                                    {s}
                                </div>
                                <span className={`text-[10px] mt-1 font-semibold uppercase tracking-wider ${step >= s ? 'text-yellow-600' : 'text-gray-400'
                                    }`}>
                                    {s === 1 ? 'Resume' : s === 2 ? 'Cover Letter' : s === 3 ? 'Details' : 'Review'}
                                </span>
                                {s < 4 && (
                                    <div className={`absolute left-1/2 top-4 w-full h-1 -z-0 transition-colors ${step > s ? 'bg-yellow-500' : 'bg-gray-100'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-bold text-gray-900">Select your resume</h3>
                            {loadingResumes ? (
                                <div className="py-12 text-center text-gray-500 italic">Finding your resumes...</div>
                            ) : resumes.length > 0 ? (
                                <div className="space-y-3">
                                    {resumes.map(r => (
                                        <div key={r.id} className="flex items-center gap-2">
                                            <label
                                                className={`flex-1 flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${selectedResumeId === r.id ? 'border-yellow-500 bg-yellow-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-white'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="resume"
                                                    className="w-5 h-5 accent-yellow-500"
                                                    checked={selectedResumeId === r.id}
                                                    onChange={() => setSelectedResumeId(r.id)}
                                                />
                                                <div className="ml-4">
                                                    <div className="font-bold text-gray-900">{r.desiredJobTitle}</div>
                                                    <div className="text-xs text-gray-500">Last updated: {new Date(r.updatedAt).toLocaleDateString()}</div>
                                                </div>
                                            </label>
                                            <Link
                                                href={`/resume/${r.id}`}
                                                target="_blank"
                                                className="p-3 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all"
                                                title="View Resume"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </Link>
                                        </div>
                                    ))}
                                    <div className="pt-4">
                                        <p className="text-sm text-gray-500 mb-2">Want to use a different one?</p>
                                        <Link
                                            href={createResumeUrl}
                                            target="_blank"
                                            className="inline-flex items-center text-yellow-600 font-bold hover:underline"
                                        >
                                            + Create New Resume
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 px-6 border-2 border-dashed border-gray-200 rounded-3xl bg-gray-50">
                                    <p className="text-gray-600 mb-6">You haven't created any resumes yet.</p>
                                    <Link
                                        href={createResumeUrl}
                                        target="_blank"
                                        className="inline-block px-8 py-3 bg-yellow-500 text-white font-bold rounded-xl shadow-lg hover:bg-yellow-600 transition-all"
                                    >
                                        Create a Resume
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-bold text-gray-900">Cover Letter</h3>
                            <p className="text-sm text-gray-500">Introduce yourself and explain why you're a great fit for this role.</p>
                            <textarea
                                value={coverLetter}
                                onChange={(e) => setCoverLetter(e.target.value)}
                                placeholder="Write your cover letter here..."
                                className="w-full h-64 p-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-yellow-400 font-sans resize-none"
                            />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-bold text-gray-900">Application Details</h3>
                            {customFields.length > 0 ? (
                                <div className="space-y-5">
                                    {customFields.map(field => (
                                        <div key={field.id}>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                                {field.caption}{field.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {field.type === 'TEXT_AREA' ? (
                                                <textarea
                                                    required={field.required}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    value={formValues[field.id] || ''}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                                                    rows={3}
                                                />
                                            ) : field.type === 'DROPDOWN' ? (
                                                <select
                                                    required={field.required}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    value={formValues[field.id] || ''}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                                                >
                                                    <option value="">Select option</option>
                                                    {field.options?.split('\n').map((opt: string) => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type === 'NUMBER' ? 'number' : field.type === 'DATE' ? 'date' : 'text'}
                                                    required={field.required}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                    value={formValues[field.id] || ''}
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 outline-none"
                                                />
                                            )}
                                            {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-gray-500 italic">No additional specialized fields required.</div>
                            )}
                        </div>
                    )}

                    {step === 4 && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <h3 className="text-lg font-bold text-gray-900">Review your application</h3>

                            <div className="space-y-6 bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Resume</h4>
                                    <p className="font-bold text-gray-900">{resumes.find(r => r.id === selectedResumeId)?.desiredJobTitle || 'Selected Resume'}</p>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Cover Letter</h4>
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap italic">
                                        {coverLetter ? `"${coverLetter.slice(0, 150)}${coverLetter.length > 150 ? '...' : ''}"` : 'No cover letter provided.'}
                                    </p>
                                </div>

                                {customFields.filter(f => formValues[f.id]).length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Additional Info</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {customFields.map(f => formValues[f.id] && (
                                                <div key={f.id} className="flex justify-between items-center text-sm border-b border-gray-200 pb-2 last:border-0">
                                                    <span className="text-gray-500">{f.caption}:</span>
                                                    <span className="font-bold text-gray-900">{formValues[f.id]}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-xs text-blue-600">
                                    By submitting, your contact details and resume will be shared with the employer. Make sure everything is correct.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-between gap-3">
                    <button
                        onClick={step === 1 ? onClose : prevStep}
                        className="px-6 py-3 text-gray-600 font-bold hover:text-gray-900 transition-colors"
                    >
                        {step === 1 ? 'Cancel' : 'Back'}
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={nextStep}
                            disabled={step === 1 && !selectedResumeId}
                            className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-10 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
