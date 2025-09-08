// JWT 토큰 관련 유틸리티 함수들

// JWT Payload 타입 정의 (백엔드 명세에 맞춤)
export interface JWTPayload {
    sub: string;        // 사용자 ID (userID)
    email: string;      // 사용자 이메일
    type: 'access';     // 토큰 타입
    iat: number;        // 발급 시간
    exp: number;        // 만료 시간
}

// 사용자 정보 타입
export interface UserInfo {
    userID: string;
    email: string;
}

/**
 * JWT 토큰을 디코딩하는 함수
 * @param token JWT 토큰 문자열
 * @returns 디코딩된 페이로드 또는 null
 */
export const decodeJWT = (token: string): JWTPayload | null => {
    try {
        // JWT는 3부분으로 구성: header.payload.signature
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid JWT format');
        }

        // Base64URL 디코딩
        const base64Url = parts[1];
        if (!base64Url) {
            throw new Error('Invalid JWT payload');
        }
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // 패딩 추가
        const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4);

        // Base64 디코딩
        const jsonPayload = decodeURIComponent(
            atob(paddedBase64)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        const payload = JSON.parse(jsonPayload) as JWTPayload;

        // 토큰 타입 확인
        if (payload.type !== 'access') {
            throw new Error('Invalid token type');
        }

        return payload;
    } catch (error) {
        console.error('JWT 디코딩 실패:', error);
        return null;
    }
};

/**
 * JWT 토큰에서 사용자 정보를 추출하는 함수
 * @param token JWT 액세스 토큰
 * @returns 사용자 정보 또는 null
 */
export const getUserFromToken = (token: string): UserInfo | null => {
    const payload = decodeJWT(token);
    if (payload && payload.type === 'access') {
        return {
            userID: payload.sub,
            email: payload.email
        };
    }
    return null;
};

/**
 * JWT 토큰이 만료되었는지 확인하는 함수
 * @param token JWT 토큰
 * @returns 만료 여부
 */
export const isTokenExpired = (token: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload) return true;

    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
};

/**
 * JWT 토큰이 곧 만료될지 확인하는 함수 (5분 이내)
 * @param token JWT 토큰
 * @returns 곧 만료될지 여부
 */
export const isTokenExpiringSoon = (token: string): boolean => {
    const payload = decodeJWT(token);
    if (!payload) return true;

    const now = Math.floor(Date.now() / 1000);
    const fiveMinutes = 5 * 60; // 5분
    return payload.exp < (now + fiveMinutes);
};

/**
 * JWT 토큰의 남은 시간을 초 단위로 반환하는 함수
 * @param token JWT 토큰
 * @returns 남은 시간 (초) 또는 0
 */
export const getTokenTimeRemaining = (token: string): number => {
    const payload = decodeJWT(token);
    if (!payload) return 0;

    const now = Math.floor(Date.now() / 1000);
    const remaining = payload.exp - now;
    return Math.max(0, remaining);
};
