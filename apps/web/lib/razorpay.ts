import api from '@/lib/api';

const RZP_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

function loadScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${RZP_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      return;
    }
    const s = document.createElement('script');
    s.src = RZP_SCRIPT;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

type PayArgs = {
  type: 'plan' | 'wallet';
  planId?: string;
  amount?: number; // rupees, for wallet
  name: string; // customer / business name
  email?: string;
  description: string;
};

/**
 * Opens Razorpay Checkout for a plan purchase or wallet top-up.
 * 1) creates an order on our backend
 * 2) opens Razorpay
 * 3) verifies the signature on our backend (which then activates plan / credits wallet)
 * Resolves with the verified result, rejects/returns null if cancelled or failed.
 */
export async function payWithRazorpay(args: PayArgs): Promise<any> {
  const ok = await loadScript();
  if (!ok) throw new Error('Could not load Razorpay. Check your connection.');

  const order = (await api.post('/billing/create-order', {
    type: args.type,
    planId: args.planId,
    amount: args.amount,
  })).data.data as { orderId: string; amount: number; currency: string; keyId: string };

  return new Promise((resolve, reject) => {
    const rzp = new (window as any).Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'Adyapan Connect',
      description: args.description,
      prefill: { name: args.name, email: args.email },
      theme: { color: '#16a34a' },
      handler: async (resp: any) => {
        try {
          const verified = (await api.post('/billing/verify-payment', {
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
            type: args.type,
            planId: args.planId,
            amount: args.amount,
          })).data.data;
          resolve(verified);
        } catch (err) {
          reject(err);
        }
      },
      modal: {
        ondismiss: () => resolve(null), // user cancelled
      },
    });
    rzp.open();
  });
}
