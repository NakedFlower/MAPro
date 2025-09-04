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

const { Header, Content, Footer } = Layout;
const { Title, Paragraph, Text } = Typography;

const MaProLandingPage = () => {
  const [current, setCurrent] = useState('home');
  const [visible, setVisible] = useState(false);

  const menuItems = [
    { key: 'home', label: '홈' },
    { key: 'features', label: '기능' },
    { key: 'pricing', label: '요금' },
    { key: 'contact', label: '문의' }
  ];

  const features = [
    {
      icon: <StarOutlined style={{ fontSize: '2rem', color: '#1890ff' }} />,
      title: '개인 맞춤 추천',
      description: 'AI가 분석한 개인의 취향과 선호도를 바탕으로 가장 적합한 장소를 추천해드립니다.'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '2rem', color: '#1890ff' }} />,
      title: '실시간 리뷰 분석',
      description: '수백만 개의 실제 사용자 리뷰를 실시간으로 분석하여 가장 정확한 정보를 제공합니다.'
    },
    {
      icon: <RocketOutlined style={{ fontSize: '2rem', color: '#1890ff' }} />,
      title: '빠른 검색 속도',
      description: '고성능 AI 엔진으로 몇 초 내에 최적의 장소를 찾아 추천해드립니다.'
    }
  ];

  const testimonials = [
    {
      name: '김민수',
      rating: 5,
      comment: 'MAPro 덕분에 완벽한 데이트 장소를 찾았어요! 정말 만족스러운 서비스입니다.',
      avatar: '🧑‍💼'
    },
    {
      name: '이지은',
      rating: 5,
      comment: '여행 갈 때마다 사용하고 있어요. 현지인만 아는 숨은 명소까지 추천해줘서 놀라웠습니다.',
      avatar: '👩‍🎨'
    },
    {
      name: '박준호',
      rating: 5,
      comment: '맛집 찾을 때 이만한 앱이 없어요. 제 취향을 정확히 파악해서 추천해줍니다.',
      avatar: '👨‍🍳'
    }
  ];

  const CountUp = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);
    
    useEffect(() => {
      const increment = end / (duration / 16);
      const timer = setInterval(() => {
        setCount(prevCount => {
          const newCount = prevCount + increment;
          if (newCount >= end) {
            clearInterval(timer);
            return end;
          }
          return newCount;
        });
      }, 16);
      
      return () => clearInterval(timer);
    }, [end, duration]);
    
    return Math.floor(count).toLocaleString();
  };

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
          
          <Button type="primary" size="large" style={{ borderRadius: '25px' }}>
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
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1000 1000\'%3E%3Cpolygon fill=\'rgba(255,255,255,0.1)\' points=\'0,1000 1000,200 1000,1000\'/%3E%3C/svg%3E")',
            backgroundSize: 'cover'
          }} />
          
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

        {/* Features Section */}
        <div style={{ padding: '80px 0', background: '#fafafa' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '3rem' }}>
              왜 MAPro를 선택해야 할까요?
            </Title>
            
            <Row gutter={[32, 32]}>
              {features.map((feature, index) => (
                <Col xs={24} md={8} key={index}>
                  <Card 
                    hoverable
                    style={{ 
                      height: '100%',
                      textAlign: 'center',
                      borderRadius: '15px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}
                  >
                    <div style={{ 
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 1.5rem',
                      background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '2rem'
                    }}>
                      {feature.icon}
                    </div>
                    
                    <Title level={3} style={{ marginBottom: '1rem' }}>
                      {feature.title}
                    </Title>
                    
                    <Paragraph style={{ color: '#666' }}>
                      {feature.description}
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{ 
          padding: '80px 0', 
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          color: 'white'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <Title level={2} style={{ color: 'white', textAlign: 'center', marginBottom: '3rem' }}>
              MAPro의 성과
            </Title>
            
            <Row gutter={[32, 32]} justify="center">
              <Col xs={12} md={6}>
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>분석된 리뷰</span>}
                  value={<CountUp end={1000000} />}
                  suffix="+"
                  valueStyle={{ 
                    color: 'white', 
                    fontSize: '2.5rem', 
                    fontWeight: 700 
                  }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>활성 사용자</span>}
                  value={<CountUp end={50000} />}
                  suffix="+"
                  valueStyle={{ 
                    color: 'white', 
                    fontSize: '2.5rem', 
                    fontWeight: 700 
                  }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>만족도</span>}
                  value={<CountUp end={98} />}
                  suffix="%"
                  valueStyle={{ 
                    color: 'white', 
                    fontSize: '2.5rem', 
                    fontWeight: 700 
                  }}
                />
              </Col>
              <Col xs={12} md={6}>
                <Statistic 
                  title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>추천 정확도</span>}
                  value={<CountUp end={95} />}
                  suffix="%"
                  valueStyle={{ 
                    color: 'white', 
                    fontSize: '2.5rem', 
                    fontWeight: 700 
                  }}
                />
              </Col>
            </Row>
          </div>
        </div>

        {/* Testimonials Section */}
        <div style={{ padding: '80px 0', background: 'white' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '3rem' }}>
              사용자 후기
            </Title>
            
            <Row gutter={[32, 32]}>
              {testimonials.map((testimonial, index) => (
                <Col xs={24} md={8} key={index}>
                  <Card 
                    style={{ 
                      height: '100%',
                      borderRadius: '15px',
                      border: 'none',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                        {testimonial.avatar}
                      </div>
                      <Title level={4} style={{ marginBottom: '0.5rem' }}>
                        {testimonial.name}
                      </Title>
                      <Rate disabled defaultValue={testimonial.rating} />
                    </div>
                    <Paragraph style={{ fontStyle: 'italic', color: '#666' }}>
                      "{testimonial.comment}"
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

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