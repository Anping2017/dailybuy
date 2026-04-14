'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const onboardingComplete = useAppStore(s => s.onboardingComplete);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (onboardingComplete) {
      router.replace('/dashboard');
    } else {
      router.replace('/onboarding');
    }
  }, [mounted, onboardingComplete, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary mb-2">DailyBuy</h1>
        <p className="text-sm text-muted">智能买菜规划助手</p>
      </div>
    </div>
  );
}
