// Controller/MapController.java
package com.groom.MAPro.Controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.groom.MAPro.dto.MapResponse;
import com.groom.MAPro.service.MapService;

@RestController
@RequestMapping("/api/map")
@CrossOrigin(
    origins = {"http://mapro.cloud:3000", "http://localhost:3000", "*"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
public class MapController {

    @Autowired
    private MapService mapService;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/init")
    public ResponseEntity<MapResponse> initializeMap() {
        try {
            System.out.println("✅ /api/map/init 호출됨");
            MapResponse mapData = mapService.getInitialMapData();
            System.out.println("✅ 응답 데이터 상태: " + mapData.getStatus());
            return ResponseEntity.ok(mapData);
        } catch (Exception e) {
            System.err.println("❌ Controller 오류: " + e.getMessage());
            e.printStackTrace();
            
            MapResponse errorResponse = new MapResponse();
            errorResponse.setStatus("error");
            errorResponse.setLocation("서버 내부 오류");
            errorResponse.setLatitude(0.0);
            errorResponse.setLongitude(0.0);
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        System.out.println("✅ /api/map/test 호출됨");
        return ResponseEntity.ok("백엔드 서버가 정상적으로 작동중입니다!");
    }

    // 🧪 API 키 테스트 엔드포인트
    @GetMapping("/test-apikey")
    public ResponseEntity<?> testApiKey() {
        try {
            String apiKey = mapService.getApiKeyForTest();
            
            if (apiKey == null) {
                return ResponseEntity.ok(Map.of(
                    "status", "error",
                    "message", "API 키를 가져올 수 없습니다"
                ));
            }
            
            // API 키 일부만 표시 (보안)
            String maskedKey = apiKey.substring(0, Math.min(10, apiKey.length())) + "...";
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "apiKey", maskedKey,
                "length", apiKey.length(),
                "startsWithAIza", apiKey.startsWith("AIza"),
                "fullTestUrl", "https://maps.googleapis.com/maps/api/place/textsearch/json?query=분당%20서울&language=ko&region=kr&key=" + apiKey
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "status", "error",
                "message", e.getMessage()
            ));
        }
    }

    // 🆕 주소 검색 엔드포인트
    @GetMapping("/places/search")
    public ResponseEntity<?> searchPlaces(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "서울") String location) {
        
        try {
            System.out.println("🔍 장소 검색 요청: " + keyword + " in " + location);
            
            // ✅ MapService의 메서드 사용
            String googleMapsApiKey = mapService.getGoogleMapsApiKeyForSearch();
            
            if (googleMapsApiKey == null || !googleMapsApiKey.startsWith("AIza")) {
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "유효하지 않은 API 키입니다."
                ));
            }

            String query = keyword + " " + location;
            
            String url = UriComponentsBuilder
                .fromHttpUrl("https://maps.googleapis.com/maps/api/place/textsearch/json")
                .queryParam("query", query)
                .queryParam("language", "ko")
                .queryParam("region", "kr")
                .queryParam("key", googleMapsApiKey)
                .toUriString();

            System.out.println("📡 Google Places API 호출: " + query);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || 
                (!"OK".equals(response.get("status")) && !"ZERO_RESULTS".equals(response.get("status")))) {
                
                System.err.println("❌ Google API 상태: " + (response != null ? response.get("status") : "null"));
                
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "Google Places API 오류",
                    "status", response != null ? response.get("status") : "null"
                ));
            }

            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            
            if (results == null) {
                results = new ArrayList<>();
            }

            List<Map<String, Object>> places = results.stream()
                .limit(10)
                .map(place -> {
                    Map<String, Object> geometry = (Map<String, Object>) place.get("geometry");
                    
                    // null 체크 추가
                    if (geometry == null) {
                        return null;
                    }
                    
                    Map<String, Object> locationData = (Map<String, Object>) geometry.get("location");
                    
                    if (locationData == null) {
                        return null;
                    }
                    
                    Map<String, Object> result = new HashMap<>();
                    result.put("id", "google-" + place.get("place_id"));
                    result.put("name", place.get("name"));
                    result.put("address", place.get("formatted_address"));
                    result.put("location", place.get("formatted_address"));
                    
                    Map<String, Double> coordinates = new HashMap<>();
                    coordinates.put("lat", (Double) locationData.get("lat"));  
                    coordinates.put("lng", (Double) locationData.get("lng"));
                    result.put("coordinates", coordinates);
                    
                    List<String> types = (List<String>) place.get("types");
                    result.put("category", types != null && !types.isEmpty() ? types.get(0) : "기타");
                    
                    result.put("googleMapsUrl", 
                        "https://www.google.com/maps/place/?q=place_id:" + place.get("place_id"));
                    
                    return result;
                })
                .filter(place -> place != null) // null 제거
                .collect(Collectors.toList());

            System.out.println("✅ 검색 완료: " + places.size() + "개 결과");

            return ResponseEntity.ok(Map.of(
                "success", true,
                "places", places,
                "count", places.size()
            ));

        } catch (Exception e) {
            System.err.println("❌ 장소 검색 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "error", "장소 검색 중 오류가 발생했습니다.",
                "details", e.getMessage()
            ));
        }
    }
}