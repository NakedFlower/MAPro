// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태를 true로 변경



  // AuthProvider 내부
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };


  // 토큰 유효성 검증 함수
  const validateToken = async (tokenToValidate) => {
    try {
      const response = await fetch('http://mapro.cloud/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenToValidate}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  // JWT 토큰의 만료 시간 확인 (클라이언트 사이드 검증)
  const isTokenExpired = (tokenToCheck) => {
    if (!tokenToCheck) return true;
    
    try {
      const payload = JSON.parse(atob(tokenToCheck.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Token parsing error:', error);
      return true;
    }
  };

  // 앱 시작 시 기존 로그인 정보 복원 및 검증
  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');

      if (savedUser && savedToken) {
        try {
          // 먼저 클라이언트 사이드에서 토큰 만료 확인
          if (isTokenExpired(savedToken)) {
            console.log('Token expired, clearing storage');
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
          } else {
            // 토큰이 유효해 보이면 서버에 검증 요청
            const isValid = await validateToken(savedToken);
            if (isValid) {
              setUser(JSON.parse(savedUser));
              setToken(savedToken);
            } else {
              console.log('Token validation failed, clearing storage');
              localStorage.removeItem('user');
              localStorage.removeItem('token');
              setUser(null);
              setToken(null);
            }
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // 로그인 성공 시 호출
  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('User logged out');
  };

  // 현재 토큰이 유효한지 확인하는 함수
  const checkTokenValidity = async () => {
    if (!token) return false;
    
    if (isTokenExpired(token)) {
      logout();
      return false;
    }
    
    const isValid = await validateToken(token);
    if (!isValid) {
      logout();
      return false;
    }
    
    return true;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      isLoading, 
      login, 
      logout, 
      checkTokenValidity,
      updateUser,      // 여기에 추가
      isAuthenticated: !!user && !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

