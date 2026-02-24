'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';

interface WorkExperienceEntry {
    position: string;
    company: string;
    from: string;
    to: string;
    current: boolean;
    description: string;
}

interface EducationEntry {
    degree: string;
    university: string;
    from: string;
    to: string;
    current: boolean;
    description: string;
}

export default function AddResumePage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [saving, setSaving] = useState(false);
    const [jobSeekers, setJobSeekers] = useState<any[]>([]);
    const [jobTypes, setJobTypes] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [form, setForm] = useState({
        jobSeekerId: '',
        desiredJobTitle: '',
        phone: '',
        location: '',
        jobType: '',
        categories: '',
        personalSummary: '',
        resumeFileUrl: '',
        letEmployersFind: true,
        status: 'Active',
    });

    const [workExperiences, setWorkExperiences] = useState<WorkExperienceEntry[]>([
        { position: '', company: '', from: '', to: '', current: false, description: '' }
    ]);

    const [educations, setEducations] = useState<EducationEntry[]>([
        { degree: '', university: '', from: '', to: '', current: false, description: '' }
    ]);

    useEffect(() => {
        const auth = localStorage.getItem('adminAuth');
        if (!auth) router.push('/admin/login');
        else {
            setIsAuthenticated(true);
            fetchDropdownData();
        }
    }, [router]);

    const fetchDropdownData = async () => {
        try {
            const [jsRes, jtRes, catRes] = await Promise.all([
                fetch('/api/admin/job-seeker-profiles'),
                fetch('/api/admin/job-types'),
                fetch('/api/admin/categories'),
            ]);
            const [jsData, jtData, catData] = await Promise.all([jsRes.json(), jtRes.json(), catRes.json()]);
            if (jsData.jobSeekers) setJobSeekers(jsData.jobSeekers);
            if (jtData.jobTypes) setJobTypes(jtData.jobTypes);
            if (catData.categories) setCategories(catData.categories);
        } catch (e) {
            console.error('Error fetching dropdown data:', e);
        }
    };

    const addWorkExperience = () => {
        setWorkExperiences(prev => [...prev, { position: '', company: '', from: '', to: '', current: false, description: '' }]);
    };

    const removeWorkExperience = (index: number) => {
        setWorkExperiences(prev => prev.filter((_, i) => i !== index));
    };

    const updateWorkExperience = (index: number, field: keyof WorkExperienceEntry, value: any) => {
        setWorkExperiences(prev => prev.map((w, i) => i === index ? { ...w, [field]: value } : w));
    };

    const addEducation = () => {
        setEducations(prev => [...prev, { degree: '', university: '', from: '', to: '', current: false, description: '' }]);
    };

    const removeEducation = (index: number) => {
        setEducations(prev => prev.filter((_, i) => i !== index));
    };

    const updateEducation = (index: number, field: keyof EducationEntry, value: any) => {
        setEducations(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.jobSeekerId) { alert('Please select a Job Seeker'); return; }
        if (!form.desiredJobTitle) { alert('Job Title is required'); return; }

        setSaving(true);
        try {
            const payload = {
                ...form,
                workExperience: JSON.stringify(workExperiences),
                education: JSON.stringify(educations),
            };

            const res = await fetch('/api/admin/resumes/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                router.push('/admin/job-board/resumes');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create resume');
            }
        } catch (e) {
            alert('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (!isAuthenticated) return null;

    const inputClass = "w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm bg-white";
    const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 text-right pr-4";
    const YEARS = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

    return (
        <AdminLayout>
            <div className="p-6">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                    <Link href="/admin/job-board/resumes" className="hover:text-gray-800 transition-colors">Resumes</Link>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-800 font-medium">Add New Resume</span>
                </nav>

                <h1 className="text-2xl font-bold text-gray-900 mb-8">Add New Resume</h1>

                <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">

                    {/* Main Info Card */}
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8 space-y-5">

                        {/* Job Seeker */}
                        <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                            <label className={labelClass}>Job Seeker <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                placeholder="Search job seeker by email"
                                list="jobSeekerList"
                                onChange={e => {
                                    const found = jobSeekers.find(js => js.email === e.target.value);
                                    if (found) setForm(prev => ({ ...prev, jobSeekerId: found.id }));
                                    else setForm(prev => ({ ...prev, jobSeekerId: '' }));
                                }}
                                className={inputClass}
                            />
                            <datalist id="jobSeekerList">
                                {jobSeekers.map(js => (
                                    <option key={js.id} value={js.email}>{js.firstName} {js.lastName} — {js.email}</option>
                                ))}
                            </datalist>
                        </div>

                        {/* Product (placeholder) */}
                        <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                            <label className={labelClass}>Product</label>
                            <select className={inputClass}>
                                <option>No product</option>
                            </select>
                        </div>

                        {/* Featured */}
                        <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                            <label className={labelClass}>Featured</label>
                            <input type="checkbox" className="w-4 h-4 accent-indigo-600" />
                        </div>

                        {/* Desired Job Title */}
                        <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                            <label className={labelClass}>Desired Job Title <span className="text-red-500">*</span></label>
                            <input type="text" value={form.desiredJobTitle} onChange={e => setForm({ ...form, desiredJobTitle: e.target.value })}
                                placeholder="Desired job title" className={inputClass} required />
                        </div>

                        {/* Job Type */}
                        <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                            <label className={labelClass}>Job type</label>
                            <select value={form.jobType} onChange={e => setForm({ ...form, jobType: e.target.value })} className={inputClass}>
                                <option value="">Select job type</option>
                                {jobTypes.map(jt => <option key={jt.id} value={jt.name}>{jt.name}</option>)}
                            </select>
                        </div>

                        {/* Categories */}
                        <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                            <label className={labelClass}>Categories <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                list="categoriesList"
                                value={form.categories}
                                onChange={e => setForm({ ...form, categories: e.target.value })}
                                placeholder="Click to select"
                                className={inputClass}
                            />
                            <datalist id="categoriesList">
                                {categories.map(cat => <option key={cat.id} value={cat.name} />)}
                            </datalist>
                        </div>

                        {/* Personal Summary */}
                        <div className="grid grid-cols-[200px_1fr] items-start gap-4">
                            <label className={`${labelClass} mt-2`}>Personal Summary</label>
                            <textarea
                                value={form.personalSummary}
                                onChange={e => setForm({ ...form, personalSummary: e.target.value })}
                                rows={6}
                                placeholder="Write personal summary..."
                                className={`${inputClass} resize-y`}
                            />
                        </div>

                        {/* Resume File URL */}
                        <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                            <label className={labelClass}>Upload Resume</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={form.resumeFileUrl}
                                    onChange={e => setForm({ ...form, resumeFileUrl: e.target.value })}
                                    placeholder="Resume file URL"
                                    className={`${inputClass} flex-1`}
                                />
                                <button type="button" className="px-4 py-2 border border-gray-200 text-sm text-gray-600 rounded-md hover:bg-gray-50 whitespace-nowrap">
                                    Upload
                                </button>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                            <label className={labelClass}>Location <span className="text-red-500">*</span></label>
                            <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                                placeholder="City, State" className={inputClass} required />
                        </div>

                        {/* Phone */}
                        <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                            <label className={labelClass}>Phone</label>
                            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                                placeholder="+1 (000) 000-0000" className={inputClass} />
                        </div>

                        {/* Let Employers Find */}
                        <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                            <label className={labelClass}>Let Employers Find My Resume</label>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={form.letEmployersFind}
                                    onChange={e => setForm({ ...form, letEmployersFind: e.target.checked })}
                                    className="w-4 h-4 accent-indigo-600" />
                                <svg className="w-4 h-4 text-blue-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Work Experience */}
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Work Experience</h2>
                        <div className="space-y-6">
                            {workExperiences.map((exp, index) => (
                                <div key={index} className="border border-gray-100 rounded-lg p-5 space-y-4 bg-gray-50/50">
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <label className={labelClass}>Position</label>
                                        <input type="text" value={exp.position} onChange={e => updateWorkExperience(index, 'position', e.target.value)}
                                            placeholder="Job position" className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <label className={labelClass}>Company</label>
                                        <input type="text" value={exp.company} onChange={e => updateWorkExperience(index, 'company', e.target.value)}
                                            placeholder="Company name" className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <label className={labelClass}>From</label>
                                        <select value={exp.from} onChange={e => updateWorkExperience(index, 'from', e.target.value)} className={inputClass}>
                                            <option value="">Year</option>
                                            {YEARS.map(y => <option key={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <label className={labelClass}>To</label>
                                        <div className="flex items-center gap-3">
                                            <select value={exp.to} onChange={e => updateWorkExperience(index, 'to', e.target.value)}
                                                disabled={exp.current} className={`${inputClass} flex-1`}>
                                                <option value="">Year</option>
                                                {YEARS.map(y => <option key={y}>{y}</option>)}
                                            </select>
                                            <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                                                <input type="checkbox" checked={exp.current} onChange={e => updateWorkExperience(index, 'current', e.target.checked)}
                                                    className="w-4 h-4 accent-indigo-600" />
                                                <span>Current</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[160px_1fr] items-start gap-4">
                                        <label className={`${labelClass} mt-2`}>Description</label>
                                        <textarea value={exp.description} onChange={e => updateWorkExperience(index, 'description', e.target.value)}
                                            rows={4} placeholder="Describe your role..." className={`${inputClass} resize-y`} />
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <button type="button" onClick={addWorkExperience}
                                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                                            Add Work Experience
                                        </button>
                                        {workExperiences.length > 1 && (
                                            <button type="button" onClick={() => removeWorkExperience(index)}
                                                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors">
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Education */}
                    <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-6">Education</h2>
                        <div className="space-y-6">
                            {educations.map((edu, index) => (
                                <div key={index} className="border border-gray-100 rounded-lg p-5 space-y-4 bg-gray-50/50">
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <label className={labelClass}>Degree / Specialty</label>
                                        <input type="text" value={edu.degree} onChange={e => updateEducation(index, 'degree', e.target.value)}
                                            placeholder="e.g. Bachelor of Science" className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <label className={labelClass}>University / Institution</label>
                                        <input type="text" value={edu.university} onChange={e => updateEducation(index, 'university', e.target.value)}
                                            placeholder="University name" className={inputClass} />
                                    </div>
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <label className={labelClass}>From</label>
                                        <select value={edu.from} onChange={e => updateEducation(index, 'from', e.target.value)} className={inputClass}>
                                            <option value="">Year</option>
                                            {YEARS.map(y => <option key={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                                        <label className={labelClass}>To</label>
                                        <div className="flex items-center gap-3">
                                            <select value={edu.to} onChange={e => updateEducation(index, 'to', e.target.value)}
                                                disabled={edu.current} className={`${inputClass} flex-1`}>
                                                <option value="">Year</option>
                                                {YEARS.map(y => <option key={y}>{y}</option>)}
                                            </select>
                                            <label className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                                                <input type="checkbox" checked={edu.current} onChange={e => updateEducation(index, 'current', e.target.checked)}
                                                    className="w-4 h-4 accent-indigo-600" />
                                                <span>Current</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-[160px_1fr] items-start gap-4">
                                        <label className={`${labelClass} mt-2`}>Description</label>
                                        <textarea value={edu.description} onChange={e => updateEducation(index, 'description', e.target.value)}
                                            rows={3} placeholder="Additional details..." className={`${inputClass} resize-y`} />
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <button type="button" onClick={addEducation}
                                            className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                                            Add Education
                                        </button>
                                        {educations.length > 1 && (
                                            <button type="button" onClick={() => removeEducation(index)}
                                                className="px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition-colors">
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex items-center gap-4 pb-8">
                        <button type="submit" disabled={saving}
                            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md disabled:opacity-50">
                            {saving ? 'Saving...' : 'Save'}
                        </button>
                        <Link href="/admin/job-board/resumes"
                            className="px-8 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
