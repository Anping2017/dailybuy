/**
 * Next.js middleware: 管理员 API 鉴权 + 简易内存 rate limit
 *
 * 鉴权: /api/admin/* 要求 X-Admin-Token 或 Authorization: Bearer <token>
 *       token 由环境变量 ADMIN_TOKEN 配置 (未配置则拒绝所有 admin 请求)
 *
 * Rate limit: /api/generate-plan 10 req / min / IP
 *             /api/search 20 req / min / IP
 *             /api/admin/* 60 req / min / IP
 */
import { NextRequest, NextResponse } from 'next/server';

// 内存 rate limit (简易版; 生产推荐 Redis/Upstash)
//   Vercel serverless 函数内存不持久, 每个 lambda instance 各自计数
//   足以拦截同一客户端大部分洪水; 真正 DDoS 应在边缘做
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOWS = {
  '/api/generate-plan': { max: 10, windowMs: 60 * 1000 },
  '/api/search': { max: 20, windowMs: 60 * 1000 },
  '/api/admin': { max: 60, windowMs: 60 * 1000 },
} as const;

function checkRateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);
  if (!record || record.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= max) return false;
  record.count++;
  return true;
}

function getClientIp(req: NextRequest): string {
  // Vercel 经常设 x-forwarded-for: 优先使用第一个 IP
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // ==== Rate Limit ====
  let limitConfig: { max: number; windowMs: number } | null = null;
  if (url === '/api/generate-plan') limitConfig = RATE_WINDOWS['/api/generate-plan'];
  else if (url === '/api/search') limitConfig = RATE_WINDOWS['/api/search'];
  else if (url.startsWith('/api/admin')) limitConfig = RATE_WINDOWS['/api/admin'];

  if (limitConfig) {
    const ip = getClientIp(req);
    const key = `${url}:${ip}`;
    if (!checkRateLimit(key, limitConfig.max, limitConfig.windowMs)) {
      return NextResponse.json(
        { error: 'Too many requests', retryAfterSec: Math.ceil(limitConfig.windowMs / 1000) },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(limitConfig.windowMs / 1000)) } }
      );
    }
  }

  // ==== Admin 鉴权 ====
  if (url.startsWith('/api/admin')) {
    const adminToken = process.env.ADMIN_TOKEN;
    // 未配置 token → 只在开发环境允许, 生产拒绝
    if (!adminToken) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { error: 'Admin API disabled: ADMIN_TOKEN not configured' },
          { status: 503 }
        );
      }
      // 开发环境允许通过, 但打警告
      console.warn('[middleware] ADMIN_TOKEN 未设置, 开发环境允许通过');
      return NextResponse.next();
    }

    // 校验 token
    const headerToken = req.headers.get('x-admin-token');
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const provided = headerToken || bearerToken;

    if (provided !== adminToken) {
      return NextResponse.json(
        { error: 'Unauthorized: valid X-Admin-Token required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*',
    '/api/generate-plan',
    '/api/search',
  ],
};
