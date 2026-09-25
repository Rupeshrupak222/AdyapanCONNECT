'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, X, MessageSquare, Copy, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Logo } from '@/components/brand/logo';

const trustedBy = ['Adani', 'TATA', 'Godrej', 'CEAT', 'SOBHA', 'vivo'];

function OtpInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const handle = (i: number, v: string) => {
    const digit = v.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          value={value[i] ?? ''}
          onChange={e => handle(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          inputMode="numeric"
          maxLength={1}
          className="h-12 w-11 rounded-lg border border-gray-300 text-center text-lg font-semibold text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
        />
      ))}
    </div>
  );
}

function TwoFactorContent() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [qrSeconds, setQrSeconds] = useState(280); // 4:40
  const [resendSeconds, setResendSeconds] = useState(40); // 0:40

  const router = useRouter();
  const searchParams = useSearchParams();
  const tempToken = searchParams.get('token') ?? '';
  const setAuth = useAuthStore(s => s.setAuth);
  const { toast } = useToast();

  useEffect(() => {
    const t = setInterval(() => {
      setQrSeconds(s => (s > 0 ? s - 1 : 0));
      setResendSeconds(s => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const otpComplete = otp.every(d => d !== '');

  const handleVerify = async () => {
    if (!otpComplete || loading) return;
    if (!tempToken) {
      toast({ title: 'Session expired', description: 'Please log in again.', variant: 'destructive' });
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login/2fa', { code: otp.join(''), tempToken });
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken, user.tenantSlug);
      router.push('/dashboard');
    } catch (err: any) {
      toast({
        title: 'Verification failed',
        description: err.response?.data?.error?.message || 'Invalid or expired code',
        variant: 'destructive',
      });
      setOtp(Array(6).fill(''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top banner */}
      {showBanner && (
        <div className="flex items-center justify-center bg-green-50 px-4 py-2.5 text-sm text-green-700">
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Please send the message on WhatsApp to verify.
          <button onClick={() => setShowBanner(false)} className="ml-3 text-green-600 hover:text-green-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex min-h-[calc(100vh-44px)]">
        {/* Left — brand panel */}
        <div className="hidden lg:flex lg:w-[42%] flex-col bg-[#eef5f0] px-12 py-10">
          <Logo size={36} textClassName="text-xl text-gray-900" />

          <h2 className="mt-10 text-3xl font-bold leading-snug text-[#0b3d2e]">
            Send personalized campaigns on WhatsApp
          </h2>

          <div className="relative mx-auto mt-8 flex-1">
            <div className="relative mx-auto h-72 w-72 rounded-full bg-white/60">
              <div className="absolute left-0 top-6 w-36 rounded-xl bg-white p-2 shadow-lg">
                <div className="h-16 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600" />
                <p className="mt-1.5 text-[11px] font-semibold text-gray-800">Special 20% off</p>
              </div>
              <div className="absolute right-2 top-16 w-40 rounded-2xl rounded-tr-sm bg-green-100 px-3 py-2 shadow-sm">
                <p className="text-[11px] text-gray-700">I want to buy this</p>
              </div>
              <div className="absolute left-6 bottom-16 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-md">
                <span className="text-sm font-bold text-green-600">3.2x</span>
                <span className="text-[10px] text-gray-500">more reach</span>
              </div>
              <div className="absolute bottom-6 right-4 flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 shadow-lg">
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                <span className="text-[11px] font-medium text-white">Order Placed</span>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-300" />
              <span className="text-xs text-gray-500">Trusted by 2,50,000+ businesses</span>
              <div className="h-px flex-1 bg-gray-300" />
            </div>
            <div className="grid grid-cols-6 items-center gap-3 opacity-70">
              {trustedBy.map(n => <span key={n} className="text-center text-xs font-bold text-gray-500">{n}</span>)}
            </div>
          </div>
        </div>

        {/* Right — verification */}
        <div className="relative flex-1 px-6 py-10 lg:px-14">
          <div className="absolute right-6 top-4 text-sm text-gray-500 lg:right-10">
            Not a member yet? <Link href="/signup" className="font-semibold text-green-600 hover:text-green-700">Sign up</Link>
          </div>

          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Welcome back</p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">Log in to Adyapan Connect</h1>
            <p className="mt-3 text-sm font-medium text-gray-700">Choose a method to complete two-step verification.</p>

            <div className="mt-6 rounded-2xl border border-gray-200 p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Two-Step Verification</h2>
                <Link href="/login" className="text-sm font-medium text-green-600 hover:text-green-700">Use a different account</Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Method 1 — Scan & Send */}
                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Method 1: Scan &amp; Send</p>
                  <p className="mt-1 text-xs text-gray-500">Scan this QR code with your phone camera, then tap Send in WhatsApp.</p>

                  <div className="mt-4 flex justify-center">
                    <div className="relative rounded-xl border border-gray-200 p-3">
                      {/* Decorative QR grid */}
                      <div className="grid h-40 w-40 grid-cols-12 grid-rows-12 gap-[2px]">
                        {Array.from({ length: 144 }).map((_, i) => {
                          const on = (i * 7 + (i % 5) * 3 + Math.floor(i / 12)) % 3 === 0;
                          const corner =
                            (i % 12 < 3 && i < 36) || (i % 12 > 8 && i < 36) || (i % 12 < 3 && i >= 108);
                          return <div key={i} className={(on || corner) ? 'bg-gray-900' : 'bg-transparent'} />;
                        })}
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500 ring-4 ring-white">
                          <MessageSquare className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-center text-xs text-gray-400">Expires in {fmt(qrSeconds)}</p>

                  <p className="mt-4 text-center text-xs text-gray-500">Can&apos;t scan the QR code? Use one of these options:</p>
                  <button className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b3d2e] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f4d3a]">
                    <MessageSquare className="h-4 w-4" /> Open WhatsApp &amp; Verify
                  </button>
                  <button className="mt-2 flex w-full items-center justify-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700">
                    <Copy className="h-3.5 w-3.5" /> Copy verification link instead
                  </button>

                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                    <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                    <p className="text-[11px] leading-relaxed text-amber-700">
                      Note: Do not edit the pre-filled text. Any changes will cause verification to fail.
                    </p>
                  </div>
                </div>

                {/* OR divider */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-xs font-semibold text-white">OR</span>
                </div>

                {/* Method 2 — OTP */}
                <div className="md:border-l md:border-gray-200 md:pl-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Method 2: OTP Code</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Enter the 6-digit code we sent to your email ra***@adyapan.com and phone 91*****99.
                  </p>

                  <div className="mt-6">
                    <OtpInput value={otp} onChange={setOtp} />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <button
                      disabled={resendSeconds > 0}
                      onClick={() => setResendSeconds(40)}
                      className="font-medium text-green-600 hover:text-green-700 disabled:text-gray-400"
                    >
                      Resend OTP
                    </button>
                    <span className="text-gray-400">{fmt(resendSeconds)}</span>
                  </div>

                  <button
                    onClick={handleVerify}
                    disabled={!otpComplete || loading}
                    className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 bg-green-500 text-white hover:bg-green-600"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Verify
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TwoFactorPage() {
  return (
    <Suspense fallback={null}>
      <TwoFactorContent />
    </Suspense>
  );
}
