//FindAccountPage.js mapro.cloud:3000/find/account
import React, { useState } from 'react';
import { 
  Input, 
  Button, 
  Card, 
  Typography, 
  Space, 
  Divider, 
  message,
  Row,
  Col,
  Steps,
  Alert,
  Radio,
  Select
} from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  CloudOutlined,
  ArrowLeftOutlined,
  SendOutlined,
  ClockCircleOutlined,
  KeyOutlined
} from '@ant-design/icons';

const { Title, Text, Link } = Typography;
const { Option } = Select;

const FindAccountPage = () => {
  const navigate = useNavigate();  // 이 줄 추가
  const [currentStep, setCurrentStep] = useState(0);
  const [activeTab, setActiveTab] = useState('findId');
  const [loading, setLoading] = useState(false);
  const [verificationMethod, setVerificationMethod] = useState('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [foundAccounts, setFoundAccounts] = useState([]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSendVerification = () => {
    if (!formData.name || (!formData.email && !formData.phone)) {
      message.error('모든 필드를 입력해주세요!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(1);
      message.success('인증 코드가 전송되었습니다!');
    }, 2000);
  };

  const handleVerifyCode = () => {
    if (!formData.verificationCode) {
      message.error('인증 코드를 입력해주세요!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      
      if (activeTab === 'findId') {
        // 아이디 찾기 결과
        setFoundAccounts([
          { email: 'kim****@example.com', date: '2023-05-15' },
          { email: 'kim****@company.co.kr', date: '2024-01-20' }
        ]);
        setCurrentStep(2);
      } else {
        // 비밀번호 재설정
        setCurrentStep(2);
      }
      message.success('인증이 완료되었습니다!');
    }, 1500);
  };

  const handlePasswordReset = () => {
    if (!formData.newPassword || !formData.confirmPassword) {
      message.error('새 비밀번호를 입력해주세요!');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      message.error('비밀번호가 일치하지 않습니다!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCurrentStep(3);
      message.success('비밀번호가 성공적으로 변경되었습니다!');
    }, 1500);
  };

  const resetForm = () => {
    setCurrentStep(0);
    setFormData({
      name: '',
      email: '',
      phone: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const steps = [
    {
      title: '정보 입력',
      icon: <UserOutlined />,
      description: '본인 확인 정보를 입력해주세요'
    },
    {
      title: '본인 인증',
      icon: <SafetyCertificateOutlined />,
      description: '인증 코드를 확인해주세요'
    },
    {
      title: activeTab === 'findId' ? '계정 확인' : '비밀번호 재설정',
      icon: activeTab === 'findId' ? <CheckCircleOutlined /> : <KeyOutlined />,
      description: activeTab === 'findId' ? '계정을 확인하세요' : '새 비밀번호를 설정하세요'
    }
  ];

  if (activeTab === 'findPassword') {
    steps.push({
      title: '완료',
      icon: <CheckCircleOutlined />,
      description: '비밀번호 변경이 완료되었습니다'
    });
  }

  const StepContent = () => {
    // Step 0: 정보 입력
    if (currentStep === 0) {
      return (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={4}>
              {activeTab === 'findId' ? '아이디 찾기' : '비밀번호 찾기'}
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              {activeTab === 'findId' 
                ? '가입 시 입력한 정보로 아이디를 찾을 수 있습니다' 
                : '가입 시 입력한 정보로 비밀번호를 재설정할 수 있습니다'
              }
            </Text>
          </div>

          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                이름 *
              </Text>
              <Input
                prefix={<UserOutlined />}
                placeholder="실명을 입력하세요"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                size="large"
                style={{ borderRadius: '8px' }}
              />
            </div>

            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                인증 방법 선택 *
              </Text>
              <Radio.Group 
                value={verificationMethod} 
                onChange={(e) => setVerificationMethod(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="email">
                    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                      <MailOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                      <div>
                        <Text strong>이메일로 인증</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          등록된 이메일로 인증코드를 전송합니다
                        </Text>
                      </div>
                    </div>
                  </Radio>
                  <Radio value="phone">
                    <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0' }}>
                      <PhoneOutlined style={{ marginRight: '8px', color: '#667eea' }} />
                      <div>
                        <Text strong>SMS로 인증</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          등록된 전화번호로 인증코드를 전송합니다
                        </Text>
                      </div>
                    </div>
                  </Radio>
                </Space>
              </Radio.Group>
            </div>

            {verificationMethod === 'email' ? (
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  이메일 주소 *
                </Text>
                <Input
                  prefix={<MailOutlined />}
                  placeholder="이메일 주소를 입력하세요"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </div>
            ) : (
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  전화번호 *
                </Text>
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="전화번호를 입력하세요 (010-0000-0000)"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </div>
            )}

            <Button
              type="primary"
              icon={<SendOutlined />}
              size="large"
              block
              loading={loading}
              onClick={handleSendVerification}
              style={{
                height: '48px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                marginTop: '24px'
              }}
            >
              인증코드 전송
            </Button>
          </Space>
        </div>
      );
    }

    // Step 1: 인증 코드 입력
    if (currentStep === 1) {
      return (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
            }}>
              <SafetyCertificateOutlined style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <Title level={4}>인증코드를 입력하세요</Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              {verificationMethod === 'email' 
                ? `${formData.email}으로 전송된 6자리 코드를 입력하세요`
                : `${formData.phone}으로 전송된 6자리 코드를 입력하세요`
              }
            </Text>
          </div>

          <Alert
            message="인증코드가 전송되었습니다"
            description={`${verificationMethod === 'email' ? '이메일함' : 'SMS'}을 확인하여 6자리 인증코드를 입력해주세요. (유효시간: 5분)`}
            type="info"
            showIcon
            icon={<ClockCircleOutlined />}
            style={{ marginBottom: '24px', borderRadius: '8px' }}
          />

          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                인증코드 *
              </Text>
              <Input
                placeholder="6자리 인증코드를 입력하세요"
                value={formData.verificationCode}
                onChange={(e) => handleInputChange('verificationCode', e.target.value)}
                size="large"
                maxLength={6}
                style={{ 
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '18px',
                  letterSpacing: '2px'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">
                코드를 받지 못하셨나요?
              </Text>
              <Button type="link" style={{ padding: 0 }}>
                다시 전송
              </Button>
            </div>

            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleVerifyCode}
              style={{
                height: '48px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              인증하기
            </Button>
          </Space>
        </div>
      );
    }

    // Step 2: 결과 (아이디 찾기) 또는 비밀번호 재설정
    if (currentStep === 2) {
      if (activeTab === 'findId') {
        // 아이디 찾기 결과
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <CheckCircleOutlined 
                style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} 
              />
              <Title level={4}>아이디를 찾았습니다</Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                입력하신 정보와 일치하는 계정입니다
              </Text>
            </div>

            <div style={{ marginBottom: '32px' }}>
              {foundAccounts.map((account, index) => (
                <Card
                  key={index}
                  style={{
                    marginBottom: '12px',
                    borderRadius: '8px',
                    border: '1px solid #e8e8e8'
                  }}
                  bodyStyle={{ padding: '16px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text strong style={{ fontSize: '16px' }}>
                        {account.email}
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        가입일: {account.date}
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      onClick={() => navigate('/login')}
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '6px'
                      }}
                    >
                      로그인
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                type="primary"
                size="large"
                block
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
                onClick={() => navigate('/login')}
              >
                로그인 하기
              </Button>
              <Button
                size="large"
                block
                style={{
                  height: '48px',
                  borderRadius: '8px'
                }}
                onClick={() => setActiveTab('findPassword')}
              >
                비밀번호 찾기
              </Button>
            </Space>
          </div>
        );
      } else {
        // 비밀번호 재설정
        return (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
              }}>
                <KeyOutlined style={{ fontSize: '24px', color: 'white' }} />
              </div>
              <Title level={4}>새 비밀번호를 설정하세요</Title>
              <Text type="secondary" style={{ fontSize: '16px' }}>
                안전한 비밀번호로 계정을 보호하세요
              </Text>
            </div>

            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  새 비밀번호 *
                </Text>
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="새 비밀번호 (8자 이상)"
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
                <Text type="secondary" style={{ fontSize: '12px', marginTop: '4px' }}>
                  8자 이상, 대소문자, 숫자, 특수문자 조합을 권장합니다
                </Text>
              </div>

              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                  비밀번호 확인 *
                </Text>
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  size="large"
                  style={{ borderRadius: '8px' }}
                />
              </div>

              <Button
                type="primary"
                size="large"
                block
                loading={loading}
                onClick={handlePasswordReset}
                style={{
                  height: '48px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  marginTop: '24px'
                }}
              >
                비밀번호 변경
              </Button>
            </Space>
          </div>
        );
      }
    }

    // Step 3: 비밀번호 변경 완료
    if (currentStep === 3 && activeTab === 'findPassword') {
      return (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <CheckCircleOutlined 
            style={{ fontSize: '64px', color: '#52c41a', marginBottom: '24px' }} 
          />
          <Title level={4}>비밀번호가 변경되었습니다</Title>
          <Text type="secondary" style={{ fontSize: '16px', marginBottom: '32px' }}>
            새로운 비밀번호로 안전하게 로그인하세요
          </Text>
          <Button
            type="primary"
            size="large"
            style={{
              height: '48px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              minWidth: '160px'
            }}
            onClick={() => window.location.href = '/login'}
          >
            로그인 하기
          </Button>
        </div>
      );
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative'
    }}>
      {/* 배경 장식 */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '50%',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        left: '-5%',
        width: '400px',
        height: '400px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '50%',
        zIndex: 0
      }} />

      <Card
        style={{
          width: '100%',
          maxWidth: '500px',
          borderRadius: '20px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          border: 'none',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          zIndex: 1
        }}
        bodyStyle={{ padding: '40px' }}
      >
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}>
            <CloudOutlined style={{ fontSize: '32px', color: 'white' }} />
          </div>
          <Title level={2} style={{ 
            marginBottom: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700'
          }}>
            MaproCloud
          </Title>

          {/* 탭 선택 */}
          <div style={{
            display: 'flex',
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '4px',
            marginTop: '20px'
          }}>
            <Button
              type={activeTab === 'findId' ? 'primary' : 'text'}
              block
              onClick={() => {
                setActiveTab('findId');
                resetForm();
              }}
              style={{
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'findId' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'
              }}
            >
              아이디 찾기
            </Button>
            <Button
              type={activeTab === 'findPassword' ? 'primary' : 'text'}
              block
              onClick={() => {
                setActiveTab('findPassword');
                resetForm();
              }}
              style={{
                borderRadius: '8px',
                border: 'none',
                background: activeTab === 'findPassword' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'
              }}
            >
              비밀번호 찾기
            </Button>
          </div>
        </div>

        {/* 진행 단계 */}
        <Steps
          current={currentStep}
          size="small"
          style={{ marginBottom: '32px' }}
          items={steps.slice(0, activeTab === 'findId' ? 3 : 4)}
        />

        {/* 메인 컨텐츠 */}
        <div style={{ minHeight: '400px' }}>
          <StepContent />
        </div>

        {/* 하단 링크 */}
        {currentStep === 0 && (
          <>
            <Divider />
            <div style={{ textAlign: 'center' }}>
              <Space split={<Divider type="vertical" />}>
                <Link onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
                  <ArrowLeftOutlined style={{ marginRight: '4px' }} />
                  로그인으로 돌아가기
                </Link>
                <Link onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>
                  회원가입
                </Link>
              </Space>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default FindAccountPage;