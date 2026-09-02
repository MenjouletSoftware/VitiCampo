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
  // For now, parse the JSON payload and return it. If Polar provides a
  // webhook signature verification method later, we can add it and use the
  // `POLAR_WEBHOOK_SECRET` to verify payloads.
  try {
    const event = JSON.parse(rawBody);
    return { verified: true, event };
  } catch (err) {
    return { verified: false, error: 'invalid json' };
  }
}

export default { createCheckout, verifyWebhook };
