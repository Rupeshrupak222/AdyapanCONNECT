'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import { saveSession, isAuthed } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthed()) router.replace('/dashboard');
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const data = res.data.data;
      if (data.requiresTwoFactor) {
        setError('This admin account has 2FA enabled. Use the main app to complete 2FA.');
        return;
      }
      if (data.user?.role !== 'SUPER_ADMIN') {
        setError('Access denied. This panel is for platform administrators only.');
        return;
      }
      saveSession(data.accessToken, data.refreshToken, data.user);
      router.replace('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-green-600">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Adyapan Connect</h1>
          <p className="mt-1 text-sm text-gray-400">Super Admin Panel</p>
        </div>

        <form onSubmit={submit} className="rounded-2xl border border-gray-800 bg-gray-800/50 p-6 shadow-xl backdrop-blur">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <label className="mb-1.5 block text-sm font-medium text-gray-300">Admin email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@adyapanconnect.com"
            className="mb-4 w-full rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
          />

          <label className="mb-1.5 block text-sm font-medium text-gray-300">Password</label>
          <div className="relative mb-5">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-700 bg-gray-900 px-3.5 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign In to Admin
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            Restricted access. Authorized platform administrators only.
          </p>
        </form>
      </div>
    </div>
  );
}
