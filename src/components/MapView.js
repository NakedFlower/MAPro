// MapView.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

function MapView({ places, onPlacesDisplayed }) {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchMarkersRef = useRef([]);
  const infoWindowsRef = useRef([]);

// 수정된 fetchMapData 함수 - 기존 백엔드 프록시 방식 유지
const fetchMapData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('🔍 지도 API 호출 시작...');
    
    // Java 백엔드(4000 포트)에서 지도 HTML 받아오기
    const response = await axios.get('http://mapro.cloud:4000/api/map/init', {
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    });
    
    console.log('✅ API 응답:', response.data);
    
    // 응답 데이터 구조에 따라 검증 로직 수정
    if (response.data && response.data.mapHtml) {
      setMapData(response.data);
    } else {
      throw new Error('지도 데이터가 올바르지 않습니다.');
    }
  } catch (err) {
    console.error('❌ Map API 호출 실패:', err);
    setError('지도를 불러올 수 없습니다: ' + err.message);
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
        
        if (mapInstanceRef.current && window.google) {
          const newCenter = new window.google.maps.LatLng(latitude, longitude);
          mapInstanceRef.current.setCenter(newCenter);
          mapInstanceRef.current.setZoom(16);
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

    if (window.currentLocationMarker) {
      window.currentLocationMarker.setMap(null);
    }
    if (window.currentLocationCircle) {
      window.currentLocationCircle.setMap(null);
    }

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

    window.currentLocationCircle = new window.google.maps.Circle({
      strokeColor: '#4285f4',
      strokeOpacity: 0.3,
      strokeWeight: 1,
      fillColor: '#4285f4',
      fillOpacity: 0.1,
      map: mapInstanceRef.current,
      center: { lat, lng },
      radius: 50,
      zIndex: 999
    });
  };

  // 장소 검색 함수 (기존 유지)
// 기존 searchAddress 함수 찾아서 수정
  const searchAddress = useCallback(async (query) => {
      if (!query.trim()) return;

      setIsSearching(true);
      
      try {
        // Node.js(5000) 대신 Node.js를 통해 Java(4000)로 프록시
        const response = await axios.get(
          `http://mapro.cloud:5000/api/places/search?keyword=${encodeURIComponent(query)}&location=서울`
        );
        
        if (response.data.success) {
          setSearchResults(response.data.places.slice(0, 5));
          setShowSearchResults(true);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('장소 검색 오류:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
  }, []);

  // 검색 결과 선택
  const selectSearchResult = (result) => {
    if (!mapInstanceRef.current || !result.coordinates) return;

    const location = new window.google.maps.LatLng(result.coordinates.lat, result.coordinates.lng);
    
    mapInstanceRef.current.setCenter(location);
    mapInstanceRef.current.setZoom(16);

    // 기존 검색 마커들 제거
    clearExistingMarkers();

    // 새 마커 추가
    const marker = createMarker(result, location);
    searchMarkersRef.current.push(marker);

    // 검색 결과 숨기기
    setShowSearchResults(false);
    setSearchQuery(result.name);
  };

  // 검색 입력 처리
  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 1) {
      searchAddress(value);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // 검색창 외부 클릭 시 결과 숨기기
  const handleClickOutside = useCallback((e) => {
    if (searchInputRef.current && !searchInputRef.current.contains(e.target)) {
      setShowSearchResults(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

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
      top: 80px;
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

    mapInstanceRef.current.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(locationButton);
  };

  // 지도 HTML 처리 및 Google Maps 설정
  useEffect(() => {
    if (mapData?.mapHtml && mapContainerRef.current) {
      const container = mapContainerRef.current;
      
      container.style.opacity = '0';
      container.style.transition = 'opacity 0.3s ease-in-out';
      
      container.innerHTML = mapData.mapHtml;

      const scripts = container.querySelectorAll('script');
      let scriptPromises = [];

      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        
        const promise = new Promise((resolve) => {
          if (newScript.src) {
            newScript.onload = resolve;
            newScript.onerror = resolve;
          } else {
            setTimeout(resolve, 0);
          }
        });
        
        scriptPromises.push(promise);
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

      Promise.all(scriptPromises).then(() => {
        const checkGoogleMaps = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogleMaps);
            
            requestAnimationFrame(() => {
              setupGoogleMap();
              container.style.opacity = '1';
            });
          }
        }, 50);

        setTimeout(() => {
          clearInterval(checkGoogleMaps);
        }, 10000);
      });
    }
  }, [mapData]);

  // Google Maps 설정
  const setupGoogleMap = () => {
    try {
      const mapElement = mapContainerRef.current?.querySelector('#map') || 
                        mapContainerRef.current?.querySelector('div[style*="height"]') ||
                        mapContainerRef.current?.firstChild;

      if (mapElement && window.google) {
        mapElement.style.width = '100%';
        mapElement.style.height = '100vh';
        mapElement.style.position = 'relative';

        const mapOptions = {
          center: { lat: 37.5665, lng: 126.9780 },
          zoom: 15,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          optimized: true,
          maxZoom: 20,
          minZoom: 8,
          styles: [
            {
              featureType: "transit",
              elementType: "labels.icon",
              stylers: [{ visibility: "off" }]
            }
          ]
        };

        mapInstanceRef.current = new window.google.maps.Map(mapElement, mapOptions);
        
        // 지도 로딩 완료 후 처리
        window.google.maps.event.addListenerOnce(mapInstanceRef.current, 'idle', () => {
          createLocationButton();
          console.log('✅ Google Maps 설정 완료');
        });

        // 리사이즈 이벤트 처리
        let resizeTimeout;
        window.google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(() => {
            window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
          }, 100);
        });
      }
    } catch (error) {
      console.error('❌ Google Maps 설정 오류:', error);
    }
  };

  // 기존 마커들과 오버레이들 완전 제거
  const clearExistingMarkers = () => {
    // 기존 마커들과 연결된 모든 오버레이 제거
    searchMarkersRef.current.forEach(marker => {
      // 마커 제거
      marker.setMap(null);
      
      // 라벨 오버레이 제거
      if (marker.labelOverlay) {
        marker.labelOverlay.setMap(null);
        marker.labelOverlay = null;
      }
      
      // 아이콘 오버레이 제거
      if (marker.iconOverlay) {
        marker.iconOverlay.setMap(null);
        marker.iconOverlay = null;
      }
    });
    
    // 배열 초기화
    searchMarkersRef.current = [];
    
    // 정보창들 닫기
    infoWindowsRef.current.forEach(infoWindow => {
      infoWindow.close();
      infoWindow.setMap(null);
    });
    infoWindowsRef.current = [];
    
    console.log('🧹 모든 마커와 오버레이 정리 완료');
  };

  // 카테고리별 아이콘 반환
  const getCategoryIcon = (category) => {
    const iconMap = {
      '음식점': '🍽️',
      '카페': '☕',
      '병원': '🏥',
      '편의점': '🏪',
      '호텔': '🏨',
      '헤어샵': '✂️',
      '약국': '💊'
    };
    return iconMap[category] || '📍';
  };

  // 마커 생성 함수
  const createMarker = (place, position) => {
    // 카테고리별 아이콘 및 색상 설정
    const getMarkerConfig = (category) => {
      const configs = {
        '음식점': { icon: '🍽️', color: '#FF6B6B' },
        '카페': { icon: '☕', color: '#4ECDC4' },
        '병원': { icon: '🏥', color: '#45B7D1' },
        '편의점': { icon: '🏪', color: '#96CEB4' },
        '호텔': { icon: '🏨', color: '#9B59B6' },
        '헤어샵': { icon: '✂️', color: '#F39C12' },
        '약국': { icon: '💊', color: '#E74C3C' }
      };
      return configs[category] || { icon: '📍', color: '#4285F4' };
    };

    const config = getMarkerConfig(place.category);

    // SVG 핀 마커 생성 (카테고리별 색상 + 아이콘)
    const pinSvg = `
      <svg width="32" height="44" viewBox="0 0 32 44" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
          </filter>
        </defs>
        <!-- 핀 바디 -->
        <path d="M16 2C9.373 2 4 7.373 4 14c0 7.412 12 26 12 26s12-18.588 12-26c0-6.627-5.373-12-12-12z" 
              fill="${config.color}" 
              stroke="white" 
              stroke-width="2" 
              filter="url(#shadow)"/>
        <!-- 내부 원 -->
        <circle cx="16" cy="14" r="8" fill="white" opacity="0.9"/>
      </svg>
    `;

    const marker = new window.google.maps.Marker({
      position: position,
      map: mapInstanceRef.current,
      title: place.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(pinSvg),
        scaledSize: new window.google.maps.Size(32, 44),
        anchor: new window.google.maps.Point(16, 44), // 핀의 끝점을 정확한 위치에
        origin: new window.google.maps.Point(0, 0)
      },
      animation: window.google.maps.Animation.DROP,
      zIndex: 100
    });

    // 카테고리 아이콘 오버레이 (핀 위에 표시)
    const iconDiv = document.createElement('div');
    iconDiv.innerHTML = `
      <div style="
        position: absolute;
        width: 16px;
        height: 16px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        z-index: 200;
      ">
        ${config.icon}
      </div>
    `;

    const iconOverlay = new window.google.maps.OverlayView();
    iconOverlay.onAdd = function() {
      const panes = this.getPanes();
      panes.overlayMouseTarget.appendChild(iconDiv);
    };

    iconOverlay.draw = function() {
      const projection = this.getProjection();
      const pos = projection.fromLatLngToDivPixel(position);
      iconDiv.style.position = 'absolute';
      iconDiv.style.left = (pos.x - 0) + 'px';
      iconDiv.style.top = (pos.y - 30) + 'px'; // 핀의 원형 부분에 맞춤
    };

    iconOverlay.onRemove = function() {
      if (iconDiv.parentNode) {
        iconDiv.parentNode.removeChild(iconDiv);
      }
    };

    iconOverlay.setMap(mapInstanceRef.current);
    marker.iconOverlay = iconOverlay;

    // 상호명 라벨 생성 (핀 위에 표시)
    const labelDiv = document.createElement('div');
    labelDiv.innerHTML = `
      <div style="
        background: #FFFFFF;
        padding: 6px 10px;
        border-radius: 16px;
        border: 1px solid #DDDDDD;
        box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        font-size: 12px;
        font-weight: 600;
        color: #333333;
        white-space: nowrap;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: relative;
        z-index: 1000;
      ">
        ${place.name}
      </div>
    `;

    const labelOverlay = new window.google.maps.OverlayView();
    labelOverlay.onAdd = function() {
      const panes = this.getPanes();
      panes.overlayLayer.appendChild(labelDiv);
    };

    labelOverlay.draw = function() {
      const projection = this.getProjection();
      const pos = projection.fromLatLngToDivPixel(position);
      labelDiv.style.position = 'absolute';
      labelDiv.style.left = (pos.x - 75) + 'px'; // 중앙 정렬
      labelDiv.style.top = (pos.y - 75) + 'px';  // 핀 위쪽
    };

    labelOverlay.onRemove = function() {
      if (labelDiv.parentNode) {
        labelDiv.parentNode.removeChild(labelDiv);
      }
    };

    labelOverlay.setMap(mapInstanceRef.current);
    marker.labelOverlay = labelOverlay;

    // 팝업 인포윈도우 생성 (구글맵 버튼 포함)
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 12px; max-width: 300px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: 600;">${place.name}</h3>
          <p style="margin: 4px 0; color: #666; font-size: 14px;">📍 ${place.address || place.location}</p>
          <p style="margin: 4px 0; color: #666; font-size: 14px;">🏷️ ${place.category}</p>
          ${place.info?.features && place.info.features.length > 0 ? 
            `<p style="margin: 4px 0; color: #666; font-size: 14px;">✨ ${place.info.features.join(', ')}</p>` : ''}
          ${place.pinData?.popupContent?.googleMapsUrl ? `
            <button onclick="window.open('${place.pinData.popupContent.googleMapsUrl}', '_blank')" 
                    style="
                      background: #4285F4; 
                      color: white; 
                      padding: 8px 16px; 
                      border: none; 
                      border-radius: 8px; 
                      cursor: pointer;
                      font-size: 14px;
                      font-weight: 500;
                      margin-top: 8px;
                      transition: background-color 0.2s;
                    "
                    onmouseover="this.style.backgroundColor='#3367D6'"
                    onmouseout="this.style.backgroundColor='#4285F4'">
              📍 구글지도에서 보기
            </button>
          ` : ''}
        </div>
      `
    });

    marker.addListener('click', () => {
      // 다른 정보창들 닫기
      infoWindowsRef.current.forEach(iw => iw.close());
      infoWindow.open(mapInstanceRef.current, marker);
    });

    infoWindowsRef.current.push(infoWindow);
    return marker;
  };

  // 챗봇에서 받은 장소들을 지도에 핀으로 표시 (위도/경도 직접 사용)
  const displayChatbotPlaces = useCallback(async (placesData) => {
    if (!placesData || !mapInstanceRef.current || !window.google) return;
    
    console.log('📍 챗봇 장소들을 지도에 표시 (위도/경도 직접 사용):', placesData);
    
    try {
      // 기존 마커들 제거
      clearExistingMarkers();
      
      const validPlaces = placesData.filter(place => 
        place.latitude && place.longitude && 
        place.latitude !== 0 && place.longitude !== 0
      );

      if (validPlaces.length === 0) {
        console.warn('⚠️ 유효한 위도/경도를 가진 장소가 없습니다.');
        alert('표시할 수 있는 장소의 위치 정보가 없습니다.');
        return;
      }

      // 각 장소에 대해 마커 생성
      validPlaces.forEach((place, index) => {
        const position = {
          lat: parseFloat(place.latitude),
          lng: parseFloat(place.longitude)
        };

        // 장소 데이터를 표준 형식으로 변환
        const formattedPlace = {
          name: place.name || '알 수 없는 장소',
          category: place.category || '기타',
          address: place.location || '주소 정보 없음',
          location: place.location,
          coordinates: position,
          info: {
            features: place.feature ? place.feature.split(',').map(f => f.trim()).filter(f => f) : []
          },
          pinData: {
            popupContent: {
              googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`
            }
          }
        };

        const marker = createMarker(formattedPlace, position);
        searchMarkersRef.current.push(marker);
      });
      
      // 모든 마커가 보이도록 지도 범위 조정
      if (searchMarkersRef.current.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        searchMarkersRef.current.forEach(marker => {
          bounds.extend(marker.getPosition());
        });
        mapInstanceRef.current.fitBounds(bounds);
        
        // 줌 레벨 조정
        const listener = window.google.maps.event.addListenerOnce(mapInstanceRef.current, 'bounds_changed', () => {
          if (searchMarkersRef.current.length === 1) {
            mapInstanceRef.current.setZoom(16);
          } else if (mapInstanceRef.current.getZoom() > 16) {
            mapInstanceRef.current.setZoom(16);
          }
        });
      }
      
      console.log(`✅ ${validPlaces.length}개 장소 핀 표시 완료 (위도/경도 직접 사용)`);
      
    } catch (error) {
      console.error('❌ 챗봇 장소 표시 오류:', error);
      alert('장소를 지도에 표시하는 중 오류가 발생했습니다.');
    }
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  // 챗봇에서 전달된 장소들 처리
  useEffect(() => {
    if (places && mapInstanceRef.current) {
      console.log('📨 챗봇에서 전달된 장소들 (위도/경도 직접 사용):', places);
      displayChatbotPlaces(places);
      
      // 장소 표시 완료 후 상태 초기화
      if (onPlacesDisplayed) {
        onPlacesDisplayed();
      }
    }
  }, [places, displayChatbotPlaces, onPlacesDisplayed]);

  // 로딩 중
  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid #e3e8ef',
          borderTop: '4px solid #6c5ce7',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <div style={{ 
          color: '#4a5568', 
          fontSize: '20px', 
          fontWeight: '600',
          letterSpacing: '0.5px'
        }}>
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
        <button
          onClick={fetchMapData}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c5ce7',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 지도 렌더링
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      {/* 주소 검색 창 */}
      <div
        ref={searchInputRef}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          width: '320px',
          maxWidth: 'calc(100vw - 80px)'
        }}
      >
        <div style={{
          position: 'relative',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: '1px solid #e0e6ed'
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <svg
              style={{
                position: 'absolute',
                left: '12px',
                width: '20px',
                height: '20px',
                color: '#9ca3af'
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="주소를 검색하세요..."
              value={searchQuery}
              onChange={handleSearchInput}
              onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
              style={{
                width: '100%',
                padding: '14px 16px 14px 44px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: 'transparent'
              }}
            />
            {isSearching && (
              <div style={{
                position: 'absolute',
                right: '12px',
                width: '20px',
                height: '20px',
                border: '2px solid #e3e8ef',
                borderTop: '2px solid #6c5ce7',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            )}
          </div>
          
          {/* 검색 결과 목록 */}
          {showSearchResults && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '0',
              right: '0',
              backgroundColor: '#fff',
              borderRadius: '0 0 8px 8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              border: '1px solid #e0e6ed',
              borderTop: 'none',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => selectSearchResult(result)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    borderBottom: index < searchResults.length - 1 ? '1px solid #f0f0f0' : 'none',
                    fontSize: '14px',
                    color: '#374151',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f8f9fa';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                    {result.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {result.address}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 백엔드에서 생성된 지도 HTML을 렌더링 */}
      <div
        ref={mapContainerRef}
        style={{ 
          width: '100%', 
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: '#f8f9fa' // 로딩 중 배경색
        }}
      />
    </div>
  );
}

export default MapView;