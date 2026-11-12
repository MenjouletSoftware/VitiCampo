import { createHmac } from 'node:crypto';

type CreateResp = { success: boolean; url?: string; sessionId?: string; error?: string };

// Use direct HTTP calls to Polar API on the server. Dynamic SDK imports caused
// build-time warnings in Next.js (critical dependency). Keeping a simple
// fetch-based implementation is reliable and minimal.

export async function createCheckout(productId: string, orgId: string, opts?: { success_url?: string; cancel_url?: string }) : Promise<CreateResp> {
  const isDemo = (process.env.DEMO_MODE ?? '').toLowerCase() === 'true';
  if (isDemo) return { success: true, url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=demo&org=${orgId}` };

  const POLAR_KEY = process.env.POLAR_SECRET_KEY;
  if (!POLAR_KEY) return { success: false, error: 'POLAR_SECRET_KEY not configured' };

  try {
    const resp = await fetch('https://api.polar.sh/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${POLAR_KEY}` },
      body: JSON.stringify({ product_id: productId, metadata: { org_id: orgId }, success_url: opts?.success_url, cancel_url: opts?.cancel_url }),
    });
    const json = await resp.json();
    if (!resp.ok) return { success: false, error: JSON.stringify(json) };
    return { success: true, url: json.checkout_url || json.url, sessionId: json.id || json.session_id };
  } catch (err: any) {
    return { success: false, error: String(err.message || err) };
  }
}

export async function verifyWebhook(rawBody: string, signature?: string) {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    return { verified: false, error: 'POLAR_WEBHOOK_SECRET not configured' };
  }

  try {
    const event = JSON.parse(rawBody);
    const candidates = [signature, `sha256=${signature}`].filter(Boolean) as string[];
    const expected = createHmac('sha256', secret).update(rawBody).digest('base64');
    const expectedHex = createHmac('sha256', secret).update(rawBody).digest('hex');
    const isValid = candidates.some((value) => {
      const normalized = value.trim();
      return normalized === expected || normalized === expectedHex || normalized === `sha256=${expected}` || normalized === `sha256=${expectedHex}`;
    });

    if (!isValid) {
      return { verified: false, error: 'invalid polar signature' };
    }

    return { verified: true, event };
  } catch (err) {
    return { verified: false, error: 'invalid json' };
  }
}

export default { createCheckout, verifyWebhook };
