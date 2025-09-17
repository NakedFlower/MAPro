// src/contexts/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔄 앱 시작 시 localStorage에서 기존 로그인 정보 복원
  useEffect(() => {
    console.log('🚀 AuthContext 초기화: localStorage 확인 중...');
    
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setToken(savedToken);
        console.log('✅ 기존 로그인 정보 복원 완료:', userData);
      } catch (error) {
        console.error('❌ localStorage 데이터 파싱 오류:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  // 🎯 LoginPanel에서 로그인 성공 시 호출할 함수
  const setLoginSuccess = (userData, userToken) => {
    console.log('✅ 로그인 성공 - Context 상태 업데이트:', userData);
    setUser(userData);
    setToken(userToken);
  };

  // 🚪 로그아웃 함수
  const logout = () => {
    console.log('🚪 로그아웃 실행');
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // 🔒 인증이 필요한 API 요청 함수
  const authenticatedRequest = async (url, options = {}) => {
    const currentToken = token || localStorage.getItem('token');
    
    if (!currentToken) {
      throw new Error('로그인이 필요합니다');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      console.log('🚨 토큰 만료 - 자동 로그아웃');
      logout();
      throw new Error('세션이 만료되었습니다');
    }

    return response;
  };

  // Context 값 제공
  const contextValue = {
    // 상태
    user,
    token,
    isLoading,
    
    // 함수
    setLoginSuccess,  // LoginPanel에서 사용할 함수
    logout,
    authenticatedRequest,
    
    // 유틸리티
    isAuthenticated: !!user,
    getUserName: () => user?.name || user?.username,
    getUserId: () => user?.userId || user?.id,
    getUserEmail: () => user?.username || user?.email,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내에서 사용해야 합니다');
  }
  return context;
}