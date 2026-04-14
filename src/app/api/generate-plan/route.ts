import { NextRequest, NextResponse } from 'next/server';
import type { UserProfile } from '@/types';
import { generateAIPlan } from '@/lib/ai/recipe-ai';

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json() as { profile: UserProfile };

    if (!profile) {
      return NextResponse.json({ error: 'Missing profile' }, { status: 400 });
    }

    const plan = await generateAIPlan(profile);
    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Generate plan error:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
