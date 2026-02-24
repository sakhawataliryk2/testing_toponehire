'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '../../components/AdminLayout';

interface Discount {
  id: string;
  code: string;
  type: string;
  value: number;
  maxUses: number;
  usedCount: number;
  startDate: string;
  expiryDate: string | null;
  status: string;
}

export default function DiscountsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);

  const fetchDiscounts = async () => {
    try {
      const res = await fetch('/api/admin/discounts');
      const data = await res.json();
      if (data.discounts) setDiscounts(data.discounts);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/system-settings');
      const data = await res.json();
      if (data.settings && data.settings.enableDiscountCodes !== undefined) {
        setEnabled(data.settings.enableDiscountCodes === 'true');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleEnabled = async (val: boolean) => {
    setEnabled(val);
    try {
      await fetch('/api/admin/system-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: { enableDiscountCodes: String(val) } }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth');
    if (!auth) {
      router.push('/admin/login');
    } else {
      setIsAuthenticated(true);
      fetchDiscounts();
      fetchSettings();
    }
  }, [router]);

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete discount code "${code}"?`)) return;
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchDiscounts();
      else alert('Failed to delete');
    } catch (e) {
      alert('Error deleting');
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const statusColor = (s: string) => {
    if (s === 'ACTIVE') return 'bg-[#00c292] text-white';
    if (s === 'EXPIRED') return 'bg-gray-400 text-white';
    if (s === 'PENDING_USED') return 'bg-orange-400 text-white';
    return 'bg-gray-200 text-[#666]';
  };

  if (!isAuthenticated) return null;

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#f8f9fc] p-8 font-sans">
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-[#4a4a4a] mb-2">Discounts</h1>
          <p className="text-[#666] text-[13px]">Discounts allow you to offer discounts to users for certain products and services</p>
        </div>

        <div className="bg-white rounded border border-[#edeff2] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#edeff2]">
            <div className="flex items-center gap-2">
              <label htmlFor="enable_discounts" className="text-[13px] font-medium text-[#333] cursor-pointer">Enable Discount Codes</label>
              <input
                id="enable_discounts"
                type="checkbox"
                checked={enabled}
                onChange={(e) => toggleEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-[#d1d3e2] text-purple-600 focus:ring-purple-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f8f9fc] border-b border-[#edeff2]">
                  <th className="px-6 py-4 w-10">
                    <input type="checkbox" className="w-4 h-4 rounded border-[#d1d3e2]" />
                  </th>
                  <th className="px-6 py-4 text-[13px] font-bold text-[#333]">Discount Code</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-[#333]">Discount</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-[#333]">Uses</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-[#333]">Start Date</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-[#333]">Expiry Date</th>
                  <th className="px-6 py-4 text-[13px] font-bold text-[#333]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edeff2]">
                {loading ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-[#999] text-[13px]">Loading discounts...</td></tr>
                ) : discounts.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-[#999] text-[13px]">No discounts found.</td></tr>
                ) : (
                  discounts.map((d) => (
                    <tr key={d.id} className="hover:bg-[#fbfcfe] transition-colors group">
                      <td className="px-6 py-4">
                        <input type="checkbox" className="w-4 h-4 rounded border-[#d1d3e2]" />
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/ecommerce/discounts/${d.id}`}
                          className="text-[13px] text-[#6c72e2] font-medium hover:underline"
                        >
                          {d.code}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#4a4a4a]">
                        {d.type === 'PERCENT' ? `${d.value}%` : `$${Number(d.value).toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#4a4a4a]">
                        {d.usedCount} / {d.maxUses}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#4a4a4a]">
                        {formatDate(d.startDate)}
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#4a4a4a]">
                        {d.expiryDate ? formatDate(d.expiryDate) : ''}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusColor(d.status)}`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-[#f8f9fc] border-t border-[#edeff2] flex justify-end">
            <Link
              href="/admin/ecommerce/discounts/new"
              className="px-6 py-2 bg-[#6c6fe2] text-white text-[13px] font-bold rounded shadow-sm hover:brightness-105 transition-all"
            >
              Add Discount Code
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
