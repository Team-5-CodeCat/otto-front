// 이메일 검증 함수
export const validateEmail = (email: string): string | null => {
    if (!email) {
        return '이메일을 입력해주세요.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return '올바른 이메일 형식을 입력해주세요.';
    }

    return null;
};

// 비밀번호 검증 함수
export const validatePassword = (password: string): string | null => {
    if (!password) {
        return '비밀번호를 입력해주세요.';
    }

    if (password.length < 6) {
        return '비밀번호는 최소 6자 이상이어야 합니다.';
    }

    return null;
};

// 로그인 폼 전체 검증 함수
export const validateSignInForm = (email: string, password: string): { email?: string; password?: string } => {
    const errors: { email?: string; password?: string } = {};

    const emailError = validateEmail(email);
    if (emailError) {
        errors.email = emailError;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
        errors.password = passwordError;
    }

    return errors;
};
