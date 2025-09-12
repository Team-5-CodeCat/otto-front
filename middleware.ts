import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 보호된 경로 목록
const protectedPaths = [
  '/projects',
  '/pipelines',
  '/builds',
  '/settings',
  '/dashboard',
];

// 공개 경로 목록 (로그인한 사용자는 접근 불가)
const publicOnlyPaths = [
  '/signin',
  '/signup',
];

// 인증 체크가 필요 없는 경로
const _publicPaths = [
  '/',
  '/callback',
  '/api',
  '/_next',
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 정적 파일이나 API 경로는 건너뛰기
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // 파일 확장자가 있는 경로
  ) {
    return NextResponse.next();
  }

  // 쿠키에서 인증 토큰 확인 (서버 사이드)
  const token = request.cookies.get('accessToken')?.value || 
                request.cookies.get('access_token')?.value ||
                request.cookies.get('auth_token')?.value;
  
  const isAuthenticated = !!token;

  // 보호된 경로 체크
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  // 공개 전용 경로 체크 (로그인 페이지 등)
  const isPublicOnlyPath = publicOnlyPaths.some(path => pathname.startsWith(path));

  // 보호된 경로인데 인증되지 않은 경우
  if (isProtectedPath && !isAuthenticated) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // 공개 전용 경로인데 이미 인증된 경우
  if (isPublicOnlyPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/projects', request.url));
  }

  return NextResponse.next();
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};