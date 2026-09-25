'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthed } from '@/lib/auth';

export default function IndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(isAuthed() ? '/dashboard' : '/login');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
    </div>
  );
}
