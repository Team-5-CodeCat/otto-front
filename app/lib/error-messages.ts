/**
 * 에러 메시지 매핑 유틸리티
 * HTTP 상태 코드와 에러 타입에 따른 사용자 친화적 메시지 제공
 */

export interface ErrorInfo {
  message: string;
  suggestion?: string;
  retryable: boolean;
}

/**
 * HTTP 에러를 사용자 친화적 메시지로 변환
 */
export function mapErrorToUserMessage(error: unknown): ErrorInfo {
  // 기본 에러 정보
  const defaultError: ErrorInfo = {
    message: '일시적인 오류가 발생했습니다.',
    suggestion: '잠시 후 다시 시도해주세요.',
    retryable: true,
  };

  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // 404 에러 - 엔드포인트를 찾을 수 없음
    if (errorMessage.includes('404') || errorMessage.includes('not found')) {
      return {
        message: '서버에 연결할 수 없습니다.',
        suggestion: '서비스가 일시적으로 중단되었을 수 있습니다. 잠시 후 다시 시도해주세요.',
        retryable: true,
      };
    }

    // 401 에러 - 인증 실패
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
      return {
        message: '이메일 또는 비밀번호가 올바르지 않습니다.',
        suggestion: '입력하신 정보를 다시 확인해주세요.',
        retryable: false,
      };
    }

    // 400 에러 - 잘못된 요청
    if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
      return {
        message: '입력하신 정보가 올바르지 않습니다.',
        suggestion: '이메일과 비밀번호를 다시 확인해주세요.',
        retryable: false,
      };
    }

    // 403 에러 - 접근 금지
    if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
      return {
        message: '접근이 제한된 계정입니다.',
        suggestion: '관리자에게 문의해주세요.',
        retryable: false,
      };
    }

    // 409 에러 - 리소스 충돌 (중복 가입 등)
    if (errorMessage.includes('409') || errorMessage.includes('conflict')) {
      return {
        message: '이미 가입된 이메일입니다.',
        suggestion: '로그인하거나 다른 이메일로 시도해주세요.',
        retryable: false,
      };
    }

    // 422 에러 - 유효성 검증 실패
    if (errorMessage.includes('422') || errorMessage.includes('unprocessable')) {
      return {
        message: '입력하신 정보가 조건에 맞지 않습니다.',
        suggestion: '이메일 형식과 비밀번호 조건을 확인해주세요.',
        retryable: false,
      };
    }

    // 429 에러 - 너무 많은 요청
    if (errorMessage.includes('429') || errorMessage.includes('too many')) {
      return {
        message: '너무 많은 시도가 감지되었습니다.',
        suggestion: '잠시 후 다시 시도해주세요.',
        retryable: true,
      };
    }

    // 500, 502, 503, 504 에러 - 서버 에러
    if (
      errorMessage.includes('500') ||
      errorMessage.includes('502') ||
      errorMessage.includes('503') ||
      errorMessage.includes('504') ||
      errorMessage.includes('internal server') ||
      errorMessage.includes('bad gateway') ||
      errorMessage.includes('service unavailable') ||
      errorMessage.includes('gateway timeout')
    ) {
      return {
        message: '서버에 일시적인 문제가 발생했습니다.',
        suggestion: '잠시 후 다시 시도하거나 문제가 지속되면 고객센터에 문의해주세요.',
        retryable: true,
      };
    }

    // 네트워크 에러
    if (
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('network') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('connection')
    ) {
      return {
        message: '네트워크 연결을 확인할 수 없습니다.',
        suggestion: '인터넷 연결을 확인하고 다시 시도해주세요.',
        retryable: true,
      };
    }

    // CORS 에러
    if (errorMessage.includes('cors')) {
      return {
        message: '서버 연결에 실패했습니다.',
        suggestion: '페이지를 새로고침하고 다시 시도해주세요.',
        retryable: true,
      };
    }

    // 계정 관련 에러 메시지
    if (errorMessage.includes('account')) {
      if (errorMessage.includes('locked') || errorMessage.includes('suspended')) {
        return {
          message: '계정이 일시적으로 잠겼습니다.',
          suggestion: '고객센터에 문의하거나 비밀번호를 재설정해주세요.',
          retryable: false,
        };
      }
      if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
        return {
          message: '등록되지 않은 이메일입니다.',
          suggestion: '이메일을 확인하거나 회원가입을 진행해주세요.',
          retryable: false,
        };
      }
    }

    // 비밀번호 관련 에러
    if (errorMessage.includes('password')) {
      if (errorMessage.includes('incorrect') || errorMessage.includes('wrong')) {
        return {
          message: '비밀번호가 일치하지 않습니다.',
          suggestion: '비밀번호를 다시 확인해주세요.',
          retryable: false,
        };
      }
      if (errorMessage.includes('expired')) {
        return {
          message: '비밀번호가 만료되었습니다.',
          suggestion: '비밀번호를 재설정해주세요.',
          retryable: false,
        };
      }
    }

    // 세션/토큰 관련 에러
    if (errorMessage.includes('session') || errorMessage.includes('token')) {
      if (errorMessage.includes('expired')) {
        return {
          message: '세션이 만료되었습니다.',
          suggestion: '다시 로그인해주세요.',
          retryable: false,
        };
      }
      if (errorMessage.includes('invalid')) {
        return {
          message: '인증 정보가 올바르지 않습니다.',
          suggestion: '다시 로그인해주세요.',
          retryable: false,
        };
      }
    }

    // JSON 파싱 에러
    if (errorMessage.includes('json') || errorMessage.includes('unexpected token')) {
      return {
        message: '서버 응답을 처리할 수 없습니다.',
        suggestion: '잠시 후 다시 시도해주세요.',
        retryable: true,
      };
    }
  }

  return defaultError;
}

/**
 * 에러 메시지에서 HTTP 상태 코드 추출
 */
export function extractStatusCode(error: Error): number | null {
  const message = error.message;

  // 정규식으로 3자리 숫자 찾기 (HTTP 상태 코드)
  const statusCodeMatch = message.match(/\b[4-5]\d{2}\b/);

  if (statusCodeMatch) {
    return parseInt(statusCodeMatch[0], 10);
  }

  return null;
}

/**
 * 재시도 가능한 에러인지 확인
 */
export function isRetryableError(error: unknown): boolean {
  const errorInfo = mapErrorToUserMessage(error);
  return errorInfo.retryable;
}
