// MapView.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

function MapView() {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const fetchMapData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 지도 API 호출 시작...');
      
      const response = await axios.get('http://34.64.120.99:4000/api/map/init', {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });
      
      console.log('✅ API 응답:', response.data);
      
      if (response.data && response.data.mapHtml) {
        setMapData(response.data);
      } else {
        throw new Error('지도 데이터가 올바르지 않습니다.');
      }
    } catch (err) {
      console.error('❌ Map API 호출 실패:', err);
      setError('지도를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 사용자 현재 위치 가져오기
  const getUserLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        
        // 지도가 로드되어 있다면 위치로 이동
        if (mapInstanceRef.current && window.google) {
          const newCenter = new window.google.maps.LatLng(latitude, longitude);
          mapInstanceRef.current.setCenter(newCenter);
          mapInstanceRef.current.setZoom(16);
          
          // 현재 위치 마커 추가/업데이트
          addCurrentLocationMarker(latitude, longitude);
        }
        
        setLocationLoading(false);
      },
      (error) => {
        console.error('위치 가져오기 실패:', error);
        let errorMessage = '위치를 가져올 수 없습니다.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '위치 정보를 사용할 수 없습니다.';
            break;
          case error.TIMEOUT:
            errorMessage = '위치 요청 시간이 초과되었습니다.';
            break;
          default:
            break;
        }
        
        alert(errorMessage);
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // 현재 위치 마커 추가
  const addCurrentLocationMarker = (lat, lng) => {
    if (!mapInstanceRef.current || !window.google) return;

    // 기존 현재 위치 마커 제거
    if (window.currentLocationMarker) {
      window.currentLocationMarker.setMap(null);
    }
    if (window.currentLocationCircle) {
      window.currentLocationCircle.setMap(null);
    }

    // 현재 위치 마커 생성 (파란색 점)
    window.currentLocationMarker = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      title: '현재 위치',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285f4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      zIndex: 1000
    });

    // 현재 위치 주변에 반투명 원 추가 (정확도 표시)
    window.currentLocationCircle = new window.google.maps.Circle({
      strokeColor: '#4285f4',
      strokeOpacity: 0.3,
      strokeWeight: 1,
      fillColor: '#4285f4',
      fillOpacity: 0.1,
      map: mapInstanceRef.current,
      center: { lat, lng },
      radius: 50, // 50미터
      zIndex: 999
    });
  };

  // 현위치 버튼 생성
  const createLocationButton = () => {
    if (!mapInstanceRef.current || !window.google) return;

    const locationButton = document.createElement('button');
    locationButton.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="3" fill="#4285f4"/>
        <circle cx="12" cy="12" r="8" stroke="#4285f4" stroke-width="2" fill="none" opacity="0.4"/>
        <path d="M12 2L12 6" stroke="#4285f4" stroke-width="2" stroke-linecap="round"/>
        <path d="M12 18L12 22" stroke="#4285f4" stroke-width="2" stroke-linecap="round"/>
        <path d="M22 12L18 12" stroke="#4285f4" stroke-width="2" stroke-linecap="round"/>
        <path d="M6 12L2 12" stroke="#4285f4" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;
    
    locationButton.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: #fff;
      border: 1px solid #dadce0;
      border-radius: 4px;
      width: 44px;
      height: 44px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      z-index: 1000;
      transition: all 0.2s ease;
    `;

    locationButton.addEventListener('mouseenter', () => {
      locationButton.style.backgroundColor = '#f8f9fa';
    });

    locationButton.addEventListener('mouseleave', () => {
      locationButton.style.backgroundColor = '#fff';
    });

    locationButton.addEventListener('click', () => {
      if (locationLoading) return;
      getUserLocation();
    });

    // 지도에 버튼 추가
    mapInstanceRef.current.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(locationButton);
  };

  // 지도 HTML 처리 및 Google Maps 설정
  useEffect(() => {
    if (mapData?.mapHtml && mapContainerRef.current) {
      // HTML 삽입
      mapContainerRef.current.innerHTML = mapData.mapHtml;

      // 스크립트 재실행
      const scripts = mapContainerRef.current.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

      // Google Maps 로드 대기 후 설정
      const checkGoogleMaps = setInterval(() => {
        if (window.google && window.google.maps) {
          clearInterval(checkGoogleMaps);
          
          setTimeout(() => {
            setupGoogleMap();
          }, 500);
        }
      }, 100);

      // 타임아웃 설정 (10초 후 중단)
      setTimeout(() => {
        clearInterval(checkGoogleMaps);
      }, 10000);
    }
  }, [mapData]);

  // Google Maps 설정
  const setupGoogleMap = () => {
    try {
      // 지도 요소 찾기
      const mapElement = mapContainerRef.current?.querySelector('#map') || 
                        mapContainerRef.current?.querySelector('div[style*="height"]') ||
                        mapContainerRef.current?.firstChild;

      if (mapElement && window.google) {
        // 지도 요소 크기 설정
        mapElement.style.width = '100%';
        mapElement.style.height = '100vh';
        mapElement.style.position = 'relative';

        // 지도 옵션 설정
        const mapOptions = {
          center: { lat: 37.5665, lng: 126.9780 }, // 서울시청 기본 위치
          zoom: 15,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true, // 모든 기본 UI 제거
          gestureHandling: 'greedy', // 스크롤 제스처 개선
          styles: [
            {
              featureType: "transit",
              elementType: "labels.icon",
              stylers: [{ visibility: "off" }]
            }
          ]
        };

        // 지도 인스턴스 생성
        mapInstanceRef.current = new window.google.maps.Map(mapElement, mapOptions);
        
        // 지도 크기 조정
        setTimeout(() => {
          if (mapInstanceRef.current) {
            window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
          }
        }, 100);

        // 현위치 버튼 추가
        createLocationButton();

        console.log('✅ Google Maps 설정 완료');
      }
    } catch (error) {
      console.error('❌ Google Maps 설정 오류:', error);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  // 로딩 중
  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e3e8ef',
          borderTop: '4px solid #1890ff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div style={{ color: '#666', fontSize: '18px', fontWeight: '500' }}>
          지도를 불러오는 중...
        </div>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  // 에러 처리
  if (error) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          🗺️
        </div>
        <div style={{
          color: '#ff4d4f',
          fontSize: '20px',
          fontWeight: '600',
          textAlign: 'center'
        }}>
          지도를 불러올 수 없습니다
        </div>
        <div style={{
          color: '#666',
          fontSize: '16px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          {error}
        </div>
      </div>
    );
  }

  // 지도 렌더링
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* 백엔드에서 생성된 지도 HTML을 렌더링 */}
      <div
        ref={mapContainerRef}
        style={{ 
          width: '100%', 
          height: '100vh',
          overflow: 'hidden'
        }}
      />
    </div>
  );
}

export default MapView;