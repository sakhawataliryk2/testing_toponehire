'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employer, setEmployer] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);

  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState<any>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('employerAuth');
    const employerData = localStorage.getItem('employerUser');

    if (!auth || !employerData) {
      router.push(`/login?redirect=/my-account/checkout?product=${productId}`);
      return;
    }

    setEmployer(JSON.parse(employerData));

    if (productId) {
      fetchProduct();
    }
  }, [router, productId]);

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (data.product) {
        setProduct(data.product);
      } else {
        setError('Product not found');
      }
    } catch (e) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    setValidatingCode(true);
    setDiscountError(null);
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, productId, userId: employer.id })
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discount);
        setDiscountError(null);
      } else {
        setDiscountError(data.error || 'Invalid code');
        setDiscount(null);
      }
    } catch (e) {
      setDiscountError('Error validating code');
    } finally {
      setValidatingCode(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setProcessing(true);
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          employerId: employer.id,
          discountCode: discount ? discount.code : null,
        }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to create checkout session');
        setProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fb]">
        <Header activePage="my-account" />
        <div className="container mx-auto px-4 py-24 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header activePage="my-account" />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-900 mb-2">Checkout Error</h2>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => router.push('/employer-products')}
                className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-medium rounded-lg"
              >
                Back to Products
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const originalPrice = Number(product.price);
  let finalPrice = originalPrice;
  let discountAmount = 0;

  if (discount) {
    if (discount.type === 'PERCENT') {
      discountAmount = (originalPrice * discount.value) / 100;
    } else {
      discountAmount = discount.value;
    }
    finalPrice = Math.max(0, originalPrice - discountAmount);
  }

  return (
    <div className="min-h-screen bg-[#f8f9fb]">
      <Header activePage="my-account" />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8" style={{ fontFamily: 'serif' }}>Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Order Summary</h2>
                <div className="flex justify-between py-4 border-b border-gray-100">
                  <div>
                    <p className="font-bold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.billingInterval === 'MONTHLY' ? 'Monthly Subscription' : 'Yearly Subscription'}</p>
                  </div>
                  <p className="font-bold text-gray-900">${originalPrice.toFixed(2)}</p>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">${originalPrice.toFixed(2)}</span>
                  </div>
                  {discount && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                      <span>Discount ({discount.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-4 mt-4">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">${finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase text-sm tracking-wider">Payment Method</h2>
                <div className="flex items-center gap-3 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div className="w-10 h-10 bg-white rounded flex items-center justify-center border border-gray-200">
                    <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V12h16v6zm0-10H4V6h16v2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Stripe Checkout</p>
                    <p className="text-xs text-gray-500">Secure payment via credit card</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Discount Code</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:border-yellow-500 focus:outline-none"
                    disabled={!!discount}
                  />
                  {discount ? (
                    <button
                      onClick={() => { setDiscount(null); setDiscountCode(''); }}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded text-xs font-bold"
                    >
                      CLEAR
                    </button>
                  ) : (
                    <button
                      onClick={applyDiscount}
                      disabled={validatingCode || !discountCode}
                      className="px-3 py-2 bg-gray-900 text-white rounded text-xs font-bold disabled:opacity-50"
                    >
                      {validatingCode ? '...' : 'APPLY'}
                    </button>
                  )}
                </div>
                {discountError && <p className="text-xs text-red-600 mt-2 font-medium">{discountError}</p>}
                {discount && <p className="text-xs text-green-600 mt-2 font-medium">Code "{discount.code}" applied!</p>}
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold uppercase rounded shadow-sm transition-all disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Complete Payment'}
                </button>
                <p className="text-[11px] text-gray-500 text-center mt-4 leading-relaxed">
                  By completing this purchase, you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <Header activePage="my-account" />
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-4">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
              </div>
              <p className="text-gray-600">Redirecting to secure checkout...</p>
            </div>
          </div>
          <Footer />
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
