'use client';
import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useToast } from '@/hooks/use-toast';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const setAuth = useAuthStore(s => s.setAuth);
  const { toast } = useToast();

  useEffect(() => {
    const data = searchParams.get('data');
    const error = searchParams.get('error');

    if (error) {
      toast({ title: 'Sign-in failed', description: error, variant: 'destructive' });
      router.replace('/login');
      return;
    }

    if (!data) {
      router.replace('/login');
      return;
    }

    try {
      const decoded = JSON.parse(atob(decodeURIComponent(data)));
      const { user, accessToken, refreshToken } = decoded;
      if (!accessToken || !user) throw new Error('Invalid response');
      setAuth(user, accessToken, refreshToken, user.tenantSlug);
      router.replace('/dashboard');
    } catch {
      toast({ title: 'Sign-in failed', description: 'Could not complete sign-in.', variant: 'destructive' });
      router.replace('/login');
    }
  }, [searchParams, router, setAuth, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
        <p className="text-sm text-gray-500">Completing sign-in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={null}>
      <CallbackContent />
    </Suspense>
  );
}
