'use client';

import { ProductDashboard } from '@/components/ProductDashboard';
import { SubscriptionGate } from '@/components/SubscriptionGate';

export default function DashboardPage() {
  return (
    <SubscriptionGate>
      <ProductDashboard />
    </SubscriptionGate>
  );
}
