// Meta Embedded Signup helper — loads the Facebook JS SDK and launches the
// WhatsApp embedded signup flow, returning the auth `code` + shared WABA/number.

const APP_ID = process.env.NEXT_PUBLIC_META_APP_ID;
const CONFIG_ID = process.env.NEXT_PUBLIC_META_CONFIG_ID;
const GRAPH_VERSION = process.env.NEXT_PUBLIC_META_GRAPH_VERSION || 'v19.0';

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

export function isEmbeddedSignupConfigured(): boolean {
  return !!APP_ID && APP_ID !== 'placeholder' && !!CONFIG_ID && CONFIG_ID !== 'placeholder';
}

function loadFbSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('No window'));
    if (window.FB) return resolve();

    window.fbAsyncInit = function () {
      window.FB.init({ appId: APP_ID, autoLogAppEvents: true, xfbml: true, version: GRAPH_VERSION });
      resolve();
    };

    if (document.getElementById('facebook-jssdk')) return;
    const js = document.createElement('script');
    js.id = 'facebook-jssdk';
    js.src = 'https://connect.facebook.net/en_US/sdk.js';
    js.onerror = () => reject(new Error('Failed to load Facebook SDK'));
    document.body.appendChild(js);
  });
}

export type SignupResult = { code: string; wabaId?: string; phoneNumberId?: string };

/**
 * Launches the embedded signup popup. Resolves with the auth code (+ shared IDs
 * captured from the session message event). Rejects if cancelled/blocked.
 */
export async function launchEmbeddedSignup(): Promise<SignupResult> {
  if (!isEmbeddedSignupConfigured()) {
    throw new Error('Embedded signup is not configured yet. Ask the platform admin to set the Meta App ID and Config ID.');
  }
  await loadFbSdk();

  // Capture WABA/phone ids that Meta posts via window message during signup.
  const shared: { wabaId?: string; phoneNumberId?: string } = {};
  const onMessage = (event: MessageEvent) => {
    if (!event.origin.includes('facebook.com')) return;
    try {
      const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (data?.type === 'WA_EMBEDDED_SIGNUP' && data?.data) {
        shared.wabaId = data.data.waba_id || shared.wabaId;
        shared.phoneNumberId = data.data.phone_number_id || shared.phoneNumberId;
      }
    } catch { /* ignore non-JSON messages */ }
  };
  window.addEventListener('message', onMessage);

  return new Promise<SignupResult>((resolve, reject) => {
    window.FB.login(
      (response: any) => {
        window.removeEventListener('message', onMessage);
        const code = response?.authResponse?.code;
        if (code) {
          resolve({ code, ...shared });
        } else {
          reject(new Error('Signup was cancelled or not completed.'));
        }
      },
      {
        config_id: CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras: { setup: {}, featureType: '', sessionInfoVersion: '2' },
      },
    );
  });
}
