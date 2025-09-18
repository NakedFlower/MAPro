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
  const geocoderRef = useRef(null);
  const searchMarkersRef = useRef([]);


// 수정된 fetchMapData 함수 - 기존 백엔드 프록시 방식 유지
const fetchMapData = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('🔍 지도 API 호출 시작...');
    
    // Java 백엔드(4000 포트)에서 지도 HTML 받아오기
    const response = await axios.get('http://34.64.120.99:4000/api/map/init', {
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

// initializeGoogleMaps 함수는 제거 - 백엔드 프록시 방식만 사용
// 서버 상태 확인 함수 (별도)
const checkServerHealth = async () => {
  try {
    const response = await axios.get('http://34.64.120.99:5000/health', {
      timeout: 5000
    });
    console.log('서버 상태:', response.data);
    return response.data;
  } catch (error) {
    console.error('서버 상태 확인 실패:', error);
    return null;
  }
};
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

  // 주소 검색 함수
// Node.js API를 사용한 장소 검색 함수
  const searchAddress = useCallback(async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    
    try {
      const response = await axios.get(`http://34.64.120.99:5000/api/places/search?keyword=${encodeURIComponent(query)}&location=서울`);
      
      if (response.data.success) {
        setSearchResults(response.data.places.slice(0, 5)); // 최대 5개 결과만
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
    
    // 지도 중심 이동
    mapInstanceRef.current.setCenter(location);
    mapInstanceRef.current.setZoom(16);

    // 기존 검색 마커들 제거
    searchMarkersRef.current.forEach(marker => marker.setMap(null));
    searchMarkersRef.current = [];

    // 새 마커 추가 (카테고리별 색상 적용)
    const marker = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: result.name,
      icon: {
        path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: result.pinOptions?.color || '#ff4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      animation: window.google.maps.Animation.DROP
    });

    // 정보창 추가
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 250px;">
          <h3 style="margin: 0 0 8px 0; color: #333;">${result.name}</h3>
          <p style="margin: 4px 0; color: #666; font-size: 14px;">${result.address}</p>
          <p style="margin: 4px 0; color: #666; font-size: 14px;">카테고리: ${result.category}</p>
          ${result.info.phone ? `<p style="margin: 4px 0; color: #666; font-size: 14px;">📞 ${result.info.phone}</p>` : ''}
          <button onclick="window.open('${result.googleMapsUrl}', '_blank')" 
                  style="margin-top: 8px; padding: 6px 12px; background: #4285f4; color: white; border: none; border-radius: 4px; cursor: pointer;">
            구글맵에서 보기
          </button>
        </div>
      `
    });

    marker.addListener('click', () => {
      infoWindow.open(mapInstanceRef.current, marker);
    });

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

  // 지도 HTML 처리 및 Google Maps 설정 (성능 최적화)
  useEffect(() => {
    if (mapData?.mapHtml && mapContainerRef.current) {
      // 미리 로딩 상태 업데이트를 방지하고 부드러운 전환을 위한 처리
      const container = mapContainerRef.current;
      
      // 페이드 인 애니메이션을 위한 초기 스타일
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
        
        // 스크립트 로딩을 Promise로 처리
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

      // 모든 스크립트 로딩 완료 후 지도 설정
      Promise.all(scriptPromises).then(() => {
        const checkGoogleMaps = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogleMaps);
            
            // 지연 시간을 줄이고 requestAnimationFrame 사용
            requestAnimationFrame(() => {
              setupGoogleMap();
              // 페이드 인 효과
              container.style.opacity = '1';
            });
          }
        }, 50); // 체크 간격 단축

        setTimeout(() => {
          clearInterval(checkGoogleMaps);
        }, 10000);
      });
    }
  }, [mapData]);

  // Google Maps 설정 (성능 최적화)
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
          // 성능 최적화 옵션 추가
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
        
        // Geocoder 초기화
        geocoderRef.current = new window.google.maps.Geocoder();
        
        // 지도 로딩 완료 후 처리
        const idleListener = window.google.maps.event.addListenerOnce(mapInstanceRef.current, 'idle', () => {
          createLocationButton();
          console.log('✅ Google Maps 설정 완료');
        });

        // 리사이즈 이벤트를 debounce 처리
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

  // 챗봇에서 받은 장소들을 지도에 핀으로 표시
const displayChatbotPlaces = useCallback(async (placeNames) => {
  if (!placeNames || !mapInstanceRef.current || !window.google) return;
  
  console.log('챗봇 장소들을 지도에 표시:', placeNames);
  
  try {
    // 기존 검색 마커들 제거
    searchMarkersRef.current.forEach(marker => marker.setMap(null));
    searchMarkersRef.current = [];
    
    // Node.js API를 통해 장소 상세 정보 가져오기
    for (let i = 0; i < placeNames.length; i++) {
      const placeName = placeNames[i];
      
      try {
        const response = await axios.get(`http://34.64.120.99:5000/api/places/search?keyword=${encodeURIComponent(placeName)}&location=서울`);
        
        if (response.data.success && response.data.places.length > 0) {
          const place = response.data.places[0]; // 첫 번째 결과 사용
          
          const marker = new window.google.maps.Marker({
            position: place.coordinates,
            map: mapInstanceRef.current,
            title: place.name,
            icon: {
              path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 8,
              fillColor: place.pinOptions?.color || '#FF6B6B',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            },
            animation: window.google.maps.Animation.DROP
          });

          // 정보창 추가
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; max-width: 280px;">
                <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${place.name}</h3>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">📍 ${place.address}</p>
                <p style="margin: 4px 0; color: #666; font-size: 14px;">🏷️ ${place.category}</p>
                ${place.info.phone ? `<p style="margin: 4px 0; color: #666; font-size: 14px;">📞 ${place.info.phone}</p>` : ''}
                ${place.info.rating ? `<p style="margin: 4px 0; color: #666; font-size: 14px;">⭐ ${place.info.rating}/5</p>` : ''}
                <button onclick="window.open('${place.googleMapsUrl}', '_blank')" 
                        style="margin-top: 10px; padding: 8px 16px; background: #4285f4; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px;">
                  구글맵에서 자세히 보기
                </button>
              </div>
            `
          });

          marker.addListener('click', () => {
            // 다른 정보창들 닫기
            searchMarkersRef.current.forEach(m => {
              if (m.infoWindow) m.infoWindow.close();
            });
            infoWindow.open(mapInstanceRef.current, marker);
          });

          marker.infoWindow = infoWindow;
          searchMarkersRef.current.push(marker);
        }
      } catch (error) {
        console.error(`장소 정보 가져오기 실패: ${placeName}`, error);
      }
    }
    
    // 모든 마커가 보이도록 지도 범위 조정
    if (searchMarkersRef.current.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      searchMarkersRef.current.forEach(marker => {
        bounds.extend(marker.getPosition());
      });
      mapInstanceRef.current.fitBounds(bounds);
      
      // 줌이 너무 클 경우 제한
      const listener = window.google.maps.event.addListenerOnce(mapInstanceRef.current, 'bounds_changed', () => {
        if (mapInstanceRef.current.getZoom() > 16) {
          mapInstanceRef.current.setZoom(16);
        }
      });
    }
    
  } catch (error) {
    console.error('챗봇 장소 표시 오류:', error);
  }
}, []);


  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);


  // 챗봇에서 받은 장소들이 있을 때 지도에 표시// 챗봇에서 전달된 장소들 처리
  useEffect(() => {
    if (places && mapInstanceRef.current) {
      console.log('챗봇에서 전달된 장소들:', places);
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
                    {result.address_components[0]?.long_name || result.formatted_address}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {result.formatted_address}
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