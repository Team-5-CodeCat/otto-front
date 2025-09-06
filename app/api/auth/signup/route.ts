import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4004';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 직접 fetch를 사용하여 백엔드 API 호출
    const response = await fetch(`${API_BASE_URL}/api/v1/sign_up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(JSON.stringify({
        message: errorData.message || '회원가입에 실패했습니다.',
        statusCode: response.status,
        error: 'Internal Server Error'
      }));
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('회원가입 API 오류:', error);
    
    const errorMessage = error instanceof Error ? error.message : '회원가입에 실패했습니다.';
    const statusCode = (error as { status?: number })?.status || 500;
    
    return NextResponse.json(
      { 
        message: errorMessage,
        error: 'Internal Server Error' 
      },
      { status: statusCode }
    );
  }
}
