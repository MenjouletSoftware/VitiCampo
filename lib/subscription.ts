export const PLAN_DEFINITIONS = {
  premium: {
    label: 'Premium',
    trialDays: 30,
    priceUsd: 149,
    hectares: 'Acceso completo',
    summary: 'Plan comercial premium de VitiCampo con diagnóstico agronómico inteligente y gestión B2B multi-tenant.',
  },
} as const;

export type PlanKey = keyof typeof PLAN_DEFINITIONS;

export type SubscriptionUser = {
  created_at?: string;
  trial_ends_at?: string;
  plan?: PlanKey;
  subscription_status?: 'active' | 'inactive';
  es_vip?: boolean;
};

export function getDaysSince(dateString?: string) {
  if (!dateString) {
    return 0;
  }

  const createdAt = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - createdAt.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function getTrialDaysLeft(trialEndsAt?: string) {
  if (!trialEndsAt) {
    return 0;
  }

  const expiresAt = new Date(trialEndsAt);
  const now = new Date();
  const diffMs = expiresAt.getTime() - now.getTime();
  if (diffMs <= 0) return 0;
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function getSubscriptionState(user: SubscriptionUser) {
  const plan = user.plan ?? 'premium';
  const isVIP = Boolean(user.es_vip);
  const trialDaysLeft = getTrialDaysLeft(user.trial_ends_at);
  const isWithinTrial = !isVIP && Boolean(user.trial_ends_at) && trialDaysLeft > 0;
  const hasAccess = isVIP || user.subscription_status === 'active' || isWithinTrial || plan === 'premium';

  return {
    daysSince: getDaysSince(user.created_at),
    isVIP,
    isWithinTrial,
    hasAccess,
    trialDaysLeft,
    plan,
    isDemoTrialActive: isWithinTrial,
  };
}

export function getPlanMeta(plan?: PlanKey) {
  return PLAN_DEFINITIONS[plan || 'premium'];
}

export function createTrialUser(plan: PlanKey = 'premium', trialEndsAt?: string): SubscriptionUser {
  return {
    created_at: new Date().toISOString(),
    trial_ends_at: trialEndsAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    plan,
    subscription_status: 'active',
    es_vip: true,
  };
}

export function saveDemoTrial(plan: PlanKey = 'premium') {
  return createTrialUser(plan);
}

export async function checkPortalAccess(email: string) {
  const response = await fetch('/api/auth/eligibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase() }),
  });

  const data = await response.json();
  return {
    allowedFreeTrial: Boolean(data.allowedFreeTrial),
    requiresPayment: Boolean(data.requiresPayment),
    reason: data.reason ?? 'Se requiere pago inmediato de $149 USD/mes.',
  };
}
