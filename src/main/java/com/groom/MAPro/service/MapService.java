package com.groom.MAPro.service;

import com.google.cloud.secretmanager.v1.AccessSecretVersionResponse;
import com.google.cloud.secretmanager.v1.SecretManagerServiceClient;
import com.google.cloud.secretmanager.v1.SecretVersionName;
import com.groom.MAPro.dto.MapResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MapService {
    
    @Value("${spring.cloud.gcp.project-id}")
    private String projectId;

    private String getGoogleMapsApiKey() {
        try {
            // Secret Manager 클라이언트 생성
            SecretManagerServiceClient client = SecretManagerServiceClient.create();
            
            // Secret 버전 이름 생성
            SecretVersionName secretVersionName = SecretVersionName.of(
                projectId, 
                "GOOGLE_MAPS_API_KEY", 
                "latest"
            );
            
            // Secret 값 가져오기
            AccessSecretVersionResponse response = client.accessSecretVersion(secretVersionName);
            String secretValue = response.getPayload().getData().toStringUtf8();
            
            client.close();
            
            System.out.println("✅ Secret Manager에서 API 키 가져오기 성공!");
            System.out.println("🔍 API 키 길이: " + secretValue.length());
            System.out.println("🔍 API 키 시작: " + secretValue.substring(0, Math.min(10, secretValue.length())) + "...");
            
            return secretValue;
            
        } catch (Exception e) {
            System.err.println("❌ Secret Manager 접근 실패: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    public MapResponse getInitialMapData() {
        try {
            System.out.println("=== Secret Manager 수동 접근 시작 ===");
            System.out.println("🔍 Project ID: " + projectId);
            
            String googleMapsApiKey = getGoogleMapsApiKey();
            
            if (googleMapsApiKey == null || !googleMapsApiKey.startsWith("AIza")) {
                throw new RuntimeException("유효하지 않은 API 키: " + googleMapsApiKey);
            }
            
            System.out.println("✅ 유효한 API 키 확인됨");
            System.out.println("=================");
            
            String mapHtml = generateMapHtml(37.5665, 126.9780, "서울시청", googleMapsApiKey);
            
            MapResponse response = new MapResponse();
            response.setLocation("서울시청");
            response.setLatitude(37.5665);
            response.setLongitude(126.9780);
            response.setStatus("success");
            response.setMapHtml(mapHtml);
            
            return response;
            
        } catch (Exception e) {
            System.err.println("❌ Map 서비스 오류: " + e.getMessage());
            e.printStackTrace();
            
            MapResponse errorResponse = new MapResponse();
            errorResponse.setStatus("error");
            errorResponse.setLocation("서비스 오류: " + e.getClass().getSimpleName());
            errorResponse.setLatitude(0.0);
            errorResponse.setLongitude(0.0);
            errorResponse.setMapHtml("<div style='padding:20px;text-align:center;'>지도를 불러올 수 없습니다: " + e.getMessage() + "</div>");
            
            return errorResponse;
        }
    }

    private String generateMapHtml(double lat, double lng, String title, String apiKey) {
        return String.format("""
            <div id="map" style="width: 100%%; height: 400px;"></div>
            <script>
                function initMap() {
                    const location = { lat: %f, lng: %f };
                    const map = new google.maps.Map(document.getElementById("map"), {
                        zoom: 15,
                        center: location,
                        mapTypeId: 'roadmap'
                    });
                    
                    const marker = new google.maps.Marker({
                        position: location,
                        map: map,
                        title: '%s'
                    });
                    
                    const infoWindow = new google.maps.InfoWindow({
                        content: '<div><h3>%s</h3><p>안전하게 백엔드에서 로드된 지도입니다!</p></div>'
                    });
                    
                    marker.addListener('click', () => {
                        infoWindow.open(map, marker);
                    });
                }
            </script>
            <script async defer 
                src="https://maps.googleapis.com/maps/api/js?key=%s&callback=initMap">
            </script>
            """, lat, lng, title, title, apiKey);
    }
}