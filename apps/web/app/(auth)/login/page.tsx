'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const trustedBy = ['Adani', 'TATA', 'Godrej', 'CEAT', 'SOBHA', 'vivo'];

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#FFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#FFF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FFF" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#FFF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      if (res.data.data.requiresTwoFactor) {
        router.push(`/login/2fa?token=${res.data.data.tempToken}`);
        return;
      }
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken, user.tenantSlug);
      router.push('/dashboard');
    } catch (err: any) {
      toast({ title: 'Login failed', description: err.response?.data?.error?.message || 'Invalid credentials', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API_URL}/api/v1/auth/google`;
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left — brand / marketing panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#eef5f0] flex-col px-14 py-10">
        <Logo size={36} textClassName="text-xl text-gray-900" />

        <div className="mt-12">
          <h2 className="text-3xl font-bold leading-snug text-[#0b3d2e]">
            Send personalized campaigns on<br />WhatsApp
          </h2>
        </div>

        {/* Hero illustration built from CSS chat bubbles */}
        <div className="relative mx-auto mt-8 flex-1 w-full max-w-md">
          <div className="relative mx-auto h-72 w-72 rounded-full bg-white/60">
            {/* campaign card */}
            <div className="absolute left-0 top-6 w-36 rounded-xl bg-white p-2 shadow-lg">
              <div className="h-16 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600" />
              <p className="mt-1.5 text-[11px] font-semibold text-gray-800">Special 20% off</p>
              <p className="text-[10px] text-gray-400">Diwali sale is live</p>
            </div>
            {/* incoming message */}
            <div className="absolute right-2 top-16 w-40 rounded-2xl rounded-tr-sm bg-green-100 px-3 py-2 shadow-sm">
              <p className="text-[11px] text-gray-700">I want to buy this 🎉</p>
            </div>
            {/* metric pill */}
            <div className="absolute left-6 bottom-16 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-md">
              <span className="text-sm font-bold text-green-600">3.2x</span>
              <span className="text-[10px] text-gray-500">more reach</span>
            </div>
            {/* order placed */}
            <div className="absolute bottom-6 right-4 flex items-center gap-1.5 rounded-full bg-green-600 px-3 py-1.5 shadow-lg">
              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              <span className="text-[11px] font-medium text-white">Order Placed</span>
            </div>
            <div className="absolute bottom-24 left-2 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-md">
              <ShoppingBag className="h-3.5 w-3.5 text-green-600" />
              <span className="text-[11px] font-semibold text-gray-700">150 orders</span>
            </div>
          </div>
        </div>

        {/* Trusted by */}
        <div className="mt-auto">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-xs text-gray-500">Trusted by 2,50,000+ businesses</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>
          <div className="grid grid-cols-6 items-center gap-3 opacity-70">
            {trustedBy.map(name => (
              <span key={name} className="text-center text-xs font-bold text-gray-500">{name}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="relative flex flex-1 flex-col justify-center px-6 py-12 lg:px-20">
        <div className="absolute right-6 top-6 text-sm text-gray-500 lg:right-12">
          Not a member yet?{' '}
          <Link href="/signup" className="font-semibold text-green-600 hover:text-green-700">Sign up</Link>
        </div>

        <div className="mx-auto w-full max-w-sm">
          <Logo size={32} textClassName="text-gray-900" className="mb-8 lg:hidden" />

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Welcome back</p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Log in to Adyapan Connect</h1>

          <button
            type="button"
            onClick={handleGoogle}
            className="mt-8 flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#4285F4] py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#3b78e7]"
          >
            <GoogleIcon className="h-4 w-4" />
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="Username / Email"
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-3.5 py-3 text-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-3 pr-10 text-sm placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Continue
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-sm font-medium text-green-600 hover:text-green-700">
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
