// service/MapService.java
package com.groom.MAPro.service;

import com.groom.MAPro.dto.MapResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MapService {

    @Value("${sm://GOOGLE_MAPS_API_KEY}")
    private String googleMapsApiKey;
    
    @Value("${spring.cloud.gcp.project-id}")
    private String projectId;

    public MapResponse getInitialMapData() {
        try {
            System.out.println("=== 상세 디버깅 ===");
            System.out.println("🔍 Project ID: " + projectId);
            System.out.println("🔍 Raw googleMapsApiKey: '" + googleMapsApiKey + "'");
            System.out.println("🔍 API Key length: " + googleMapsApiKey.length());
            System.out.println("🔍 API Key equals '//GOOGLE_MAPS_API_KEY': " + "//GOOGLE_MAPS_API_KEY".equals(googleMapsApiKey));
            
            // 실제 환경변수도 확인
            String envVar = System.getenv("GOOGLE_MAPS_API_KEY");
            System.out.println("🔍 환경변수 GOOGLE_MAPS_API_KEY: " + (envVar != null ? envVar.substring(0, Math.min(10, envVar.length())) + "..." : "null"));
            
            // 시스템 프로퍼티도 확인
            String sysProp = System.getProperty("sm://GOOGLE_MAPS_API_KEY");
            System.out.println("🔍 시스템 프로퍼티 sm://GOOGLE_MAPS_API_KEY: " + sysProp);
            
            System.out.println("=================");
            
            // 나머지 코드는 그대로...
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