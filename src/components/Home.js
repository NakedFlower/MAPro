// Home.js
import React, { useContext } from 'react';
import { Card, Typography, Button, message } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';

import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

function Home({ onOpenMap }) {
  const { user } = useAuth();

  const handleClick = () => {
    if (onOpenMap) onOpenMap();
    message.info('지도 화면으로 이동합니다.');
  };

  return (
    <div style={{ padding: 24, background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        hoverable
        style={{ width: '90vw',        // 뷰포트 너비의 90%
                maxWidth: '1400px',  
                margin: 'auto' 
              }}
        cover={
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <AppstoreOutlined style={{ fontSize: 64, color: '#667eea' }} />
          </div>
        }
      >
        <Title level={3} style={{ textAlign: 'center', marginBottom: 16 }}>
          {user ? `${user.name} 님, 반갑습니다` : "게스트 님, 반갑습니다"}
        </Title>

        <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}>
          🌍 지도를 보려면 아래 버튼을 클릭하세요
        </Text>

        <Button
          type="primary"
          size="large"
          block
          onClick={handleClick}
          icon={<AppstoreOutlined />}
        >
          지도 보기
        </Button>
      </Card>
    </div>
  );
}

export default Home;