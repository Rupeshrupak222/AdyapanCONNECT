import { LegalPage } from '@/components/marketing/legal-page';
import { COMPANY } from '@/lib/company';

export const metadata = { title: 'Refund Policy | Adyapan Connect' };

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      updated="September 1, 2026"
      intro={`This Refund Policy describes when and how refunds are issued for ${COMPANY.brand} subscriptions and wallet balances.`}
      sections={[
        { heading: 'Subscription Fees', body: 'Subscription fees are billed in advance and are generally non-refundable except where required by law.' },
        { heading: 'Free Trial', body: 'You can evaluate the platform during the free trial. You will only be charged when you upgrade to a paid plan.' },
        { heading: 'Wallet Balance', body: 'Unused wallet balance used for WhatsApp conversation charges is non-refundable but remains available for future messaging.' },
        { heading: 'Cancellations', body: 'You can cancel anytime. Your plan stays active until the end of the current billing period; no partial refunds are provided.' },
        { heading: 'Billing Errors', body: 'If you believe you were charged in error, contact us within 7 days and we will investigate and correct valid issues.' },
        { heading: 'How to Request', body: `To request a refund for an eligible charge, email ${COMPANY.email} with your account and transaction details.` },
      ]}
    />
  );
}
