//LoginPanel.js
import React, { useEffect, useRef, useState , userContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


function LoginPanel({ onClose }) {
  const navigate = useNavigate();
  const { login } = useAuth();


  const { setLoginSuccess } = useAuth(); //context 함수 가져오기
  const PANEL_WIDTH = 520;
  const PANEL_HEIGHT = 360;

  const panelRef = useRef(null);
  const [pos, setPos] = useState({ left: 60, top: 60 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({ startX: 0, startY: 0, startLeft: 0, startTop: 0, containerW: 0, containerH: 0 });
  const [animateIn, setAnimateIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 마운트 직후 컨테이너 크기를 기준으로 좌측 하단에 배치
    setPos({ left: 300, top: window.innerHeight - PANEL_HEIGHT - 100 });
    // 다음 프레임에 애니메이션 활성화
    const id = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const beginDrag = (clientX, clientY) => {
    const panelEl = panelRef.current;
    if (!panelEl) return;
    const container = panelEl.parentElement;
    const containerW = container?.clientWidth || window.innerWidth;
    const containerH = container?.clientHeight || window.innerHeight;
    dragStateRef.current = {
      startX: clientX,
      startY: clientY,
      startLeft: pos.left,
      startTop: pos.top,
      containerW,
      containerH
    };
    setIsDragging(true);
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    beginDrag(e.clientX, e.clientY);
  };

  const onTouchStart = (e) => {
    const t = e.touches[0];
    beginDrag(t.clientX, t.clientY);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX, clientY) => {
      const { startX, startY, startLeft, startTop, containerW, containerH } = dragStateRef.current;
      const dx = clientX - startX;
      const dy = clientY - startY;
      let nextLeft = startLeft + dx;
      let nextTop = startTop + dy;
      // 경계 제한
      const maxLeft = Math.max(0, (containerW - PANEL_WIDTH));
      const maxTop = Math.max(0, (containerH - PANEL_HEIGHT));
      nextLeft = Math.min(Math.max(0, nextLeft), maxLeft);
      nextTop = Math.min(Math.max(0, nextTop), maxTop);
      setPos({ left: nextLeft, top: nextTop });
    };

    const onMouseMove = (e) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => setIsDragging(false);
    const onTouchMove = (e) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !password) {
      alert('아이디와 비밀번호를 모두 입력해주세요!');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(userId)) {
      alert('올바른 이메일 형식을 입력해주세요!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://mapro.cloud:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userId,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // 로그인 성공 후 토큰 저장 등 처리
        if (data.data.token) {
          console.log(data.data); // JSON 문자열로 저장됨
          console.log(data.data.token); // 객체로 확인 가능

          login(data.data, data.data.token); 
          
          alert('로그인이 성공적으로 완료되었습니다!');
        }
        onClose(); // 패널 닫기
        //navigate('/User/MyPage/Home'); // 메인 대시보드로 이동
      } else {
        const errorData = await response.json();
        alert(errorData.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClick = () => {
    onClose(); // 패널 닫기
    navigate('/register'); // 회원가입 페이지로 이동
  };

  const handleForgotPassword = () => {
    onClose(); // 패널 닫기
    navigate('/find/account'); // 계정찾기 페이지로 이동
  };

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        zIndex: 2000,
        left: pos.left,
        top: pos.top,
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        background: '#ffffff',
        borderRadius: '18px',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
        padding: '28px 28px 24px 28px',
        boxSizing: 'border-box',
        userSelect: isDragging ? 'none' : 'auto',
        transition: 'opacity .22s ease, transform .22s cubic-bezier(.2,.8,.2,1)',
        transform: animateIn ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
        opacity: animateIn ? 1 : 0,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* 드래그 가능한 상단 바 */}
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          height: '26px',
          margin: '-28px -28px 16px -28px',
          background: '#eef1f6',
          borderRadius: '18px 18px 0 0',
          borderBottom: '1px solid #e3e6ec',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 10px',
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#a0a6b2', fontSize: '12px' }}>
          <span>•••</span>
        </div>
        <button onClick={onClose} aria-label="close" style={{
          border: 'none', background: 'transparent', cursor: 'pointer',
          fontSize: '16px', color: '#9aa0a6'
        }}>✕</button>
      </div>

      {/* 제목/부제 영역 */}
      <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
        <div style={{ fontWeight: 800, color: '#3b3b3b', fontSize: '18px', letterSpacing: '.2px' }}>MAPro</div>
        <div style={{ marginTop: '4px', color: '#8b8f97', fontSize: '11px' }}>로그인하실건가요</div>
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="이메일 주소"
          type="email"
          disabled={loading}
          style={{
            width: '100%', height: '34px', borderRadius: '6px',
            border: '1px solid #e2e5ea', outline: 'none',
            padding: '0 5px', fontSize: '12px', color: '#333',
            opacity: loading ? 0.6 : 1
          }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          disabled={loading}
          style={{
            width: '100%', height: '34px', borderRadius: '6px',
            border: '1px solid #e2e5ea', outline: 'none',
            padding: '0 5px', fontSize: '12px', color: '#333',
            marginTop: '14px',
            opacity: loading ? 0.6 : 1
          }}
        />

        <div
          onClick={handleForgotPassword}
          style={{
            textAlign: 'center',
            marginTop: '14px',
            color: '#9aa0a6',
            fontSize: '10px',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          로그인 정보를 잊으셨나요?
        </div>

        <div style={{ position: 'absolute', bottom: '18px', left: '28px', right: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleJoinClick}
            disabled={loading}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#6b7280',
              fontSize: '15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Join
          </button>

          <button
            type="submit"
            disabled={loading}
            style={{
              height: '36px', padding: '0 18px',
              background: loading ? '#9ca3af' : '#3e5ee9',
              color: '#fff',
              border: 'none',
              borderRadius: '18px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              boxShadow: loading ? 'none' : '0 6px 14px rgba(62,94,233,.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '60px'
            }}
          >
            {loading ? '...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPanel;