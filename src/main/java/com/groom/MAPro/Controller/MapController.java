// Controller/MapController.java
package com.groom.MAPro.Controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.google.cloud.secretmanager.v1.AccessSecretVersionResponse;
import com.google.cloud.secretmanager.v1.SecretManagerServiceClient;
import com.google.cloud.secretmanager.v1.SecretVersionName;
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

    @Value("${spring.cloud.gcp.project-id}")
    private String projectId;

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

    // 🆕 주소 검색 엔드포인트 추가
    @GetMapping("/places/search")
    public ResponseEntity<?> searchPlaces(
            @RequestParam String keyword,
            @RequestParam(required = false, defaultValue = "서울") String location) {
        
        try {
            String googleMapsApiKey = getGoogleMapsApiKey();
            
            if (googleMapsApiKey == null) {
                return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "error", "API 키를 가져올 수 없습니다."
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

            System.out.println("🔍 Google Places API 검색: " + keyword);

            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || 
                (!"OK".equals(response.get("status")) && !"ZERO_RESULTS".equals(response.get("status")))) {
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
                    Map<String, Object> locationData = (Map<String, Object>) geometry.get("location");
                    
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
                .collect(Collectors.toList());

            System.out.println("✅ 검색 결과: " + places.size() + "개");

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

    // Secret Manager에서 API 키 가져오기 (private 메서드)
    private String getGoogleMapsApiKey() {
        try {
            SecretManagerServiceClient client = SecretManagerServiceClient.create();
            SecretVersionName secretVersionName = SecretVersionName.of(
                projectId, 
                "GOOGLE_MAPS_API_KEY", 
                "latest"
            );
            AccessSecretVersionResponse response = client.accessSecretVersion(secretVersionName);
            String secretValue = response.getPayload().getData().toStringUtf8();
            client.close();
            return secretValue;
        } catch (Exception e) {
            System.err.println("❌ Secret Manager 접근 실패: " + e.getMessage());
            return null;
        }
    }
}