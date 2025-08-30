package com.groom.MAPro.exception;

public enum ErrorCode {
    // 인증 관련 에러
    INVALID_CREDENTIALS("AUTH001", "이메일 또는 비밀번호가 올바르지 않습니다."),
    USER_NOT_FOUND("AUTH002", "존재하지 않는 사용자입니다."),
    USER_ALREADY_EXISTS("AUTH003", "이미 가입된 이메일입니다."),
    INVALID_TOKEN("AUTH004", "유효하지 않은 토큰입니다."),
    TOKEN_EXPIRED("AUTH005", "만료된 토큰입니다."),
    
    // 유효성 검사 에러
    INVALID_EMAIL_FORMAT("VALID001", "유효한 이메일 형식이 아닙니다."),
    INVALID_PASSWORD_LENGTH("VALID002", "비밀번호는 6~20자 사이여야 합니다."),
    INVALID_NAME_LENGTH("VALID003", "이름은 2~50자 사이여야 합니다."),
    REQUIRED_FIELD_MISSING("VALID004", "필수 입력값이 누락되었습니다."),
    
    // 서버 에러
    INTERNAL_SERVER_ERROR("SERVER001", "서버 내부 오류가 발생했습니다."),
    DATABASE_ERROR("SERVER002", "데이터베이스 오류가 발생했습니다."),
    EXTERNAL_API_ERROR("SERVER003", "외부 API 호출 중 오류가 발생했습니다.");

    private final String code;
    private final String message;

    ErrorCode(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public String getCode() { return code; }
    public String getMessage() { return message; }
}