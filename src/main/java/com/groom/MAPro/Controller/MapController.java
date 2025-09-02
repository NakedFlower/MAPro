// Controller/MapController.java
package com.groom.MAPro.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.groom.MAPro.dto.MapResponse;
import com.groom.MAPro.service.MapService;

@RestController
@RequestMapping("/api/map")
@CrossOrigin(
    origins = {"http://34.22.81.216:3000", "http://localhost:3000", "*"}, 
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
public class MapController {

    @Autowired
    private MapService mapService;

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
            
            // 오류 응답도 JSON으로 반환
            MapResponse errorResponse = new MapResponse();
            errorResponse.setStatus("error");
            errorResponse.setLocation("서버 내부 오류");
            errorResponse.setLatitude(0.0);
            errorResponse.setLongitude(0.0);
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // 테스트용 엔드포인트 추가
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        System.out.println("✅ /api/map/test 호출됨");
        return ResponseEntity.ok("백엔드 서버가 정상적으로 작동중입니다!");
    }
}