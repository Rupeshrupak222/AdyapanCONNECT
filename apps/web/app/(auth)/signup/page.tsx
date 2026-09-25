'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/brand/logo';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const schema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  businessName: z.string().min(2, 'Business name required'),
  email: z.string().email('Enter a valid business email'),
  password: z.string().min(8, 'At least 8 characters').regex(/[A-Z]/, 'Must include uppercase').regex(/[0-9]/, 'Must include a number'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  source: z.string().min(1, 'Please select an option'),
});
type FormData = z.infer<typeof schema>;

const features = [
  'Run high converting campaigns on: WhatsApp, RCS, SMS, TikTok, Calls and more',
  'Become 10x more productive with AI: Copilot, Agents, and Chatbots',
  'Collaborate, convert and retain better with AI-enabled multichannel Team inbox',
  'Breathe easy with enterprise-grade reliability, better delivery rates, and secure infrastructure',
];

const brands = ['amazon', 'duolingo', 'CMER', 'J.P.Morgan', 'Loggi'];
const sources = ['Google Search', 'Social Media', 'Friend / Referral', 'Blog / Article', 'YouTube', 'Other'];

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
      <path d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12Z" />
    </svg>
  );
}

export default function SignupPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { toast } = useToast();

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema), mode: 'onTouched' });

  const goNext = async () => {
    const valid = await trigger(['firstName', 'lastName', 'businessName', 'email']);
    if (valid) setStep(2);
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      // Backend accepts: firstName, lastName, email, password, businessName?, acceptTerms
      await api.post('/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        businessName: data.businessName,
        email: data.email,
        password: data.password,
        phoneNumber: `+91${data.phone}`,
        source: data.source,
        acceptTerms: true,
      });
      toast({ title: 'Account created!', description: 'Enter the code we sent to verify your email.' });
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      toast({ title: 'Registration failed', description: err.response?.data?.error?.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => { window.location.href = `${API_URL}/api/v1/auth/google`; };
  const handleFacebook = () => { window.location.href = `${API_URL}/api/v1/auth/github`; };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left — marketing panel */}
      <div
        className="relative hidden lg:flex lg:w-1/2 flex-col bg-[#f4f6f8] bg-cover bg-center px-14 py-12"
        style={{ backgroundImage: "url('/auth-bg.jpg')" }}
      >
        {/* Overlay so the text stays readable over the image */}
        <div className="pointer-events-none absolute inset-0 bg-black/55" />
        <div className="relative z-10 flex flex-col">
        <h2 className="text-3xl font-bold leading-snug text-white">
          Business conversation made simple,<br />
          <span className="text-green-400">powered by AI</span>
        </h2>

        <div className="mt-8 space-y-4">
          {features.map(f => (
            <div key={f} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
              <p className="text-sm leading-relaxed text-gray-100">{f}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-sm">
          <p className="text-sm italic text-gray-100">
            &ldquo;Our entire subscription model now works on WhatsApp powered by Adyapan. We get 5X
            more reach and 2X higher order confirmation rates.&rdquo;
          </p>
          <p className="mt-2 text-xs font-medium text-gray-300">Heritage Foods</p>
        </div>

        <p className="mt-8 text-sm font-medium text-gray-200">Loved by 16,000+ customers, across 190+ countries</p>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 opacity-90">
          {brands.map(b => (
            <span key={b} className="text-base font-bold text-gray-300">{b}</span>
          ))}
        </div>
        </div>
      </div>

      {/* Right — signup form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Top bar — back button + brand */}
          <div className="mb-8 flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <Logo size={32} textClassName="text-lg text-gray-900" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900">Start your free trial</h1>
          <p className="mt-1 text-sm text-gray-500">Get started with a demo account on Adyapan Connect</p>

          {/* Step progress */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</span>
              <span className={`text-xs font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Your details</span>
            </div>
            <div className={`h-0.5 flex-1 rounded ${step >= 2 ? 'bg-green-600' : 'bg-gray-200'}`} />
            <div className="flex items-center gap-2">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</span>
              <span className={`text-xs font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Security</span>
            </div>
          </div>

          {/* Social sign up — only on step 1 */}
          {step === 1 && (
            <>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button type="button" onClick={handleGoogle}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  <GoogleIcon className="h-4 w-4" /> Sign Up With Google
                </button>
                <button type="button" onClick={handleFacebook}
                  className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  <FacebookIcon className="h-4 w-4" /> Sign Up With Facebook
                </button>
              </div>

              <div className="my-5 flex items-center justify-center">
                <span className="text-xs text-gray-400">or sign up with email</span>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            {/* Step 1 — personal & business details */}
            <div className={step === 1 ? 'space-y-4' : 'hidden'}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    <span className="text-red-500">*</span> First Name
                  </label>
                  <input {...register('firstName')} type="text"
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                  {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    <span className="text-red-500">*</span> Last Name
                  </label>
                  <input {...register('lastName')} type="text"
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                  {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> Business / Company Name
                </label>
                <input {...register('businessName')} type="text"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                {errors.businessName && <p className="mt-1 text-xs text-red-600">{errors.businessName.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> Business Email Address
                </label>
                <input {...register('email')} type="email"
                  className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>

              <button type="button" onClick={goNext}
                className="mt-2 w-full rounded-lg bg-green-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700">
                Next
              </button>
            </div>

            {/* Step 2 — security & extras */}
            <div className={step === 2 ? 'space-y-4' : 'hidden'}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> Password
                </label>
                <div className="relative">
                  <input {...register('password')} type={showPw ? 'text' : 'password'}
                    className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 pr-10 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> Phone number
                </label>
                <div className="flex">
                  <span className="inline-flex items-center gap-1 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-600">
                    🇮🇳 IN (+91)
                  </span>
                  <input {...register('phone')} type="tel" placeholder="Phone number"
                    className="w-full rounded-r-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20" />
                </div>
                {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  <span className="text-red-500">*</span> How did you hear about Adyapan?
                </label>
                <select {...register('source')} defaultValue=""
                  className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-700 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20">
                  <option value="" disabled>Select</option>
                  {sources.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.source && <p className="mt-1 text-xs text-red-600">{errors.source.message}</p>}
              </div>

              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-[11px] leading-relaxed text-gray-500">
                  By signing up, you agree to the{' '}
                  <Link href="/terms" className="underline">Terms &amp; Conditions</Link> and{' '}
                  <Link href="/privacy" className="underline">Privacy Policy</Link>, and consent to receive
                  marketing communications from Adyapan and our service partners.
                </p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button type="submit" disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Start My Trial
                </button>
              </div>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-green-600 hover:text-green-700">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
