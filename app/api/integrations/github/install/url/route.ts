import { NextRequest, NextResponse } from 'next/server';

const getApiBaseUrl = (): string => {
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://host.docker.internal:4000';
};

const getAuthToken = (request: NextRequest): string => {
    return request.headers.get('authorization')?.replace('Bearer ', '') || '';
};

export async function GET(request: NextRequest) {
    try {
        const token = getAuthToken(request);
        
        const response = await fetch(`${getApiBaseUrl()}/integrations/github/install/url`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        });

        if (!response.ok) {
            throw new Error(`백엔드 API 오류: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.warn('백엔드 API 사용 불가, 직접 GitHub 앱 설치 URL 생성:', error);
        
        const githubAppName = process.env.NEXT_PUBLIC_GITHUB_APP_NAME || 'otto-test-1';
        return NextResponse.json({
            installUrl: `https://github.com/apps/${githubAppName}/installations/new`,
            callbackUrl: `${getApiBaseUrl()}/integrations/github/install/callback`
        });
    }
}