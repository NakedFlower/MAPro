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

  // 로그인 페이지로 이동하는 함수 (무료 시작하기 버튼용)
  const handleGoToLogin = () => {
    navigate('/login');
  };

  // 회원등록 페이지로 이동하는 함수
  const handleGoToRegister = () => {
    navigate('/register');
  };

  // 맵 페이지로 이동하는 함수 (무료 체험 버튼용)
  const handleGoToMap = () => {
    navigate('/login'); // 일단 로그인 페이지로 보내고, 로그인 후 맵으로 이동하도록 나중에 설정
  };

  const menuItems = [
    { key: 'home', label: '홈' },
    { key: 'features', label: '기능' },
    { key: 'pricing', label: '요금' },
    { key: 'contact', label: '문의' }
  ];

  // 탭에 따른 콘텐츠 렌더링 함수
  const renderTabContent = () => {
    switch(current) {
      case 'features':
        return (
          <div style={{ 
            padding: '80px 0', 
            background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f3ff 100%)',
            minHeight: 'calc(100vh - 64px)'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
              {/* Hero Section */}
              <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <Title level={1} style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  서비스 기능 소개
                </Title>
                <Title level={3} style={{ 
                  color: '#666', 
                  fontWeight: 'normal',
                  maxWidth: '800px',
                  margin: '0 auto',
                  lineHeight: '1.6'
                }}>
                  "당신의 취향을 알아보고, 최적의 매장을 콕 집어 추천해주는<br />맞춤형 매장 탐색 플랫폼"
                </Title>
              </div>

              {/* Main Features */}
              <Row gutter={[40, 40]}>
                {/* 개인 맞춤 매장 추천 */}
                <Col xs={24} lg={8}>
                  <Card
                    style={{
                      height: '100%',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(24, 144, 255, 0.12)',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: '40px 32px' }}
                    hoverable
                  >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        fontSize: '2rem'
                      }}>
                        🎯
                      </div>
                      <Title level={3} style={{ marginBottom: '16px', color: '#1890ff' }}>
                        개인 맞춤 매장 추천
                      </Title>
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>
                      <Paragraph style={{ color: '#666', fontSize: '16px', lineHeight: '1.7', marginBottom: '20px', minHeight: '84px' }}>
                        음식점, 카페, 편의점, 약국, 펜션, 헤어샵, 병원 등 <strong style={{color: '#1890ff'}}>8개 업종</strong>에 대해 사람들이 실제로 중요하게 생각하는 <strong style={{color: '#1890ff'}}>특징(Feature)</strong>을 기반으로 추천합니다.
                      </Paragraph>
                      
                      <div style={{ 
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #b3e5fc'
                      }}>
                        <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                          💡 <strong>추천 예시:</strong><br />
                          "조용한 카페", "24시간 약국", "가성비 좋은 음식점" 등 개인 취향 반영
                        </Paragraph>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* 스마트 챗봇 도입 */}
                <Col xs={24} lg={8}>
                  <Card
                    style={{
                      height: '100%',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(82, 196, 26, 0.12)',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: '40px 32px' }}
                    hoverable
                  >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #52c41a 0%, #95de64 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        fontSize: '2rem'
                      }}>
                        🤖
                      </div>
                      <Title level={3} style={{ marginBottom: '16px', color: '#52c41a' }}>
                        스마트 챗봇 도입
                      </Title>
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>
                      <Paragraph style={{ color: '#666', fontSize: '16px', lineHeight: '1.7', marginBottom: '20px', minHeight: '84px' }}>
                        추천받은 매장에 대한 <strong style={{color: '#52c41a'}}>빠른 질의응답</strong> 가능하며, 위치·운영시간·메뉴/서비스 같은 정보도 <strong style={{color: '#52c41a'}}>대화형으로 확인</strong>할 수 있습니다.
                      </Paragraph>
                      
                      <div style={{ 
                        background: 'linear-gradient(135deg, #f6ffed 0%, #f0f9ed 100%)',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #b7eb8f'
                      }}>
                        <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                          💬 <strong>대화 예시:</strong><br />
                          단순 검색이 아니라, 친구처럼 대화하면서 탐색
                        </Paragraph>
                      </div>
                    </div>
                  </Card>
                </Col>

                {/* 데이터 기반 학습 */}
                <Col xs={24} lg={8}>
                  <Card
                    style={{
                      height: '100%',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(114, 46, 209, 0.12)',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: '40px 32px' }}
                    hoverable
                  >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        fontSize: '2rem'
                      }}>
                        📊
                      </div>
                      <Title level={3} style={{ marginBottom: '16px', color: '#722ed1' }}>
                        데이터 기반 학습
                      </Title>
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>
                      <Paragraph style={{ color: '#666', fontSize: '16px', lineHeight: '1.7', marginBottom: '20px', minHeight: '84px' }}>
                        <strong style={{color: '#722ed1'}}>리뷰·평점·실사용 데이터</strong> 기반으로 추천 정확도를 업그레이드하며, 사용할수록 <strong style={{color: '#722ed1'}}>개인화 알고리즘</strong>으로 더 정확한 매장을 찾아드립니다.
                      </Paragraph>
                      
                      <div style={{ 
                        background: 'linear-gradient(135deg, #f9f0ff 0%, #f4e8ff 100%)',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #d3adf7'
                      }}>
                        <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                          📈 <strong>학습 효과:</strong><br />
                          사용할수록 더욱 정확한 맞춤 추천
                        </Paragraph>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Chat Screenshots Section */}
              <div style={{ marginTop: '100px', textAlign: 'center' }}>
                <Title level={2} style={{ marginBottom: '2rem' }}>
                  실제 서비스 화면
                </Title>
                <Paragraph style={{ fontSize: '1.2rem', color: '#666', marginBottom: '3rem' }}>
                  MAPro 챗봇과의 실제 대화 예시를 확인해보세요.
                </Paragraph>
                
                <Row gutter={[32, 32]} justify="center">
                  <Col xs={24} md={12}>
                    <Card
                      style={{
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                      }}
                      bodyStyle={{ padding: '0' }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img 
                          src="/stories/assets/chatbotimage.png" 
                          alt="챗봇 대화 시작 화면"
                          style={{
                            width: '100%',
                            height: '300px',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={{
                          display: 'none',
                          height: '300px',
                          backgroundColor: '#f0f2f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '4rem'
                        }}>
                          💬
                        </div>
                      </div>
                      <div style={{ padding: '24px' }}>
                        <Title level={4} style={{ marginBottom: '16px', color: '#1890ff' }}>
                          💬 챗봇 대화 시작
                        </Title>
                        <Paragraph style={{ color: '#666', lineHeight: '1.6' }}>
                          "안녕하세요! MAPro 챗봇입니다"로 시작하는<br />
                          친근한 대화형 인터페이스
                        </Paragraph>
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card
                      style={{
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        overflow: 'hidden'
                      }}
                      bodyStyle={{ padding: '0' }}
                    >
                      <div style={{ position: 'relative' }}>
                        <img 
                          src="/stories/assets/recommend.png" 
                          alt="지도 연동 추천 화면"
                          style={{
                            width: '100%',
                            height: '300px',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div style={{
                          display: 'none',
                          height: '300px',
                          backgroundColor: '#f0f2f5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '4rem'
                        }}>
                          🗺️
                        </div>
                      </div>
                      <div style={{ padding: '24px' }}>
                        <Title level={4} style={{ marginBottom: '16px', color: '#52c41a' }}>
                          🗺️ 지도 연동 추천
                        </Title>
                        <Paragraph style={{ color: '#666', lineHeight: '1.6' }}>
                          대화를 통해 찾은 매장들을<br />
                          실시간으로 지도에 표시
                        </Paragraph>
                      </div>
                    </Card>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div style={{ 
            padding: '80px 0', 
            background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f3ff 100%)',
            minHeight: 'calc(100vh - 64px)'
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 2rem' }}>
              {/* Hero Section */}
              <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <Title level={1} style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  요금제 추천
                </Title>
                <Title level={3} style={{ 
                  color: '#666', 
                  fontWeight: 'normal',
                  maxWidth: '800px',
                  margin: '0 auto',
                  lineHeight: '1.6'
                }}>
                  MAPro에 맞춤 단계별 차별화 요금제
                </Title>
              </div>

              {/* Pricing Cards */}
              <Row gutter={[24, 32]} justify="center">
                {/* 무료 (Demo) */}
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      height: '100%',
                      borderRadius: '16px',
                      border: '2px solid #f0f0f0',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: '32px 24px' }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f0f0f0 0%, #d9d9d9 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '1.5rem'
                      }}>
                        🌱
                      </div>
                      <Title level={3} style={{ marginBottom: '8px', color: '#666' }}>
                        무료 (Demo)
                      </Title>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#666', marginBottom: '8px' }}>
                        $0
                      </div>
                      <div style={{ color: '#999', fontSize: '14px' }}>/ month</div>
                    </div>
                    
                    <div style={{ marginBottom: '32px' }}>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>기본 업종별 매장 추천 (최대 3개 업종)</span>
                      </div>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>챗봇 Q&A 제한 (일 5회)</span>
                      </div>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#ff4d4f', marginRight: '8px' }}>✗</span>
                        <span style={{ fontSize: '14px', color: '#999' }}>광고 노출 있음</span>
                      </div>
                    </div>
                    
                    <Button 
                      size="large" 
                      block 
                      style={{ 
                        borderRadius: '8px',
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}
                    >
                      시작하기
                    </Button>
                  </Card>
                </Col>

                {/* Intermediate */}
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      height: '100%',
                      borderRadius: '16px',
                      border: '2px solid #1890ff',
                      boxShadow: '0 8px 24px rgba(24, 144, 255, 0.15)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: '32px 24px' }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#1890ff',
                      color: 'white',
                      padding: '4px 16px',
                      borderRadius: '0 0 8px 8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      인기
                    </div>
                    
                    <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '16px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '1.5rem'
                      }}>
                        🚀
                      </div>
                      <Title level={3} style={{ marginBottom: '8px', color: '#1890ff' }}>
                        Intermediate
                      </Title>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>
                        $3
                      </div>
                      <div style={{ color: '#999', fontSize: '14px' }}>/ month</div>
                    </div>
                    
                    <div style={{ marginBottom: '32px' }}>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>모든 업종(8개) 매장 추천</span>
                      </div>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>챗봇 무제한 사용 가능</span>
                      </div>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>즐겨찾기 & 히스토리 저장</span>
                      </div>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>맞춤 키워드 필터링</span>
                      </div>
                    </div>
                    
                    <Button 
                      type="primary" 
                      size="large" 
                      block 
                      style={{ 
                        borderRadius: '8px',
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: '500',
                        background: '#1890ff'
                      }}
                    >
                      선택하기
                    </Button>
                  </Card>
                </Col>

                {/* Advanced */}
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      height: '100%',
                      borderRadius: '16px',
                      border: '2px solid #722ed1',
                      boxShadow: '0 8px 24px rgba(114, 46, 209, 0.15)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: '32px 24px' }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#722ed1',
                      color: 'white',
                      padding: '4px 16px',
                      borderRadius: '0 0 8px 8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      추천
                    </div>
                    
                    <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '16px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '1.5rem'
                      }}>
                        ⭐
                      </div>
                      <Title level={3} style={{ marginBottom: '8px', color: '#722ed1' }}>
                        Advanced
                      </Title>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#722ed1', marginBottom: '8px' }}>
                        $5
                      </div>
                      <div style={{ color: '#999', fontSize: '14px' }}>/ month</div>
                    </div>
                    
                    <div style={{ marginBottom: '32px' }}>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>AI 기반 개인화 고도화 추천</span>
                      </div>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>광고 제거</span>
                      </div>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>지도 기반 실시간 주변 매장 추천</span>
                      </div>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>프리미엄 데이터 제공</span>
                      </div>
                    </div>
                    
                    <Button 
                      type="primary" 
                      size="large" 
                      block 
                      style={{ 
                        borderRadius: '8px',
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: '500',
                        background: '#722ed1'
                      }}
                    >
                      선택하기
                    </Button>
                  </Card>
                </Col>

                {/* Max */}
                <Col xs={24} sm={12} lg={6}>
                  <Card
                    style={{
                      height: '100%',
                      borderRadius: '16px',
                      border: '2px solid #fa8c16',
                      boxShadow: '0 8px 24px rgba(250, 140, 22, 0.15)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: '32px 24px' }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%)',
                      color: 'white',
                      padding: '4px 16px',
                      borderRadius: '0 0 8px 8px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      프리미엄
                    </div>
                    
                    <div style={{ textAlign: 'center', marginBottom: '24px', marginTop: '16px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '1.5rem'
                      }}>
                        👑
                      </div>
                      <Title level={3} style={{ marginBottom: '8px', color: '#fa8c16' }}>
                        Max
                      </Title>
                      <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fa8c16', marginBottom: '8px' }}>
                        $10
                      </div>
                      <div style={{ color: '#999', fontSize: '14px' }}>/ month</div>
                    </div>
                    
                    <div style={{ marginBottom: '32px' }}>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>Advanced 기능 모두 포함</span>
                      </div>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>패밀리/팀 계정 (최대 4명)</span>
                      </div>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>우선순위 고객 지원</span>
                      </div>
                      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#52c41a', marginRight: '8px' }}>✓</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>특별 맞춤형 리포트</span>
                      </div>
                    </div>
                    
                    <Button 
                      type="primary" 
                      size="large" 
                      block 
                      style={{ 
                        borderRadius: '8px',
                        height: '48px',
                        fontSize: '16px',
                        fontWeight: '500',
                        background: 'linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%)',
                        border: 'none'
                      }}
                    >
                      선택하기
                    </Button>
                  </Card>
                </Col>
              </Row>
            </div>
          </div>
        );
      case 'contact':
        return (
          <div style={{ 
            padding: '80px 0', 
            background: 'linear-gradient(135deg, #f6f9fc 0%, #e9f3ff 100%)',
            minHeight: 'calc(100vh - 64px)'
          }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
              {/* Hero Section */}
              <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <Title level={1} style={{ 
                  fontSize: '3rem', 
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  문의(고객지원)
                </Title>
                <Title level={3} style={{ 
                  color: '#666', 
                  fontWeight: 'normal',
                  maxWidth: '800px',
                  margin: '0 auto',
                  lineHeight: '1.6'
                }}>
                  다양한 방법으로 MAPro 팀과 소통하세요
                </Title>
              </div>

              {/* Contact Methods */}
              <Row gutter={[24, 32]} style={{ marginBottom: '80px' }}>
                {/* FAQ 자동 응답 */}
                <Col xs={24} md={8}>
                  <Card
                    style={{
                      height: '100%',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(24, 144, 255, 0.12)',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: '32px 24px' }}
                    hoverable
                  >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        fontSize: '1.5rem'
                      }}>
                        ❓
                      </div>
                      <Title level={4} style={{ marginBottom: '12px', color: '#1890ff' }}>
                        FAQ 자동 응답
                      </Title>
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>
                      <Paragraph style={{ color: '#666', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                        요금제/환불/추천 원리 관련 <strong style={{color: '#1890ff'}}>자주 묻는 질문</strong>을 정리해두었습니다.
                      </Paragraph>
                      
                      <div style={{ 
                        background: 'linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%)',
                        padding: '12px',
                        borderRadius: '6px',
                        border: '1px solid #b3e5fc',
                        marginBottom: '16px'
                      }}>
                        <Paragraph style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                          🔍 <strong>즉시 이용 가능:</strong><br />
                          가장 빠른 답변
                        </Paragraph>
                      </div>
                      
                      <Button 
                        type="primary" 
                        size="large"
                        block
                        style={{ 
                          borderRadius: '6px',
                          height: '40px',
                          fontSize: '14px',
                          fontWeight: '500',
                          background: '#1890ff'
                        }}
                      >
                        FAQ 보기
                      </Button>
                    </div>
                  </Card>
                </Col>

                {/* 이메일 문의 */}
                <Col xs={24} md={8}>
                  <Card
                    style={{
                      height: '100%',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(114, 46, 209, 0.12)',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: '40px 32px' }}
                    hoverable
                  >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #722ed1 0%, #b37feb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        fontSize: '2rem'
                      }}>
                        📧
                      </div>
                      <Title level={3} style={{ marginBottom: '16px', color: '#722ed1' }}>
                        이메일 문의
                      </Title>
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>
                      <Paragraph style={{ color: '#666', fontSize: '16px', lineHeight: '1.7', marginBottom: '20px' }}>
                        <strong style={{color: '#722ed1'}}>자세한 피드백, 제안 사항 접수</strong><br /><br />
                        새로운 기능 요청, 개선 사항 등 상세한 의견을 보내주세요.
                      </Paragraph>
                      
                      <div style={{ 
                        background: 'linear-gradient(135deg, #f9f0ff 0%, #f4e8ff 100%)',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #d3adf7',
                        marginBottom: '20px'
                      }}>
                        <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                          ✉️ <strong>support@mapro.com</strong><br />
                          24-48시간 내 답변 드립니다
                        </Paragraph>
                      </div>
                      
                      <Button 
                        type="primary" 
                        size="large"
                        block
                        style={{ 
                          borderRadius: '8px',
                          height: '48px',
                          fontSize: '16px',
                          fontWeight: '500',
                          background: '#722ed1'
                        }}
                      >
                        이메일 보내기
                      </Button>
                    </div>
                  </Card>
                </Col>

                {/* 긴급 지원 */}
                <Col xs={24} md={8}>
                  <Card
                    style={{
                      height: '100%',
                      borderRadius: '16px',
                      border: 'none',
                      boxShadow: '0 8px 24px rgba(250, 140, 22, 0.12)',
                      overflow: 'hidden'
                    }}
                    bodyStyle={{ padding: '40px 32px' }}
                    hoverable
                  >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        fontSize: '2rem'
                      }}>
                        ⚡
                      </div>
                      <Title level={3} style={{ marginBottom: '16px', color: '#fa8c16' }}>
                        긴급 지원
                      </Title>
                      <div style={{
                        background: 'linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-block'
                      }}>
                        Max 이상 전용
                      </div>
                    </div>
                    
                    <div style={{ textAlign: 'left' }}>
                      <Paragraph style={{ color: '#666', fontSize: '16px', lineHeight: '1.7', marginBottom: '20px' }}>
                        <strong style={{color: '#fa8c16'}}>1:1 빠른 상담 (우선순위)</strong><br /><br />
                        중요한 서비스 장애나 긴급 문제 시 우선 지원해드립니다.
                      </Paragraph>
                      
                      <div style={{ 
                        background: 'linear-gradient(135deg, #fff7e6 0%, #ffecc7 100%)',
                        padding: '16px',
                        borderRadius: '8px',
                        border: '1px solid #ffd591',
                        marginBottom: '20px'
                      }}>
                        <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                          📞 <strong>응답 시간:</strong><br />
                          평균 1시간 내 우선 상담 연결
                        </Paragraph>
                      </div>
                      
                      <Button 
                        type="primary" 
                        size="large"
                        block
                        style={{ 
                          borderRadius: '8px',
                          height: '48px',
                          fontSize: '16px',
                          fontWeight: '500',
                          background: 'linear-gradient(135deg, #fa8c16 0%, #ffc53d 100%)',
                          border: 'none'
                        }}
                      >
                        긴급 지원 요청
                      </Button>
                    </div>
                  </Card>
                </Col>
              </Row>

              {/* Contact Information */}
              <div style={{ marginTop: '100px' }}>
                <Card 
                  style={{ 
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                  }}
                  bodyStyle={{ padding: '40px' }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <Title level={2} style={{ marginBottom: '2rem', color: '#1890ff' }}>
                      연락처 정보
                    </Title>
                    
                    <Row gutter={[48, 32]} justify="center">
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '2rem',
                            marginBottom: '12px',
                            color: '#1890ff'
                          }}>
                            📧
                          </div>
                          <Title level={4} style={{ marginBottom: '8px' }}>이메일</Title>
                          <Paragraph style={{ color: '#666', margin: 0 }}>support@mapro.com</Paragraph>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '2rem',
                            marginBottom: '12px',
                            color: '#52c41a'
                          }}>
                            📞
                          </div>
                          <Title level={4} style={{ marginBottom: '8px' }}>전화</Title>
                          <Paragraph style={{ color: '#666', margin: 0 }}>02-1234-5678</Paragraph>
                        </div>
                      </Col>
                      <Col xs={24} sm={8}>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{
                            fontSize: '2rem',
                            marginBottom: '12px',
                            color: '#722ed1'
                          }}>
                            🕰️
                          </div>
                          <Title level={4} style={{ marginBottom: '8px' }}>운영 시간</Title>
                          <Paragraph style={{ color: '#666', margin: 0 }}>평일 09:00 - 18:00</Paragraph>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );
      default: // 'home' case
        return (
          <>
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
                  수백만 개의 실제 리뷰를 분석하여 <br />개인의 취향과 선호도에 맞는 맞춤형 장소를 추천하는 서비스입니다.
                </Paragraph>
                
                <Space size="large">
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={handleGoToRegister} // 로그인 페이지로 변경
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
                    onClick={() => navigate('/map')} // 맵 페이지로 직접 이동
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
                    더욱 정확하고 개인화된 장소 추천을 경험하세요.
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
                        value={320000}
                        formatter={(value) => <CountUp end={Number(value)} />}
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
                        title={<span style={{ color: '#666', fontSize: '11px', fontWeight: '500' }}>분석된 리뷰</span>}
                        value={8700000}
                        formatter={(value) => <CountUp end={Number(value)} />}
                        suffix="개"
                        valueStyle={{ color: '#52c41a', fontSize: '2.0rem', fontWeight: '700', lineHeight: '1.2' }}
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
                        value={94.8}
                        formatter={(value) => <CountUp end={Number(value)} decimals={1} />}
                        suffix="%"
                        valueStyle={{ color: '#722ed1', fontSize: '2.5rem', fontWeight: '700', lineHeight: '1.2' }}
                      />
                      <div style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
                        실제 리뷰 기반
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
                        value={4.9}
                        formatter={(value) => <CountUp end={Number(value)} decimals={1} />}
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
              padding: '60px 0', 
              background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
              color: 'white',
              textAlign: 'center' 
            }}>
              <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 2rem' }}>
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
                    onClick={handleGoToLogin} // 로그인 페이지로 변경
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
          </>
        );
    }
  };

  const features = [
    {
      icon: <StarOutlined style={{ fontSize: '2rem', color: '#1890ff' }} />,
      title: '개인 맞춤 추천',
      description: '개인의 취향과 선호도를 바탕으로 가장 적합한 장소를 추천해드립니다.'
    },
    {
      icon: <BarChartOutlined style={{ fontSize: '2rem', color: '#1890ff' }} />,
      title: '실시간 리뷰 분석',
      description: '수백만 개의 실제 사용자 리뷰를 실시간으로 분석하여 가장 정확한 정보를 제공합니다.'
    },
    {
      icon: <RocketOutlined style={{ fontSize: '2rem', color: '#1890ff' }} />,
      title: '빠른 검색 속도',
      description: '고성능 클라우드 엔진으로 몇 초 내에 최적의 장소를 찾아 추천해드립니다.'
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

  const CountUp = ({ end, duration = 2000, decimals = 0 }) => {
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
    
    return decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();
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
              minWidth: '400px',
              marginLeft: '80px'
            }}
            onClick={(e) => setCurrent(e.key)}
          />
          
          <Button 
            type="primary" 
            size="large" 
            style={{ borderRadius: '25px' }}
            onClick={handleGoToLogin} // 로그인 페이지로 변경
          >
            로그인
          </Button>
        </div>
      </Header>

      <Content style={{ marginTop: '64px' }}>
        {renderTabContent()}
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