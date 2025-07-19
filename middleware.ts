// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 中间件函数，用于处理请求。
 * 主要职责是根据请求路径进行身份验证，并执行重定向。
 *
 * @param request - 传入的 NextRequest 对象，包含当前请求的所有信息。
 * @returns NextResponse.redirect 用于重定向，或 NextResponse.next() 允许请求继续。
 */
export function middleware(request: NextRequest) {
  // 获取当前请求的路径
  const path = request.nextUrl.pathname;

  // 判断当前路径是否是 /admin 或其任何子路径
  const isAdminPath = path.startsWith('/admin') || path === '/admin';

  // 如果请求的是管理后台路径
  if (isAdminPath) {
    // 尝试从请求的 cookies 中获取名为 'admin-auth' 的认证 cookie
    const authCookie = request.cookies.get('admin-auth')?.value;

    // 如果认证 cookie 不存在 (用户未登录)
    if (!authCookie) {
      // 记录一个重定向日志 (可以根据需要保留或删除此日志，在生产环境中通常会被监控系统取代)
      // console.log('未找到认证 cookie，重定向到登录页:', request.url);

      // 将用户重定向到登录页面
      // 使用 new URL() 确保生成完整的绝对 URL
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
    // 如果认证 cookie 存在，请求将继续执行，中间件不做拦截
  }

  // 对于非管理后台路径，或已认证的管理后台请求，允许请求继续
  return NextResponse.next();
}

/**
 * 中间件的配置对象。
 * 'matcher' 定义了中间件应该应用于哪些请求路径。
 *
 * '/admin/:path*' 会匹配所有以 /admin/ 开头的路径 (例如 /admin/dashboard, /admin/blog)。
 * '/admin' 会单独匹配 /admin 根路径。
 */
export const config = {
  matcher: ['/admin/:path*', '/admin'],
};
