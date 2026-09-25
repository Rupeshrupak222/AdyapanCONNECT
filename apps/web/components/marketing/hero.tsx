'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { ArrowRight, Play, CheckCircle2, Sparkles, Star, TrendingUp, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const highlights = [
  'Setup in under 5 minutes',
  'No credit card required',
  'Cancel anytime',
];

// Words that rotate (fade in/out) inside the headline
const rotatingWords = ['#1 sales channel', 'support superhero', 'growth engine', 'favourite inbox', 'revenue machine'];

const stats = [
  { value: '500+', label: 'Businesses' },
  { value: '10M+', label: 'Messages sent' },
  { value: '98%', label: 'Delivery rate' },
  { value: '190+', label: 'Countries' },
];

// Shared easing for a smooth, premium feel
const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex(i => (i + 1) % rotatingWords.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-green-50 pb-16 pt-10 sm:pt-12 lg:pt-14">
      {/* ---- Animated background ---- */}
      <div className="absolute inset-0 -z-10">
        {/* base gradient — light green */}
        <div className="absolute inset-0 bg-gradient-to-b from-green-100 via-green-50 to-green-50/60" />
        {/* floating orbs */}
        <motion.div
          className="absolute -top-32 -right-24 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-amber-300/40 to-orange-400/30 blur-3xl"
          animate={{ y: [0, 30, 0], x: [0, -20, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -left-24 h-[480px] w-[480px] rounded-full bg-gradient-to-tr from-green-300/40 to-emerald-400/30 blur-3xl"
          animate={{ y: [0, -25, 0], x: [0, 20, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-green-200/80 bg-white/70 px-4 py-1.5 text-sm font-medium text-green-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-500" />
              #1 AI WhatsApp Platform · Official Meta Partner
              <span className="ml-1 flex h-2 w-2 rounded-full bg-green-500">
                <span className="h-2 w-2 animate-ping rounded-full bg-green-500 opacity-75" />
              </span>
            </span>
          </motion.div>

          {/* Headline with gradient accent */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease }}
            className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight text-gray-900 sm:text-4xl lg:text-5xl"
          >
            Turn WhatsApp into your{' '}
            <span className="relative inline-flex min-h-[1.1em] items-center justify-center align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={rotatingWords[wordIndex]}
                  initial={{ opacity: 0, y: 20, rotateX: -40 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -20, rotateX: 40 }}
                  transition={{ duration: 0.5, ease }}
                  className="whitespace-nowrap bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 bg-clip-text text-transparent"
                >
                  {rotatingWords[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            <br className="hidden sm:block" />{' '}
            powered by{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Adyapan Connect
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease }}
            className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg"
          >
            Sell more, reply faster, and delight every customer — automate conversations, launch campaigns,
            and let AI close deals for you. All from <span className="font-semibold text-gray-800">one inbox</span>.
          </motion.p>

          {/* Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.28, duration: 0.5 }}
            className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2"
          >
            {highlights.map(h => (
              <span key={h} className="flex items-center gap-1.5 text-sm text-gray-500">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                {h}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.34, ease }}
            className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              href="/signup"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-green-500/40 active:scale-100 sm:text-base"
            >
              {/* shine sweep */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Start Free — It&apos;s Free Forever
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white/80 px-7 py-3 text-sm font-semibold text-gray-700 shadow-sm backdrop-blur transition-all hover:border-green-300 hover:bg-white hover:shadow-md sm:text-base"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <Play className="h-3 w-3 fill-green-600 text-green-600" />
              </span>
              Book a Demo
            </Link>
          </motion.div>

          {/* Trust stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.44, ease }}
            className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {stats.map(s => (
              <div key={s.label} className="rounded-2xl border border-gray-100 bg-white/70 px-4 py-3 backdrop-blur">
                <div className="bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-2xl font-extrabold text-transparent">
                  {s.value}
                </div>
                <div className="mt-0.5 text-xs font-medium text-gray-500">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ---- Dashboard mockup ---- */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          className="relative mx-auto mt-10 max-w-5xl"
        >
          {/* Floating chat bubbles */}
          <motion.div
            className="absolute -left-4 top-16 z-20 hidden items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl sm:flex"
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
              <MessageCircle className="h-4 w-4 text-green-600" />
            </span>
            <div>
              <p className="text-xs font-semibold text-gray-900">New order confirmed</p>
              <p className="text-[11px] text-gray-400">via WhatsApp · just now</p>
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-4 top-40 z-20 hidden items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-xl sm:flex"
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100">
              <TrendingUp className="h-4 w-4 text-amber-600" />
            </span>
            <div>
              <p className="text-xs font-semibold text-gray-900">+38% conversions</p>
              <p className="text-[11px] text-gray-400">this month</p>
            </div>
          </motion.div>

          {/* glow */}
          <div className="absolute inset-x-8 -bottom-6 h-24 rounded-full bg-green-400/20 blur-3xl" />

          <div className="relative overflow-hidden rounded-2xl border border-green-100 bg-white shadow-2xl shadow-green-200/40">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <div className="ml-4 flex-1 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-400">
                connect.adyapan.com/dashboard
              </div>
            </div>
            {/* Dashboard preview */}
            <div className="grid grid-cols-4 gap-0">
              {/* Sidebar */}
              <div className="col-span-1 border-r border-gray-100 bg-gray-50 p-4">
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
                  <span className="text-xs font-bold text-gray-700">Adyapan Connect</span>
                </div>
                {['Dashboard', 'Inbox', 'Contacts', 'Campaigns', 'Templates', 'Analytics', 'CRM', 'AI Agent'].map((item, i) => (
                  <div key={item} className={`mb-1 flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs ${i === 0 ? 'bg-green-600 font-medium text-white' : 'text-gray-500'}`}>
                    <div className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-green-200' : 'bg-gray-300'}`} />
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div className="col-span-3 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="mb-1 h-4 w-32 rounded bg-gray-900" />
                    <div className="h-2.5 w-20 rounded bg-gray-300" />
                  </div>
                  <div className="h-7 w-24 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600" />
                </div>
                <div className="mb-4 grid grid-cols-4 gap-3">
                  {[
                    { label: 'Messages Sent', value: '24,891', color: 'text-green-600' },
                    { label: 'Delivered', value: '98.2%', color: 'text-blue-600' },
                    { label: 'Read Rate', value: '67.4%', color: 'text-purple-600' },
                    { label: 'Active Chats', value: '142', color: 'text-orange-600' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm">
                      <div className={`text-base font-bold ${s.color}`}>{s.value}</div>
                      <div className="mt-0.5 text-[10px] text-gray-400">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="mb-3 h-3 w-28 rounded bg-gray-200" />
                  <div className="flex h-20 items-end gap-1">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-green-500 to-emerald-400"
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: 0.6 + i * 0.05, ease }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="mt-8 flex items-center justify-center gap-1.5 text-sm text-gray-400"
        >
          <span className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
            ))}
          </span>
          Rated <strong className="text-gray-600">4.9/5</strong> by <strong className="text-gray-600">500+</strong> growing businesses across India
        </motion.p>
      </div>
    </section>
  );
}
