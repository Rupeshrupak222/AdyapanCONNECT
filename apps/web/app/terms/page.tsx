import { LegalPage } from '@/components/marketing/legal-page';
import { COMPANY } from '@/lib/company';

export const metadata = { title: 'Terms & Conditions | Adyapan Connect' };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="September 1, 2026"
      intro={`These Terms & Conditions govern your use of ${COMPANY.brand}, operated by ${COMPANY.legalName}. By creating an account or using our services, you agree to these terms.`}
      sections={[
        { heading: 'Acceptance of Terms', body: `By accessing or using the platform, you agree to be bound by these terms and all applicable laws and regulations. ${COMPANY.brand} is a product of ${COMPANY.legalName}.` },
        { heading: 'Use of Service', body: 'You may use the service only for lawful purposes and in compliance with WhatsApp Business policies and applicable messaging regulations.' },
        { heading: 'Accounts', body: 'You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.' },
        { heading: 'Billing', body: 'Subscription fees and per-conversation charges are billed as described on your plan. WhatsApp conversation fees are passed through at cost.' },
        { heading: 'Acceptable Use', body: 'You agree not to send spam, unsolicited messages, or any content that violates WhatsApp policies. Violations may result in suspension.' },
        { heading: 'Termination', body: 'We may suspend or terminate access for breach of these terms. You may cancel your subscription at any time from your dashboard.' },
        { heading: 'Limitation of Liability', body: 'The service is provided as is. To the maximum extent permitted by law, we are not liable for indirect or consequential damages.' },
        { heading: 'Governing Law', body: `These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of ${COMPANY.jurisdiction}.` },
        { heading: 'Changes to Terms', body: 'We may update these terms from time to time. Continued use after changes constitutes acceptance of the revised terms.' },
        { heading: 'Contact', body: `For questions about these terms, contact ${COMPANY.legalName} at ${COMPANY.email}, or write to us at ${COMPANY.registeredAddress}.` },
      ]}
    />
  );
}
