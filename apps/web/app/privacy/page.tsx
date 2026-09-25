import { LegalPage } from '@/components/marketing/legal-page';
import { COMPANY } from '@/lib/company';

export const metadata = { title: 'Privacy Policy | Adyapan Connect' };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 1, 2026"
      intro={`This Privacy Policy explains how ${COMPANY.legalName} ("we", "us") collects, uses, and protects your information when you use ${COMPANY.brand}.`}
      sections={[
        { heading: 'Information We Collect', body: 'We collect account details, contact information, message metadata, and usage data needed to provide and improve the service.' },
        { heading: 'How We Use Information', body: 'We use your information to operate the platform, deliver messages, provide support, process billing, and improve our features.' },
        { heading: 'Data Sharing', body: 'We share data with service providers such as WhatsApp/Meta and payment processors only as needed to deliver the service. We never sell your data.' },
        { heading: 'Data Retention', body: 'We retain data for as long as your account is active or as required to comply with legal obligations.' },
        { heading: 'Security', body: 'We use encryption, access controls, and regular audits to protect your data against unauthorized access.' },
        { heading: 'Your Rights', body: 'You may access, correct, export, or delete your personal data by contacting us or using in-app controls.' },
        { heading: 'Cookies', body: 'We use cookies and similar technologies to keep you signed in and to understand how the product is used.' },
        { heading: 'Contact', body: `For privacy questions or requests, contact ${COMPANY.legalName} at ${COMPANY.email}, or write to us at ${COMPANY.registeredAddress}.` },
      ]}
    />
  );
}
