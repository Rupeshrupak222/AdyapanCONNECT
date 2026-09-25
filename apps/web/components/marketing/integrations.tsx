const integrations = [
  { name: 'WhatsApp', emoji: '💬', category: 'Messaging' },
  { name: 'Meta Ads', emoji: '📢', category: 'Advertising' },
  { name: 'Razorpay', emoji: '💳', category: 'Payments' },
  { name: 'Stripe', emoji: '💳', category: 'Payments' },
  { name: 'Shopify', emoji: '🛒', category: 'E-commerce' },
  { name: 'WooCommerce', emoji: '🛒', category: 'E-commerce' },
  { name: 'Google Sheets', emoji: '📊', category: 'Productivity' },
  { name: 'Slack', emoji: '💼', category: 'Collaboration' },
  { name: 'Zapier', emoji: '⚡', category: 'Automation' },
  { name: 'Adyapan CRM', emoji: '🏢', category: 'CRM' },
];

export function Integrations() {
  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Connect Your Entire Stack</h2>
          <p className="mt-4 text-lg text-gray-600">Native integrations with the tools your business already uses.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          {integrations.map(i => (
            <div key={i.name} className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm hover:border-green-300 hover:shadow-md transition-all">
              <span className="text-xl">{i.emoji}</span>
              <div>
                <div className="text-sm font-semibold text-gray-800">{i.name}</div>
                <div className="text-xs text-gray-400">{i.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
