import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Adyapan Connect – WhatsApp Business Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 60%)',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
            }}
          >
            ⚡
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: '#111827', display: 'flex' }}>
            Adyapan <span style={{ color: '#22c55e', marginLeft: 10 }}>Connect</span>
          </div>
        </div>
        <div style={{ marginTop: 40, fontSize: 60, fontWeight: 800, color: '#0b3d2e', lineHeight: 1.1, maxWidth: 900 }}>
          Business conversation made simple, powered by AI
        </div>
        <div style={{ marginTop: 24, fontSize: 28, color: '#4b5563' }}>
          WhatsApp Messaging, CRM & Automation SaaS
        </div>
      </div>
    ),
    { ...size },
  );
}
