'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';
import { Logo } from '@/components/brand/logo';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch (err: any) {
      // For security, still show success even if the email is not found
      setSent(true);
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
          {sent ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <h1 className="mt-4 text-xl font-bold text-gray-900">Check your email</h1>
              <p className="mt-2 text-sm text-gray-600">
                If an account exists for that address, we have sent a link to reset your password.
              </p>
              <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-gray-900">Forgot your password?</h1>
              <p className="mt-1.5 text-sm text-gray-600">Enter your email and we will send you a reset link.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                  <input
                    {...register('email')}
                    type="email"
                    autoComplete="email"
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send reset link
                </button>
              </form>
              <Link href="/login" className="mt-5 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-500 hover:text-green-600">
                <ArrowLeft className="h-4 w-4" /> Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
