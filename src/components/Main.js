//Main.js
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
  Rate
} from 'antd';
import {
  PlayCircleOutlined,
  StarOutlined,
  BarChartOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;
const { Title, Paragraph } = Typography;

const MaProLandingPage = () => {
  const [current, setCurrent] = useState('home');
  const navigate = useNavigate();

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
          
          <Button 
            type="primary" 
            size="large" 
            style={{ borderRadius: '25px' }}
            onClick={handleGoToMap}
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
          {/* 배경 장식 요소 */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            animation: 'float 6s ease-in-out infinite'
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
                onClick={handleGoToMap}
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
                onClick={handleGoToMap}
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
        <div style={{ padding: '80px 0', background: '#fff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <Title level={2} style={{ marginBottom: '1rem' }}>
                왜 MAPro를 선택해야 할까요?
              </Title>
              <Paragraph style={{ fontSize: '1.2rem', color: '#666' }}>
                AI 기술로 더욱 정확하고 개인화된 장소 추천을 경험하세요.
              </Paragraph>
            </div>
            
            <Row gutter={[32, 32]}>
              {features.map((feature, index) => (
                <Col xs={24} md={8} key={index}>
                  <Card
                    style={{ 
                      height: '100%',
                      textAlign: 'center',
                      border: '1px solid #f0f0f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                    bodyStyle={{ padding: '40px 24px' }}
                  >
                    <div style={{ marginBottom: '20px' }}>
                      {feature.icon}
                    </div>
                    <Title level={4} style={{ marginBottom: '16px' }}>
                      {feature.title}
                    </Title>
                    <Paragraph style={{ color: '#666', lineHeight: '1.6' }}>
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
          background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f3ff 100%)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <Title level={2}>MAPro의 성장</Title>
              <Paragraph style={{ fontSize: '1.2rem', color: '#666' }}>
                많은 사용자들이 MAPro를 신뢰하고 있습니다.
              </Paragraph>
            </div>
            
            <Row gutter={[24, 32]} justify="center">
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    textAlign: 'center', 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(24, 144, 255, 0.12)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  bodyStyle={{ padding: '32px 24px' }}
                  hoverable
                >
                  <div style={{ 
                    background: 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    👥
                  </div>
                  <Statistic
                    title={<span style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>누적 사용자</span>}
                    value={<CountUp end={320000} />}
                    suffix="+"
                    valueStyle={{ color: '#1890ff', fontSize: '2.5rem', fontWeight: '700', lineHeight: '1.2' }}
                  />
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                    매월 +15% 증가
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    textAlign: 'center', 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(82, 196, 26, 0.12)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  bodyStyle={{ padding: '32px 24px' }}
                  hoverable
                >
                  <div style={{ 
                    background: 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    💬
                  </div>
                  <Statistic
                    title={<span style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>분석된 리뷰</span>}
                    value={<CountUp end={8700000} />}
                    suffix="개"
                    valueStyle={{ color: '#52c41a', fontSize: '2.5rem', fontWeight: '700', lineHeight: '1.2' }}
                  />
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                    실시간 업데이트
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    textAlign: 'center', 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(114, 46, 209, 0.12)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  bodyStyle={{ padding: '32px 24px' }}
                  hoverable
                >
                  <div style={{ 
                    background: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    🎯
                  </div>
                  <Statistic
                    title={<span style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>추천 정확도</span>}
                    value={<CountUp end={94.8} />}
                    suffix="%"
                    valueStyle={{ color: '#722ed1', fontSize: '2.5rem', fontWeight: '700', lineHeight: '1.2' }}
                  />
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                    AI 학습 기반
                  </div>
                </Card>
              </Col>
              
              <Col xs={24} sm={12} lg={6}>
                <Card 
                  style={{ 
                    textAlign: 'center', 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(250, 140, 22, 0.12)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  bodyStyle={{ padding: '32px 24px' }}
                  hoverable
                >
                  <div style={{ 
                    background: 'linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%)',
                    borderRadius: '50%',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: 'white',
                    fontSize: '24px'
                  }}>
                    ⭐
                  </div>
                  <Statistic
                    title={<span style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>평균 만족도</span>}
                    value={<CountUp end={4.9} />}
                    suffix="/5.0"
                    valueStyle={{ color: '#fa8c16', fontSize: '2.5rem', fontWeight: '700', lineHeight: '1.2' }}
                  />
                  <div style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                    12만+ 리뷰 기준
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </div>

        {/* Testimonials Section */}
        <div style={{ padding: '80px 0', background: '#fff' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <Title level={2}>사용자 후기</Title>
              <Paragraph style={{ fontSize: '1.2rem', color: '#666' }}>
                실제 사용자들의 생생한 후기를 확인해보세요.
              </Paragraph>
            </div>
            
            <Row gutter={[32, 32]}>
              {testimonials.map((testimonial, index) => (
                <Col xs={24} md={8} key={index}>
                  <Card
                    style={{ 
                      height: '100%',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                    bodyStyle={{ padding: '32px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                      <div style={{ fontSize: '3rem', marginRight: '16px' }}>
                        {testimonial.avatar}
                      </div>
                      <div>
                        <Title level={5} style={{ margin: 0 }}>
                          {testimonial.name}
                        </Title>
                        <Rate disabled defaultValue={testimonial.rating} style={{ fontSize: '14px' }} />
                      </div>
                    </div>
                    <Paragraph style={{ color: '#666', lineHeight: '1.6', fontStyle: 'italic' }}>
                      "{testimonial.comment}"
                    </Paragraph>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ 
          padding: '80px 0', 
          background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
          color: 'white',
          textAlign: 'center' 
        }}>
          <div style={{ maxWidth: '600px', margin: '0 auto', padding: '0 2rem' }}>
            <Title level={2} style={{ color: 'white', marginBottom: '1rem' }}>
              지금 바로 시작해보세요!
            </Title>
            
            <Paragraph style={{ 
              fontSize: '1.2rem', 
              color: 'rgba(255,255,255,0.9)', 
              marginBottom: '2rem' 
            }}>
              당신만의 완벽한 장소를 찾는 여정을 MAPro와 함께 시작하세요.
            </Paragraph>
            
            <Space size="large">
              <Button 
                type="primary" 
                size="large"
                onClick={handleGoToMap}
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
                무료로 시작하기
              </Button>
              
              <Button 
                type="default"
                size="large"
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

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>
    </Layout>
  );
};

export default MaProLandingPage;