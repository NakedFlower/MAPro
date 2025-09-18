import React, { useState, useRef, useEffect } from 'react';

function ChatbotPanel({ onClose, onShowPlacesOnMap }) {
  const PANEL_WIDTH = 480;
  const PANEL_HEIGHT = 640;

  // 드래그 관련 상태
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ right: 100, bottom: 112 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({ startX: 0, startY: 0, startRight: 0, startBottom: 0, containerW: 0, containerH: 0 });
  const [animateIn, setAnimateIn] = useState(false);

  // 다크모드 상태 관리
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // 현재 시간을 반환하는 헬퍼 함수
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // 다크모드 색상 테마
  const theme = {
    background: isDarkMode ? '#2c2c2e' : '#fff',
    headerBorder: isDarkMode ? '#3a3a3c' : '#f3f3f3',
    inputBackground: isDarkMode ? '#3a3a3c' : '#fafafd',
    inputBorder: isDarkMode ? '#3a3a3c' : '#f3f3f3',
    textPrimary: isDarkMode ? '#fff' : '#3b3b3b',
    textSecondary: isDarkMode ? '#8e8e93' : '#bcbcbc',
    textTertiary: isDarkMode ? '#636366' : '#aaa',
    botMessageBg: isDarkMode ? '#3a3a3c' : '#f5f6fa',
    botMessageText: isDarkMode ? '#fff' : '#444',
    inputFieldBg: isDarkMode ? '#1c1c1e' : '#fff',
    inputFieldBorder: isDarkMode ? '#3a3a3c' : '#eee',
    placeBorder: isDarkMode ? '#3a3a3c' : '#eaeaea',
    placeBackground: isDarkMode ? '#2c2c2e' : '#fff'
  };

  // 대화 메시지 상태 관리
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      text: `안녕하세요! MAPro 챗봇입니다. 🏪

원하시는 매장을 찾아드릴게요!

📝 입력 예시:
• "강남구 분위기좋은 카페"
• "판교 24시간 편의점" 

💡 팁: 지역 + 특성 + 매장종류 순으로 입력하시면 
        더 정확한 결과를 얻을 수 있어요!`, 
      timestamp: getCurrentTime() 
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const pendingRef = useRef(null);

  // 드래그 초기화
  useEffect(() => {
    setPos({ right: 100, bottom: 112 });
    const id = requestAnimationFrame(() => setAnimateIn(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // 스크롤 하단 고정
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 드래그 시작
  const beginDrag = (clientX, clientY) => {
    const panelEl = panelRef.current;
    if (!panelEl) return;
    const containerW = window.innerWidth;
    const containerH = window.innerHeight;
    dragStateRef.current = {
      startX: clientX,
      startY: clientY,
      startRight: pos.right,
      startBottom: pos.bottom,
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

  // 드래그 이벤트 처리
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (clientX, clientY) => {
      const { startX, startY, startRight, startBottom, containerW, containerH } = dragStateRef.current;
      const dx = startX - clientX; // right는 반대 방향
      const dy = startY - clientY; // bottom도 반대 방향
      let nextRight = startRight + dx;
      let nextBottom = startBottom + dy;
      
      // 경계 제한
      const maxRight = Math.max(0, containerW - PANEL_WIDTH);
      const maxBottom = Math.max(0, containerH - PANEL_HEIGHT);
      nextRight = Math.min(Math.max(0, nextRight), maxRight);
      nextBottom = Math.min(Math.max(0, nextBottom), maxBottom);
      
      setPos({ right: nextRight, bottom: nextBottom });
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

  // 메시지 전송 핸들러
  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [
      ...prev,
      { role: 'user', text: userText, timestamp: getCurrentTime() }
    ]);
    setInput("");

    // 백엔드로 전송
    try {
      const response = await fetch('http://34.64.120.99:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }
      const data = await response.json();

      // 지역 선택 플로우: 안내 말풍선 없이 후보 버튼만 표시
      if (data.action === 'choose_location' && Array.isArray(data.candidates) && data.candidates.length > 1) {
        pendingRef.current = data.pending || null;
        setMessages(prev => [
          ...prev,
          { type: 'location_candidates', candidates: data.candidates, timestamp: getCurrentTime() }
        ]);
        return;
      }

      const nextMessages = [
        { role: 'bot', text: data.reply, timestamp: getCurrentTime() }
      ];
      if (Array.isArray(data.places) && data.places.length > 0) {
        const placeNames = data.places.slice(0, 5).map(p => p.name).filter(Boolean);
        if (placeNames.length > 0) {
          nextMessages.push({ type: 'places', places: placeNames, timestamp: getCurrentTime() });
        }
      }
      setMessages(prev => [
        ...prev,
        ...nextMessages
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: '백엔드와 통신 중 오류가 발생했어요.', timestamp: getCurrentTime() }
      ]);
      console.error('Chat API error:', err);
    }
  };

  const handleChooseLocation = async (selected) => {
    try {
      const response = await fetch('http://34.64.120.99:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input || ' ', selected_location: selected, pending: pendingRef.current })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP ${response.status}`);
      }
      const data = await response.json();

      const nextMessages = [
        { role: 'bot', text: data.reply, timestamp: getCurrentTime() }
      ];
      if (Array.isArray(data.places) && data.places.length > 0) {
        const placeNames = data.places.slice(0, 5).map(p => p.name).filter(Boolean);
        if (placeNames.length > 0) {
          nextMessages.push({ type: 'places', places: placeNames, timestamp: getCurrentTime() });
        }
      }
      setMessages(prev => [
        ...prev,
        ...nextMessages
      ]);
      pendingRef.current = null;
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: '백엔드와 통신 중 오류가 발생했어요.', timestamp: getCurrentTime() }
      ]);
      console.error('Chat API error (choose_location):', err);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div
      ref={panelRef}
      style={{
        width: PANEL_WIDTH,
        height: PANEL_HEIGHT,
        background: theme.background,
        borderRadius: '24px',
        boxShadow: isDarkMode 
          ? '0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)'
          : '0 16px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'fixed',
        right: pos.right,
        bottom: pos.bottom,
        zIndex: 1100,
        userSelect: isDragging ? 'none' : 'auto',
        transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        transform: animateIn ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        opacity: animateIn ? 1 : 0,
        cursor: isDragging ? 'grabbing' : 'default',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      {/* 드래그 가능한 상단 프로필/로고 */}
      <div 
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          display:'flex', 
          alignItems:'center', 
          padding:'20px 20px 16px 20px', 
          borderBottom:`1px solid ${theme.headerBorder}`,
          cursor: isDragging ? 'grabbing' : 'grab',
          background: theme.background
        }}
      >
        <div style={{
          width: 44, 
          height: 44, 
          borderRadius: '50%', 
          background: 'linear-gradient(135deg, #6c5ce7 0%, #764ba2 100%)',
          marginRight: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(108, 92, 231, 0.2)'
        }}>
          <div style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: '16px',
            letterSpacing: '0.5px'
          }}>M</div>
        </div>
        <div style={{flex:1}}>
          <div style={{
            fontWeight: 700, 
            color: theme.textPrimary, 
            fontSize: '17px', 
            letterSpacing: '0.3px',
            marginBottom: '2px'
          }}>MAPro</div>
          <div style={{
            fontSize: '12px', 
            color: theme.textSecondary, 
            cursor: 'pointer',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={e => e.target.style.color = isDarkMode ? '#fff' : '#6c5ce7'}
          onMouseLeave={e => e.target.style.color = theme.textSecondary}
          >회사정보 보기 &gt;</div>
        </div>
        <button 
          onClick={onClose} 
          style={{
            background: 'none', 
            border: 'none', 
            fontSize: 20, 
            color: theme.textSecondary, 
            cursor: 'pointer', 
            marginLeft: 8,
            width: 32,
            height: 32,
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.target.style.background = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={e => {
            e.target.style.background = 'none';
            e.target.style.transform = 'scale(1)';
          }}
          aria-label="챗봇 닫기"
        >✕</button>
      </div>

      {/* 본문: 대화 메시지 */}
      <div style={{
        flex: 1, 
        padding: '20px', 
        overflowY: 'auto', 
        display: 'flex', 
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((msg, idx) => (
          msg.type === 'places' ? (
            <div key={idx} style={{ marginBottom: 8 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: 6
                }}
              >
                <div
                  style={{
                    background: theme.placeBackground,
                    border: `1px solid ${theme.placeBorder}`,
                    borderRadius: 16,
                    padding: '14px 16px',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    minWidth: 200,
                    maxWidth: '85%'
                  }}
                >
                  {msg.places.map((place, index) => (
                    <div 
                      key={index}
                      style={{
                        fontSize: '14px', 
                        color: '#6c5ce7',
                        fontWeight: 600, 
                        marginBottom: index === msg.places.length - 1 ? 0 : 6, 
                        cursor: 'pointer', 
                        textDecoration: 'none',
                        padding: '2px 0',
                        borderRadius: '4px',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => onShowPlacesOnMap && onShowPlacesOnMap(msg.places)}
                      onMouseEnter={e => {
                        e.target.style.textDecoration = 'underline';
                        e.target.style.backgroundColor = isDarkMode ? 'rgba(108,92,231,0.1)' : 'rgba(108,92,231,0.05)';
                      }}
                      onMouseLeave={e => {
                        e.target.style.textDecoration = 'none';
                        e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      📍 {place}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                fontSize: '11px', 
                color: theme.textTertiary, 
                marginLeft: '6px',
                opacity: 0.7
              }}>
                {msg.timestamp}
              </div>
            </div>
          ) : msg.type === 'location_candidates' ? (
            <div key={idx} style={{ marginBottom: 10 }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 8, 
                alignItems: 'flex-start',
                marginBottom: 8
              }}>
                {msg.candidates.map((cand, index) => (
                  <button
                    key={index}
                    onClick={() => handleChooseLocation(cand)}
                    style={{
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: 10,
                      background: 'linear-gradient(135deg, #6c5ce7 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '18px',
                      padding: '12px 18px',
                      fontSize: '14px',
                      fontWeight: 600,
                      letterSpacing: '0.3px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(108, 92, 231, 0.25)',
                      transform: 'translateZ(0)',
                      transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      WebkitTapHighlightColor: 'transparent',
                      maxWidth: '280px',
                      justifyContent: 'flex-start'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(108, 92, 231, 0.35)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(108, 92, 231, 0.25)';
                    }}
                    onMouseDown={e => {
                      e.currentTarget.style.transform = 'translateY(0) scale(0.98)';
                    }}
                    onMouseUp={e => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{
                      filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
                      flexShrink: 0
                    }}>
                      <path 
                        d="M12 21s-7-7.582-7-12a7 7 0 1 1 14 0c0 4.418-7 12-7 12z" 
                        fill="rgba(255,255,255,0.9)"
                      />
                      <circle cx="12" cy="9" r="3" fill="#6c5ce7" />
                    </svg>
                    <span style={{ 
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{cand}</span>
                  </button>
                ))}
              </div>
              <div style={{
                fontSize: '11px', 
                color: theme.textTertiary, 
                marginLeft: '6px',
                opacity: 0.7
              }}>
                {msg.timestamp}
              </div>
            </div>
          ) : (
            <div key={idx} style={{ marginBottom: 10 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 6
                }}
              >
                <div
                  style={{
                    maxWidth: msg.role === 'user' ? '80%' : '85%',
                    background: msg.role === 'user' 
                      ? 'linear-gradient(135deg, #6c5ce7 0%, #764ba2 100%)' 
                      : theme.botMessageBg,
                    color: msg.role === 'user' ? '#fff' : theme.botMessageText,
                    borderRadius: msg.role === 'user' ? '20px 20px 6px 20px' : '20px 20px 20px 6px',
                    padding: '12px 18px',
                    fontSize: '14px',
                    fontWeight: msg.role === 'user' ? 500 : 400,
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    boxShadow: msg.role === 'user' 
                      ? '0 3px 12px rgba(108,92,231,0.2)' 
                      : '0 2px 8px rgba(0,0,0,0.06)',
                    textAlign: 'left',
                    lineHeight: 1.5,
                    border: msg.role === 'user' 
                      ? 'none' 
                      : `1px solid ${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`
                  }}
                >
                  {msg.text}
                </div>
              </div>
              <div style={{
                fontSize: '11px', 
                color: theme.textTertiary, 
                textAlign: msg.role === 'user' ? 'right' : 'left',
                marginLeft: msg.role === 'user' ? '0' : '6px',
                marginRight: msg.role === 'user' ? '6px' : '0',
                opacity: 0.7
              }}>
                {msg.timestamp}
              </div>
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 하단 입력창 및 아이콘 */}
      <div style={{
        padding: '16px 18px', 
        borderTop: `1px solid ${theme.inputBorder}`, 
        background: theme.inputBackground, 
        display: 'flex', 
        alignItems: 'center',
        gap: '12px'
      }}>
        <input
          type="text"
          placeholder="예: 강남구 분위기좋은 카페"
          style={{
            flex: 1, 
            height: '42px', 
            borderRadius: '21px', 
            border: `1.5px solid ${theme.inputFieldBorder}`, 
            padding: '0 18px', 
            fontSize: '14px', 
            outline: 'none', 
            background: theme.inputFieldBg,
            color: theme.textPrimary,
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
          onFocus={e => {
            e.target.style.borderColor = '#6c5ce7';
            e.target.style.boxShadow = '0 0 0 3px rgba(108,92,231,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = theme.inputFieldBorder;
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
          }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
        />
        <button
          style={{
            background: input.trim() 
              ? 'linear-gradient(135deg, #6c5ce7 0%, #764ba2 100%)' 
              : isDarkMode ? '#3a3a3c' : '#f0f0f0', 
            color: input.trim() ? '#fff' : theme.textTertiary, 
            border: 'none', 
            borderRadius: '21px', 
            height: '42px', 
            padding: '0 20px', 
            fontWeight: 600, 
            fontSize: '14px',
            cursor: input.trim() ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            boxShadow: input.trim() 
              ? '0 2px 8px rgba(108,92,231,0.2)' 
              : 'none',
            transform: 'translateZ(0)'
          }}
          onMouseEnter={e => {
            if (input.trim()) {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(108,92,231,0.25)';
            }
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = input.trim() 
              ? '0 2px 8px rgba(108,92,231,0.2)' 
              : 'none';
          }}
          onClick={handleSend}
          disabled={!input.trim()}
        >전송</button>
      </div>

      {/* 하단 아이콘 영역 */}
      <div style={{
        display: 'flex', 
        justifyContent: 'space-around', 
        alignItems: 'center', 
        padding: '16px 0', 
        background: theme.background,
        borderTop: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
      }}>
        <div style={{
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          fontSize: '12px', 
          color: theme.textSecondary, 
          cursor: 'pointer',
          padding: '4px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.opacity = '0.7';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.opacity = '1';
        }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginBottom: '6px'}}>
            <path 
              d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" 
              stroke={theme.textSecondary} 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              fill="none"
            />
            <path 
              d="M9 21V12H15V21" 
              stroke={theme.textSecondary} 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span>새 세션</span>
        </div>
        <div 
          style={{
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            fontSize: '12px', 
            color: theme.textSecondary, 
            cursor: 'pointer',
            padding: '4px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginBottom: '6px'}}>
            <path 
              d="M7 10V12C7 13.1046 7.89543 14 9 14H15C16.1046 14 17 13.1046 17 12V10" 
              stroke={theme.textSecondary} 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M12 14V18M8 18H16M12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12C10.3431 12 9 10.6569 9 9C9 7.34315 10.3431 6 12 6Z" 
              stroke={theme.textSecondary} 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span>취향</span>
        </div>
        <div 
          style={{
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            fontSize: '12px', 
            color: theme.textSecondary, 
            cursor: 'pointer',
            padding: '4px',
            transition: 'all 0.2s ease',
            opacity: isDarkMode ? '0.8' : '1'
          }}
          onClick={() => setIsDarkMode(!isDarkMode)}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = isDarkMode ? '0.8' : '1';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginBottom: '6px'}}>
            <path 
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
              stroke={theme.textSecondary} 
              strokeWidth="1.5"
              fill={isDarkMode ? theme.textSecondary : 'none'}
              style={{transition: 'fill 0.3s ease'}}
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
          <span>다크모드</span>
        </div>
      </div>
    </div>
  );
}

export default ChatbotPanel;