import { NextRequest, NextResponse } from 'next/server';

// 백엔드 API 기본 URL 가져오기
const getApiBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://host.docker.internal:4000';
};

// JWT 토큰 추출
const getAuthToken = (request: NextRequest): string => {
    return request.headers.get('authorization')?.replace('Bearer ', '') || '';
};

/**
 * 레포지토리 목록 조회 API
 * GET /api/integrations/github/repositories
 * 
 * 사용자가 등록한 GitHub 계정의 모든 레포지토리 목록을 반환합니다.
 */
export async function GET(request: NextRequest) {
    try {
        const token = getAuthToken(request);
        
        if (!token) {
            return NextResponse.json(
                { statusCode: 401, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 백엔드 API로 레포지토리 목록 조회 요청
        const response = await fetch(`${getApiBaseUrl()}/api/integrations/github/repositories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // GitHub 계정 미등록 에러 처리
            if (response.status === 401 && errorData.message?.includes('등록된 GitHub 계정이 없습니다')) {
                return NextResponse.json(
                    { 
                        statusCode: 401, 
                        message: '등록된 GitHub 계정이 없습니다. 먼저 GitHub 계정을 등록해주세요.' 
                    },
                    { status: 401 }
                );
            }
            
            return NextResponse.json(
                { 
                    statusCode: response.status, 
                    message: errorData.message || `레포지토리 목록 조회 실패: ${response.status}` 
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('레포지토리 목록 조회 오류:', error);
        return NextResponse.json(
            { 
                statusCode: 500, 
                message: '레포지토리 목록 조회 중 서버 오류가 발생했습니다.' 
            },
            { status: 500 }
        );
    }
}
