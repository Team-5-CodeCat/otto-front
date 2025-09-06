// 백엔드 API와 연동하는 인증 관련 API 함수들
// @Team-5-CodeCat/otto-sdk 사용

// API 기본 설정 (사용하지 않음 - SDK에서 처리)
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4004';

// SDK에서 제공하는 타입들을 재사용
export { authApi } from './auth-sdk';
export type { LoginRequest, SignUpRequest, LoginResponse, SignUpResponse } from './auth-sdk';

// API 응답 타입 정의
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// 사용자 정보 타입
export interface User {
    userID: string;
    email: string;
    name: string;
    memberRole: 'ADMIN' | 'MEMBER' | 'VIEWER';
    createdAt: string;
    updatedAt: string;
}

// API 에러 타입
export interface ApiErrorInterface {
    message: string;
    status: number | undefined;
}

// SDK를 사용하므로 auth-sdk에서 모든 함수를 가져옴
// 추가적인 유틸리티 함수들만 여기에 정의

// 쿠키는 백엔드에서 HttpOnly로 자동 관리되므로
// 프론트엔드에서는 쿠키를 직접 건드리지 않음

// API 에러 클래스
export class ApiError extends Error implements ApiErrorInterface {
    public status: number | undefined;

    constructor(message: string, status?: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// authApi는 위에서 export됨
export { authApi as default } from './auth-sdk';
