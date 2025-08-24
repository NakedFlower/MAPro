package com.groom.MAPro.exception;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.groom.MAPro.dto.ApiResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleApiException(ApiException e) {
        ErrorCode errorCode = e.getErrorCode();
        
        // 에러 타입에 따른 HTTP 상태 코드 결정
        HttpStatus status = determineHttpStatus(errorCode);
        
        // 알람 발송 (필요한 경우)
        sendAlert(errorCode, e.getDetails());
        
        return ResponseEntity.status(status)
                .body(ApiResponse.error(errorCode.getMessage(), errorCode.getCode()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException e) {
        Map<String, String> errors = new HashMap<>();
        
        e.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        sendAlert(ErrorCode.REQUIRED_FIELD_MISSING, errors.toString());
        
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("입력값이 올바르지 않습니다.", "VALID000", errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGeneralException(Exception e) {
        sendAlert(ErrorCode.INTERNAL_SERVER_ERROR, e.getMessage());
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(ErrorCode.INTERNAL_SERVER_ERROR.getMessage(), 
                                      ErrorCode.INTERNAL_SERVER_ERROR.getCode()));
    }

    private HttpStatus determineHttpStatus(ErrorCode errorCode) {
        switch (errorCode.getCode().substring(0, 3)) {
            case "AUT": return HttpStatus.UNAUTHORIZED;
            case "VAL": return HttpStatus.BAD_REQUEST;
            case "SER": return HttpStatus.INTERNAL_SERVER_ERROR;
            default: return HttpStatus.BAD_REQUEST;
        }
    }

    private void sendAlert(ErrorCode errorCode, String details) {
        // 알람 발송 로직 (선택사항)
        // 예: 슬랙, 이메일, 로그 등
        System.err.println("🚨 API 예외 발생: " + errorCode.getCode() + " - " + errorCode.getMessage());
        if (details != null) {
            System.err.println("상세 정보: " + details);
        }
    }
}