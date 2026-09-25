'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const faqs = [
  { q: 'What is Adyapan Connect?', a: 'Adyapan Connect is an AI-powered WhatsApp Business platform that combines messaging, CRM, chatbot, automation, and analytics in one place.' },
  { q: 'Is it the official WhatsApp API?', a: 'Yes. Adyapan Connect uses the official Meta WhatsApp Business Cloud API. No unofficial bots or automation.' },
  { q: 'Do I need a WhatsApp Business number?', a: 'Yes. You\'ll need a phone number to connect. Our onboarding wizard walks you through the entire setup via Meta\'s embedded signup flow.' },
  { q: 'How much does WhatsApp messaging cost?', a: 'WhatsApp/Meta charges per message conversation based on category and country. These are separate from Adyapan Connect\'s platform subscription fee.' },
  { q: 'Can I connect multiple numbers?', a: 'Yes. Growth plan supports 3 numbers, Business plan supports 10. Enterprise is unlimited.' },
  { q: 'Can multiple agents share one inbox?', a: 'Yes. The shared team inbox supports unlimited agents with assignment, transfer, labels, and real-time collaboration.' },
  { q: 'Can I create chatbots without coding?', a: 'Yes. The visual no-code chatbot builder lets you design conversation flows with drag-and-drop nodes.' },
  { q: 'Can AI handle customer queries automatically?', a: 'Yes. Train an AI agent on your knowledge base (PDFs, URLs, FAQs) and it answers questions, qualifies leads and updates CRM automatically.' },
  { q: 'Is there a REST API?', a: 'Yes. Full REST API with API keys, webhook support, request logs, and Swagger documentation.' },
  { q: 'Can agencies manage multiple businesses?', a: 'Yes. Our Enterprise plan includes Agency Mode to manage multiple client accounts from one dashboard with white-labeling support.' },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Frequently Asked Questions</h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
              <button className="flex w-full items-center justify-between px-5 py-4 text-left" onClick={() => setOpen(open === i ? null : i)}>
                <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform shrink-0', open === i && 'rotate-180')} />
              </button>
              {open === i && (
                <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
