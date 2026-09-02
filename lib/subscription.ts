export const PLAN_DEFINITIONS = {
  starter: {
    label: 'Starter',
    trialDays: 7,
    hectares: 'Hasta 10 ha',
    summary: 'Ideal para pequeños viñedos y operaciones iniciales.',
  },
  pro: {
    label: 'Pro',
    trialDays: 14,
    hectares: 'Hasta 100 ha',
    summary: 'Para explotaciones medias con seguimiento agronómico real.',
  },
  enterprise: {
    label: 'Enterprise',
    trialDays: 30,
    hectares: '100+ ha / multi-sitio',
    summary: 'Para bodegas y grupos con trazabilidad, cosecha y análisis.',
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

  if (diffMs <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function getSubscriptionState(user: SubscriptionUser) {
  const daysSince = getDaysSince(user.created_at);
  const isVIP = Boolean(user.es_vip);
  const fallbackTrialDaysLeft = Math.max(0, 60 - daysSince);
  const trialDaysLeft = getTrialDaysLeft(user.trial_ends_at) || fallbackTrialDaysLeft;
  const isDemoTrialActive = Boolean(user.trial_ends_at) && trialDaysLeft > 0;
  const isWithinTrial = !isVIP && (isDemoTrialActive || daysSince < 60);
  const hasAccess = isVIP || isWithinTrial || user.subscription_status === 'active';

  return {
    daysSince,
    isVIP,
    isWithinTrial,
    hasAccess,
    trialDaysLeft,
    plan: user.plan || 'starter',
    isDemoTrialActive,
  };
}

export function getPlanMeta(plan?: PlanKey) {
  return PLAN_DEFINITIONS[plan || 'starter'];
}

export function createDemoTrialUser(plan: PlanKey = 'pro'): SubscriptionUser {
  const planMeta = getPlanMeta(plan);
  const trialEndsAt = new Date(Date.now() + planMeta.trialDays * 24 * 60 * 60 * 1000).toISOString();

  return {
    created_at: new Date().toISOString(),
    trial_ends_at: trialEndsAt,
    plan,
    subscription_status: 'inactive',
    es_vip: false,
  };
}

export function saveDemoTrial(plan: PlanKey) {
  const user = createDemoTrialUser(plan);
  if (typeof window !== 'undefined') {
    localStorage.setItem('viticampo-user', JSON.stringify(user));
  }
  return user;
}
