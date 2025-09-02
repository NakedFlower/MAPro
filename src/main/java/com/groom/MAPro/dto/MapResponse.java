// dto/MapResponse.java
package com.groom.MAPro.dto;

public class MapResponse {
    private String location;
    private double latitude;
    private double longitude;
    private String status;

    // 기본 생성자
    public MapResponse() {}

    // 전체 생성자
    public MapResponse(String location, double latitude, double longitude, String status) {
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.status = status;
    }

    // Getter, Setter
    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}