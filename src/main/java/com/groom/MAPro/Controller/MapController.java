// Controller/MapController.java
package com.groom.MAPro.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.groom.MAPro.dto.MapResponse;
import com.groom.MAPro.service.MapService;

@RestController
@RequestMapping("/api/map")
@CrossOrigin(origins = "*") // React 앱에서 접근 허용
public class MapController {

    @Autowired
    private MapService mapService;

    @GetMapping("/init")
    public ResponseEntity<MapResponse> initializeMap() {
        try {
            MapResponse mapData = mapService.getInitialMapData();
            return ResponseEntity.ok(mapData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}