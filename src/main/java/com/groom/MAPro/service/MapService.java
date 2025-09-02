package com.groom.MAPro.service;

import com.groom.MAPro.dto.MapResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MapService {

    // 올바른 Secret Manager 접근 방식
    @Value("${sm://GOOGLE_MAPS_API_KEY}")
    private String googleMapsApiKey;
    
    @Value("${spring.cloud.gcp.project-id}")
    private String projectId;

    public MapResponse getInitialMapData() {
        try {
            System.out.println("=== 상세 디버깅 ===");
            System.out.println("🔍 Project ID: " + projectId);
            System.out.println("🔍 Raw googleMapsApiKey length: " + (googleMapsApiKey != null ? googleMapsApiKey.length() : "null"));
            
            // API 키가 올바른지 확인 (AIza로 시작하는지)
            if (googleMapsApiKey != null && googleMapsApiKey.startsWith("AIza")) {
                System.out.println("✅ API 키가 올바른 형식입니다: " + googleMapsApiKey.substring(0, 10) + "...");
            } else {
                System.out.println("❌ API 키 형식이 잘못되었습니다: " + googleMapsApiKey);
            }
            
            System.out.println("=================");
            
            // API 키 유효성 검사
            if (googleMapsApiKey == null || googleMapsApiKey.contains("projects/")) {
                throw new RuntimeException("Secret Manager에서 API 키를 제대로 가져오지 못했습니다");
            }
            
            String mapHtml = generateMapHtml(37.5665, 126.9780, "서울시청");
            
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
            errorResponse.setMapHtml("<div style='padding:20px;text-align:center;'>지도를 불러올 수 없습니다.</div>");
            
            return errorResponse;
        }
    }

    private String generateMapHtml(double lat, double lng, String title) {
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
            """, lat, lng, title, title, googleMapsApiKey);
    }
}