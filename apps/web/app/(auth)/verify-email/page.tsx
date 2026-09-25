'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Logo } from '@/components/brand/logo';

function OtpBoxes({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const handle = (i: number, v: string) => {
    const d = v.replace(/\D/g, '').slice(-1);
    const next = [...value];
    next[i] = d;
    onChange(next);
    if (d && i < 5) refs.current[i + 1]?.focus();
  };
  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) refs.current[i - 1]?.focus();
  };
  return (
    <div className="flex justify-center gap-2">
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

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const email = searchParams.get('email') ?? '';
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(30);

  useEffect(() => {
    const t = setInterval(() => setResendSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const complete = otp.every(d => d !== '');

  const verify = async () => {
    if (!complete || loading) return;
    setLoading(true);
    try {
      await api.post('/auth/verify-email', { email, code: otp.join('') });
      toast({ title: 'Email verified', description: 'You can now log in.' });
      router.push('/login');
    } catch (err: any) {
      toast({ title: 'Verification failed', description: err.response?.data?.error?.message || 'Invalid or expired code', variant: 'destructive' });
      setOtp(Array(6).fill(''));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (resendSeconds > 0) return;
    try {
      await api.post('/auth/resend-verification', { email });
      toast({ title: 'Code sent', description: 'A new verification code has been sent.' });
      setResendSeconds(30);
    } catch {
      toast({ title: 'Could not resend', variant: 'destructive' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo size={36} textClassName="text-xl text-gray-900" />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <MailCheck className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="mt-4 text-center text-xl font-bold text-gray-900">Verify your email</h1>
          <p className="mt-1.5 text-center text-sm text-gray-600">
            We sent a 6-digit code to {email ? <span className="font-medium">{email}</span> : 'your email'}.
          </p>

          <div className="mt-6">
            <OtpBoxes value={otp} onChange={setOtp} />
          </div>

          <button
            onClick={verify}
            disabled={!complete || loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify Email
          </button>

          <div className="mt-4 text-center text-sm">
            <button onClick={resend} disabled={resendSeconds > 0} className="font-medium text-green-600 hover:text-green-700 disabled:text-gray-400">
              Resend code {resendSeconds > 0 ? `(${resendSeconds}s)` : ''}
            </button>
          </div>

          <Link href="/login" className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-600">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
