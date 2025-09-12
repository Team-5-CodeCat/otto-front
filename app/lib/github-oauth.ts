'use client';

// GitHub OAuth 상수
export const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID || '';
export const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';

// OAuth 상태 관리
export function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// 상태값을 세션 스토리지에 저장
export function saveOAuthState(state: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('github_oauth_state', state);
  }
}

// 상태값을 세션 스토리지에서 확인
export function verifyOAuthState(state: string): boolean {
  if (typeof window === 'undefined') return false;

  const savedState = sessionStorage.getItem('github_oauth_state');
  sessionStorage.removeItem('github_oauth_state'); // 사용 후 삭제

  return savedState === state;
}

// GitHub OAuth URL 생성
export function createGitHubOAuthUrl(): string {
  const state = generateRandomState();
  saveOAuthState(state);

  const redirectUri = `${window.location.origin}/callback`;

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'user:email',
    state: state,
  });

  return `${GITHUB_OAUTH_URL}?${params.toString()}`;
}

// GitHub OAuth 리다이렉트 실행
export function redirectToGitHub(): void {
  if (typeof window !== 'undefined') {
    const authUrl = createGitHubOAuthUrl();
    window.location.href = authUrl;
  }
}

// OAuth 콜백에서 code와 state 파라미터 추출
export function extractOAuthParams(): { code: string | null; state: string | null } {
  if (typeof window === 'undefined') {
    return { code: null, state: null };
  }

  const urlParams = new URLSearchParams(window.location.search);
  return {
    code: urlParams.get('code'),
    state: urlParams.get('state'),
  };
}

// GitHub API - 액세스 토큰 교환 (otto-sdk 사용)
export async function exchangeCodeForToken(
  code: string,
  state: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  message: string;
}> {
  const { authGithubSignIn } = await import('@cooodecat/otto-sdk/lib/functional/auth/github');
  const makeFetch = (await import('@/app/lib/make-fetch')).default;

  const response = await authGithubSignIn(makeFetch(), {
    code,
    state,
  });

  return response;
}

// 통합 GitHub 로그인 플로우
export async function handleGitHubCallback(): Promise<{
  success: boolean;
  error?: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresIn: number;
    refreshTokenExpiresIn: number;
    message: string;
  };
}> {
  try {
    const { code, state } = extractOAuthParams();

    if (!code) {
      return { success: false, error: 'Authorization code not found' };
    }

    if (!state || !verifyOAuthState(state)) {
      return { success: false, error: 'Invalid state parameter' };
    }

    const tokens = await exchangeCodeForToken(code, state);

    return { success: true, tokens };
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'OAuth callback failed',
    };
  }
}
