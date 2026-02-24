'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../../../components/AdminLayout';

export default function NewDiscountPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    code: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED',
    value: '0.00',
    appliesTo: 'All',
    maxUses: '',
    maxUsesPerUser: '1',
    startDate: '',
    expiryDate: '',
    isActive: false,
  });

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error('Error fetching products:', e);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code.trim(),
          type: form.type,
          value: parseFloat(form.value) || 0,
          maxUses: parseInt(form.maxUses, 10) || 0,
          maxUsesPerUser: parseInt(form.maxUsesPerUser, 10) || 1,
          appliesTo: form.appliesTo,
          startDate: form.startDate ? new Date(form.startDate).toISOString() : new Date().toISOString(),
          expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
          status: form.isActive ? 'ACTIVE' : 'NOT_ACTIVE',
        }),
      });
      if (res.ok) router.push('/admin/ecommerce/discounts');
      else alert((await res.json()).error || 'Failed to create');
    } catch (e) {
      alert('Error');
    } finally {
      setSaving(false);
    }
  };

  const HelpIcon = ({ text }: { text: string }) => (
    <div className="group relative flex items-center">
      <svg className="w-5 h-5 text-sky-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-[10px] rounded shadow-lg z-50 text-center leading-tight">
        {text}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f8f9fc] p-8 font-sans">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-[11px] text-[#666] mb-4">
            <Link href="/admin/ecommerce/discounts" className="hover:text-purple-600">Discounts</Link>
            <span>/</span>
            <span className="bg-[#f0f1f3] px-2 py-0.5 rounded text-[#333]">Add a New Discount Code</span>
          </div>
          <h1 className="text-2xl font-medium text-[#4a4a4a]">Add a New Discount Code</h1>
        </div>

        <div className="bg-white rounded border border-[#edeff2] shadow-sm p-10 max-w-5xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-8 items-center text-right">
              <label className="w-1/4 text-[13px] font-bold text-[#333]">Discount Code <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none focus:border-purple-400"
              />
            </div>

            <div className="flex gap-8 items-center text-right">
              <label className="w-1/4 text-[13px] font-bold text-[#333]">Discount <span className="text-red-500">*</span></label>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  required
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none focus:border-purple-400"
                />
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                  className="w-32 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_15px_center] bg-no-repeat"
                >
                  <option value="PERCENT">%</option>
                  <option value="FIXED">$</option>
                </select>
              </div>
            </div>

            <div className="flex gap-8 items-center text-right text-right">
              <label className="w-1/4 text-[13px] font-bold text-[#333]">Applies to</label>
              <select
                value={form.appliesTo}
                onChange={(e) => setForm({ ...form, appliesTo: e.target.value })}
                className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[right_15px_center] bg-no-repeat"
              >
                <option value="All">Click to select</option>
                {products.map(p => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-8 items-center text-right">
              <label className="w-1/4 text-[13px] font-bold text-[#333]">Maximum Uses</label>
              <div className="flex-1 flex gap-3 items-center">
                <input
                  type="number"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none"
                />
                <HelpIcon text="Total number of times this code can be used across all users." />
              </div>
            </div>

            <div className="flex gap-8 items-center text-right">
              <label className="w-1/4 text-[13px] font-bold text-[#333]">Maximum Uses Per User</label>
              <div className="flex-1 flex gap-3 items-center">
                <input
                  type="number"
                  value={form.maxUsesPerUser}
                  onChange={(e) => setForm({ ...form, maxUsesPerUser: e.target.value })}
                  className="flex-1 px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none"
                />
                <HelpIcon text="How many times a single user can use this discount code." />
              </div>
            </div>

            <div className="flex gap-8 items-center text-right">
              <label className="w-1/4 text-[13px] font-bold text-[#333]">Start Date</label>
              <div className="flex-1 flex gap-3 items-center">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none appearance-none"
                  />
                </div>
                <HelpIcon text="The date from which this discount code becomes valid." />
              </div>
            </div>

            <div className="flex gap-8 items-center text-right">
              <label className="w-1/4 text-[13px] font-bold text-[#333]">End Date</label>
              <div className="flex-1 flex gap-3 items-center">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-4 py-2 border border-[#d1d3e2] rounded text-[13px] outline-none appearance-none"
                  />
                </div>
                <HelpIcon text="The date after which this discount code expires." />
              </div>
            </div>

            <div className="flex gap-8 items-center text-right">
              <label className="w-1/4 text-[13px] font-bold text-[#333]">Active</label>
              <div className="flex-1 flex items-center">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-[#d1d3e2] text-purple-600 shadow-sm"
                />
              </div>
            </div>

            <div className="mt-10 flex ml-[25%]">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-2.5 bg-[#6c6fe2] text-white text-[13px] font-bold rounded shadow-sm hover:brightness-105 transition-all"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
