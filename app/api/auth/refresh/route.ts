import { NextRequest, NextResponse } from 'next/server';
import { authSignInByRefresh } from '@Team-5-CodeCat/otto-sdk/lib/functional/sign_in/refresh';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4004';

export async function POST(_request: NextRequest) {
  try {
    // SDK를 사용하여 백엔드 API 호출
    const response = await authSignInByRefresh({
      host: `${API_BASE_URL}/api/v1`,
      headers: {
        'Content-Type': 'application/json',
      },
      options: {
        credentials: 'include', // 쿠키 포함
      },
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('토큰 갱신 API 오류:', error);
    
    // SDK 에러인 경우 원본 메시지 사용
    let errorMessage = '토큰 갱신에 실패했습니다.';
    let statusCode = 500;
    
    if (error instanceof Error) {
      try {
        // SDK 에러는 JSON 형태의 메시지를 가질 수 있음
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.message || error.message;
        statusCode = errorData.statusCode || 500;
      } catch {
        // JSON 파싱 실패 시 원본 메시지 사용
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        message: errorMessage,
        error: 'Unauthorized' 
      },
      { status: statusCode }
    );
  }
}
