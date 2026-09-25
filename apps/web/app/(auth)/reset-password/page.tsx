'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const schema = z.object({
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Must include uppercase').regex(/[0-9]/, 'Must include a number'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type FormData = z.infer<typeof schema>;

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const token = searchParams.get('token') ?? '';
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      toast({ title: 'Invalid link', description: 'This reset link is missing or expired.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, password: data.password, confirmPassword: data.confirmPassword });
      toast({ title: 'Password reset', description: 'You can now log in with your new password.' });
      router.push('/login');
    } catch (err: any) {
      toast({ title: 'Reset failed', description: err.response?.data?.error?.message || 'Invalid or expired token', variant: 'destructive' });
    } finally {
      setLoading(false);
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
            <KeyRound className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="mt-4 text-center text-xl font-bold text-gray-900">Set a new password</h1>
          <p className="mt-1.5 text-center text-sm text-gray-600">Choose a strong password for your account.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">New password</label>
              <div className="relative">
                <input {...register('password')} type={show ? 'text' : 'password'}
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-10 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Confirm password</label>
              <input {...register('confirmPassword')} type={show ? 'text' : 'password'}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Reset Password
            </button>
          </form>

          <Link href="/login" className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-600">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
