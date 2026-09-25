export function LogoStrip() {
  const companies = ['Razorpay', 'Shopify', 'WooCommerce', 'Google Sheets', 'Slack', 'Zapier', 'Stripe', 'Meta'];
  return (
    <section className="border-y border-gray-100 bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">
          Integrates with the tools you already use
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {companies.map(c => (
            <div key={c} className="flex h-8 items-center rounded-full border border-gray-200 bg-white px-4 text-sm font-medium text-gray-500 shadow-sm">
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
