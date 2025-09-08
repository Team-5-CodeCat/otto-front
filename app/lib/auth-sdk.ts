/**
 * 세션 기반 인증 SDK 클라이언트
 * @nestia/fetcher의 IConnection.options.credentials 사용
 */

import { functional, type IConnection } from '@Team-5-CodeCat/otto-sdk';
import type { LoginRequestDto } from '@Team-5-CodeCat/otto-sdk/lib/structures/LoginRequestDto';
import type { SignUpRequestDto } from '@Team-5-CodeCat/otto-sdk/lib/structures/SignUpRequestDto';
import type { LoginResponseDto } from '@Team-5-CodeCat/otto-sdk/lib/structures/LoginResponseDto';
import type { SignUpResponseDto } from '@Team-5-CodeCat/otto-sdk/lib/structures/SignUpResponseDto';

// 로그인 요청 타입 (프론트엔드용)
export type LoginRequest = {
    email: string;
    password: string;
};

// 회원가입 요청 타입 (프론트엔드용)
export type SignUpRequest = {
    email: string;
    password: string;
    username: string;
};

// 인증 응답 타입 (프론트엔드용 - 세션 기반)
export type AuthResponse = {
    message: string;
    // 세션 기반이므로 토큰 정보는 필요 없음
};

// 회원가입 응답 타입 (프론트엔드용)
export type SignUpResponse = {
    message: string;
};

// 세션 기반 SDK 연결 설정
function createSessionConnection(): IConnection {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
    return {
        host: `${baseUrl}/api/v1`, // /api/v1 프리픽스 추가
        headers: {
            'Content-Type': 'application/json',
        },
        // 세션 쿠키 포함을 위한 설정
        options: {
            credentials: 'include',
        },
    };
}

/**
 * 로그인 (세션 기반 SDK)
 */
export async function signIn(credentials: LoginRequest): Promise<AuthResponse> {
    const connection = createSessionConnection();

    try {
        const response = await functional.auth.sign_in.authSignIn(connection, {
            email: credentials.email,
            password: credentials.password,
        });

        return {
            message: response.message || '로그인 성공',
        };
    } catch (error) {
        console.error('로그인 실패:', error);
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * 회원가입 (세션 기반 SDK)
 */
export async function signUp(userData: SignUpRequest): Promise<SignUpResponse> {
    const connection = createSessionConnection();

    try {
        const response = await functional.auth.sign_up.authSignUp(connection, {
            email: userData.email,
            password: userData.password,
            username: userData.username,
        });

        return {
            message: response.message || '회원가입 성공',
        };
    } catch (error) {
        console.error('회원가입 실패:', error);
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * 로그아웃 (세션 기반 SDK)
 */
export async function signOut(): Promise<void> {
    const connection = createSessionConnection();

    try {
        await functional.auth.sign_out.authSignOut(connection);
        // httpOnly 쿠키는 백엔드에서 자동으로 제거됨
    } catch (error) {
        console.error('로그아웃 실패:', error);
        throw new Error(getAuthErrorMessage(error));
    }
}

/**
 * 세션 상태 확인 (세션 기반 SDK)
 */
export async function validateSession(): Promise<boolean> {
    const connection = createSessionConnection();

    try {
        // 세션 기반이므로 리프레시 API로 세션 유효성 확인
        await functional.auth.sign_in.refresh.authSignInByRefresh(connection);
        return true;
    } catch (error) {
        console.warn('세션 검증 실패:', error);
        return false;
    }
}

/**
 * 에러 메시지 변환
 */
function getAuthErrorMessage(error: unknown): string {
    if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as { message: string }).message;

        // HTTP 상태 코드별 메시지
        if (message.includes('401')) {
            return '이메일 또는 비밀번호가 올바르지 않습니다.';
        }
        if (message.includes('409')) {
            return '이미 사용 중인 이메일입니다.';
        }
        if (message.includes('400')) {
            return '입력한 정보를 확인해주세요.';
        }
        if (message.includes('500')) {
            return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        }

        return message;
    }

    return '알 수 없는 오류가 발생했습니다.';
}

/**
 * 세션 기반 SDK 연결 생성 (다른 곳에서 사용할 수 있도록 export)
 */
export function createAuthenticatedConnection(): IConnection {
    return createSessionConnection();
}