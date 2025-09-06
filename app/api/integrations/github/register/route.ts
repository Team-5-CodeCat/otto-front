import { NextRequest, NextResponse } from 'next/server';

// 백엔드 API 기본 URL 가져오기
const getApiBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://host.docker.internal:4000';
};

// JWT 토큰 추출
const getAuthToken = (request: NextRequest): string => {
    return request.headers.get('authorization')?.replace('Bearer ', '') || '';
};

// GitHub 앱 등록 요청 타입
interface GitHubRegisterRequest {
    installationId: string;
    accessToken: string;
}

/**
 * GitHub 앱 등록 API
 * POST /api/integrations/github/register
 * 
 * GitHub 앱 설치 후 installationId와 accessToken을 받아서
 * 사용자의 GitHub 계정을 등록하고 레포지토리 목록을 반환합니다.
 */
export async function POST(request: NextRequest) {
    try {
        const token = getAuthToken(request);
        
        if (!token) {
            return NextResponse.json(
                { statusCode: 401, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body: GitHubRegisterRequest = await request.json();
        const { installationId, accessToken } = body;

        // 필수 필드 검증
        if (!installationId || !accessToken) {
            return NextResponse.json(
                { statusCode: 400, message: 'installationId와 accessToken이 필요합니다.' },
                { status: 400 }
            );
        }

        // 백엔드 API로 GitHub 앱 등록 요청
        const response = await fetch(`${getApiBaseUrl()}/api/integrations/github/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ installationId, accessToken }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return NextResponse.json(
                { 
                    statusCode: response.status, 
                    message: errorData.message || `GitHub 앱 등록 실패: ${response.status}` 
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('GitHub 앱 등록 오류:', error);
        return NextResponse.json(
            { 
                statusCode: 500, 
                message: 'GitHub 앱 등록 중 서버 오류가 발생했습니다.' 
            },
            { status: 500 }
        );
    }
}
