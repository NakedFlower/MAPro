// context/UserContext.js
import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext(
  {
    user: null,
    setUser: () => {}
  }
);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("localStorage 파싱 오류:", e);
          setUser(null);
        }
      }
    }, []);

    // 로그인 성공 시 user 업데이트 + localStorage 동기화
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // 로그아웃 시 user 초기화 + localStorage 제거
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}