import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Button, 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Typography, 
  Space,
  Divider,
  Avatar,
  Rate
} from 'antd';
import {
  RocketOutlined,
  StarOutlined,
  UserOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  MenuOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'; // 추가

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const MaProLandingPage = () => {
  const [current, setCurrent] = useState('home');
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate(); // 추가

  // 맵 페이지로 이동하는 함수
  const handleGoToMap = () => {
    navigate('/map');
  };

  const menuItems = [
    { key: 'home', label: '홈' },
    { key: 'features', label: '기능' },
    { key: 'pricing', label: '요금' },
    { key: 'contact', label: '문의' }
  ];

  // ... 기존 코드들 (features, testimonials, CountUp 등)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header 
        style={{ 
          position: 'fixed', 
          zIndex: 1000, 
          width: '100%',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 2rem'
        }}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            MAPro
          </div>
          
          <Menu
            mode="horizontal"
            selectedKeys={[current]}
            items={menuItems}
            style={{ 
              border: 'none',
              background: 'transparent',
              minWidth: '400px'
            }}
            onClick={(e) => setCurrent(e.key)}
          />
          
          <Button 
            type="primary" 
            size="large" 
            style={{ borderRadius: '25px' }}
            onClick={handleGoToMap} // 맵으로 이동
          >
            무료 체험
          </Button>
        </div>
      </Header>

      <Content style={{ marginTop: '64px' }}>
        {/* Hero Section */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          color: 'white',
          padding: '100px 0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* ... 기존 배경 스타일 코드 */}
          
          <div style={{ 
            maxWidth: '800px', 
            margin: '0 auto', 
            padding: '0 2rem',
            position: 'relative',
            zIndex: 2
          }}>
            <Title 
              style={{ 
                color: 'white', 
                fontSize: '3.5rem', 
                fontWeight: 700,
                marginBottom: '1rem'
              }}
            >
              당신만을 위한<br />완벽한 장소를 찾아드립니다
            </Title>
            
            <Paragraph 
              style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: '1.2rem',
                marginBottom: '2rem',
                maxWidth: '600px',
                margin: '0 auto 2rem'
              }}
            >
              수백만 개의 실제 리뷰를 분석하여 개인의 취향과 선호도에 맞는 
              맞춤형 장소를 추천하는 AI 서비스입니다.
            </Paragraph>
            
            <Space size="large">
              <Button 
                type="primary" 
                size="large"
                onClick={handleGoToMap} // 맵으로 이동
                style={{ 
                  background: 'white',
                  color: '#1890ff',
                  border: 'none',
                  borderRadius: '25px',
                  padding: '0.8rem 2.5rem',
                  height: 'auto',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                지금 시작하기
              </Button>
              
              <Button 
                type="default"
                size="large"
                icon={<PlayCircleOutlined />}
                onClick={handleGoToMap} // 맵으로 이동
                style={{ 
                  background: 'transparent',
                  color: 'white',
                  border: '2px solid white',
                  borderRadius: '25px',
                  padding: '0.8rem 2.5rem',
                  height: 'auto',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                데모 보기
              </Button>
            </Space>
          </div>
        </div>

        {/* ... 기존 Features, Stats, Testimonials 섹션들 */}

        {/* CTA Section */}
        <div style={{ padding: '80px 0', background: '#fafafa', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 2rem' }}>
            <Title level={2} style={{ marginBottom: '1rem' }}>
              지금 바로 시작해보세요!
            </Title>
            
            <Paragraph style={{ fontSize: '1.2rem', color: '#666', marginBottom: '2rem' }}>
              당신만의 완벽한 장소를 찾는 여정을 MAPro와 함께 시작하세요.
            </Paragraph>
            
            <Space size="large">
              <Button 
                type="primary" 
                size="large"
                onClick={handleGoToMap} // 맵으로 이동
                style={{ 
                  borderRadius: '25px',
                  padding: '0.8rem 2.5rem',
                  height: 'auto',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                무료로 시작하기
              </Button>
              
              <Button 
                type="default"
                size="large"
                style={{ 
                  borderRadius: '25px',
                  padding: '0.8rem 2.5rem',
                  height: 'auto',
                  fontSize: '1.1rem',
                  fontWeight: 600
                }}
              >
                더 알아보기
              </Button>
            </Space>
          </div>
        </div>
      </Content>

      {/* Footer */}
      <Footer style={{ 
        textAlign: 'center', 
        background: '#001529', 
        color: 'rgba(255,255,255,0.65)',
        padding: '40px 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '1rem'
          }}>
            MAPro
          </div>
          <Paragraph style={{ color: 'rgba(255,255,255,0.65)' }}>
            © 2025 MAPro. All rights reserved. | 개인정보처리방침 | 이용약관
          </Paragraph>
        </div>
      </Footer>
    </Layout>
  );
};

export default MaProLandingPage;