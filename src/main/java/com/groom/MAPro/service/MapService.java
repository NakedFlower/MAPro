// service/MapService.java
package com.groom.MAPro.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.groom.MAPro.dto.MapResponse;

@Service
public class MapService {

    // Spring Cloud GCP가 자동으로 시크릿 매니저에서 값을 가져옴
    @Value("${sm://GOOGLE_MAPS_API_KEY}")
    private String googleMapsApiKey;

    public MapResponse getInitialMapData() {
        try {
            System.out.println("✅ Map Service 호출됨");
            
            // API 키가 정상적으로 로드되었는지 확인 (보안상 일부만 표시)
            if (googleMapsApiKey != null && !googleMapsApiKey.isEmpty()) {
                System.out.println("✅ API Key 로드 성공: " + googleMapsApiKey.substring(0, Math.min(10, googleMapsApiKey.length())) + "...");
            } else {
                System.err.println("❌ API Key가 비어있습니다");
            }
            
            MapResponse response = new MapResponse();
            response.setLocation("서울시청");
            response.setLatitude(37.5665);
            response.setLongitude(126.9780);
            response.setStatus("success");
            
            return response;
            
        } catch (Exception e) {
            System.err.println("❌ Map 서비스 오류: " + e.getMessage());
            
            MapResponse errorResponse = new MapResponse();
            errorResponse.setStatus("error");
            errorResponse.setLocation("API 키 로드 실패: " + e.getMessage());
            errorResponse.setLatitude(0.0);
            errorResponse.setLongitude(0.0);
            
            return errorResponse;
        }
    }

    public String getApiKey() {
        return googleMapsApiKey;
    }
}