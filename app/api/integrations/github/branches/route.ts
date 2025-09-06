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
 * 브랜치 목록 조회 API
 * GET /api/integrations/github/branches?repo=username/my-repo
 * 
 * 특정 레포지토리의 모든 브랜치 목록을 반환합니다.
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

        // 쿼리 파라미터에서 repo 추출
        const { searchParams } = new URL(request.url);
        const repo = searchParams.get('repo');

        if (!repo) {
            return NextResponse.json(
                { statusCode: 400, message: 'repo 쿼리 파라미터가 필요합니다.' },
                { status: 400 }
            );
        }

        // repoFullName 형식 검증 (owner/repository)
        if (!repo.includes('/') || repo.split('/').length !== 2) {
            return NextResponse.json(
                { statusCode: 400, message: 'repo는 owner/repository 형식이어야 합니다.' },
                { status: 400 }
            );
        }

        // 백엔드 API로 브랜치 목록 조회 요청
        const response = await fetch(`${getApiBaseUrl()}/api/v1/integrations/github/branches?repo=${encodeURIComponent(repo)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // 레포지토리 연결 안됨 에러 처리
            if (response.status === 404 && errorData.message?.includes('레포지토리가 프로젝트에 연결되지 않았습니다')) {
                return NextResponse.json(
                    { 
                        statusCode: 404, 
                        message: '해당 레포지토리가 프로젝트에 연결되지 않았습니다.' 
                    },
                    { status: 404 }
                );
            }
            
            return NextResponse.json(
                { 
                    statusCode: response.status, 
                    message: errorData.message || `브랜치 목록 조회 실패: ${response.status}` 
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('브랜치 목록 조회 오류:', error);
        return NextResponse.json(
            { 
                statusCode: 500, 
                message: '브랜치 목록 조회 중 서버 오류가 발생했습니다.' 
            },
            { status: 500 }
        );
    }
}
