import { NextRequest, NextResponse } from 'next/server';

// 백엔드 API 기본 URL 가져오기
const getApiBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://host.docker.internal:4000';
};

// JWT 토큰 추출
const getAuthToken = (request: NextRequest): string => {
    return request.headers.get('authorization')?.replace('Bearer ', '') || '';
};

// 레포지토리 선택 요청 타입
interface SelectRepositoryRequest {
    projectID: string;
    repoFullName: string;
    installationId: string;
}

/**
 * 레포지토리 선택 API
 * POST /api/integrations/github/repositories/select
 * 
 * 특정 프로젝트에 GitHub 레포지토리를 연결합니다.
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

        const body: SelectRepositoryRequest = await request.json();
        const { projectID, repoFullName, installationId } = body;

        // 필수 필드 검증
        if (!projectID || !repoFullName || !installationId) {
            return NextResponse.json(
                { statusCode: 400, message: 'projectID, repoFullName, installationId가 모두 필요합니다.' },
                { status: 400 }
            );
        }

        // UUID 형식 검증 (간단한 검증)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(projectID)) {
            return NextResponse.json(
                { statusCode: 400, message: 'projectID는 유효한 UUID 형식이어야 합니다.' },
                { status: 400 }
            );
        }

        // repoFullName 형식 검증 (owner/repository)
        if (!repoFullName.includes('/') || repoFullName.split('/').length !== 2) {
            return NextResponse.json(
                { statusCode: 400, message: 'repoFullName은 owner/repository 형식이어야 합니다.' },
                { status: 400 }
            );
        }

        // 백엔드 API로 레포지토리 선택 요청
        const response = await fetch(`${getApiBaseUrl()}/api/integrations/github/repositories/select`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ projectID, repoFullName, installationId }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // 프로젝트 접근 권한 없음 에러 처리
            if (response.status === 404 && errorData.message?.includes('프로젝트를 찾을 수 없거나')) {
                return NextResponse.json(
                    { 
                        statusCode: 404, 
                        message: '프로젝트를 찾을 수 없거나 접근 권한이 없습니다.' 
                    },
                    { status: 404 }
                );
            }
            
            return NextResponse.json(
                { 
                    statusCode: response.status, 
                    message: errorData.message || `레포지토리 선택 실패: ${response.status}` 
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('레포지토리 선택 오류:', error);
        return NextResponse.json(
            { 
                statusCode: 500, 
                message: '레포지토리 선택 중 서버 오류가 발생했습니다.' 
            },
            { status: 500 }
        );
    }
}
