// MapView.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Card,
  Typography,
  Spin,
  Alert,
  Button,
  Divider,
} from 'antd';
import { LoadingOutlined, ReloadOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

function MapView() {
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        console.log('🔍 API 호출 시작...');
        const response = await fetch('http://34.64.120.99:4000/api/map/init', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        if (!response.ok) throw new Error(`API 오류 (Status: ${response.status})`);

        const data = await response.json();
        console.log('✅ API 응답 데이터:', data);
        setMapData(data);
        setLoading(false);
      } catch (err) {
        console.error('❌ API 오류:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  // mapData 업데이트 시 HTML 삽입
  useEffect(() => {
    if (mapData?.mapHtml && mapContainerRef.current) {
      mapContainerRef.current.innerHTML = '';
      mapContainerRef.current.innerHTML = mapData.mapHtml;

      // script 재실행
      const scripts = mapContainerRef.current.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

      console.log('✅ 지도 HTML 삽입 완료');
    }
  }, [mapData]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 헤더 */}
      <Header
        style={{
          padding: '0 20px',
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          
          {mapData && (
            <div style={{ marginTop: 8 }}>
              <Text strong>
                <EnvironmentOutlined /> 현재 위치: {mapData.location}
              </Text>
              <Paragraph type="secondary" style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                🔒 API 키는 백엔드에서 안전하게 관리됩니다
              </Paragraph>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                좌표: {mapData.latitude}, {mapData.longitude} | 상태: {mapData.status}
              </Text>
            </div>
          )}
        </div>
      </Header>

      {/* 본문 */}
      <Content style={{ padding: '20px', background: '#f5f7fa' }}>
        <Card
          bordered={false}
          style={{ borderRadius: '12px', overflow: 'hidden', minHeight: 400 }}
          bodyStyle={{ padding: 0 }}
        >
          {/* 지도 영역 */}
          <div
            style={{
              height: '600px',
              background: '#fff',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden',
            }}
          >
            {loading ? (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
                <span style={{ marginLeft: 8 }}>지도를 불러오는 중...</span>
              </div>
            ) : error ? (
              <Alert
                message="오류 발생"
                description={error}
                type="error"
                showIcon
                action={
                  <Button
                    size="small"
                    danger
                    icon={<ReloadOutlined />}
                    onClick={() => window.location.reload()}
                  >
                    다시 시도
                  </Button>
                }
                style={{ margin: '20px', maxWidth: 500 }}
              />
            ) : mapData?.mapHtml ? (
              <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#999',
                }}
              >
                지도 데이터를 불러올 수 없습니다.
              </div>
            )}
          </div>

          {/* 디버그 정보 (개발용) */}
          {mapData && process.env.NODE_ENV === 'development' && (
            <>
              <Divider dashed style={{ margin: '16px 0' }} />
              <div style={{ padding: '0 24px 24px', fontSize: '12px', color: '#666', fontFamily: 'monospace' }}>
                <strong>🐛 디버그 정보:</strong>
                <br />
                맵 데이터 존재: ✅
                <br />
                HTML 길이: {mapData.mapHtml?.length || 0}자
                <br />
                상태: {mapData.status}
                <br />
                Google Maps 로드됨: {window.google?.maps ? '✅' : '❌'}
              </div>
            </>
          )}
        </Card>
      </Content>
    </Layout>
  );
}

export default MapView;