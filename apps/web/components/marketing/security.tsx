import { Shield, Lock, Eye, Key, Server, FileCheck } from 'lucide-react';

const items = [
  { icon: Lock, title: 'End-to-End Encryption', desc: 'All data encrypted at rest and in transit using industry-standard AES-256.' },
  { icon: Shield, title: 'Granular RBAC', desc: 'Role-based access control with 20+ permissions across all platform features.' },
  { icon: Eye, title: 'Full Audit Logs', desc: 'Every action logged with user, IP, timestamp, before and after state.' },
  { icon: Key, title: 'API Security', desc: 'Hashed API keys, HMAC webhook signatures, and rate limiting on all endpoints.' },
  { icon: Server, title: 'Tenant Isolation', desc: 'Complete data isolation — no tenant can access another tenant\'s data.' },
  { icon: FileCheck, title: '2FA & Session Control', desc: 'TOTP-based 2FA, backup codes, and full session management.' },
];

export function Security() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Enterprise-Grade Security</h2>
          <p className="mt-4 text-lg text-gray-600">Built for businesses that take data security seriously.</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <div key={item.title} className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
              <item.icon className="h-7 w-7 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
