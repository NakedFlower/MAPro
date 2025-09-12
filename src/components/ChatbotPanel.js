import React, { useState, useRef, useEffect } from 'react';

function ChatbotPanel({ onClose }) {
  const PANEL_WIDTH = 500;
  const PANEL_HEIGHT = 600;

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
        borderRadius: '28px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'fixed',
        right: pos.right,
        bottom: pos.bottom,
        zIndex: 1100,
        userSelect: isDragging ? 'none' : 'auto',
        transition: isDragging ? 'none' : 'opacity .22s ease, transform .22s cubic-bezier(.2,.8,.2,1)',
        transform: animateIn ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
        opacity: animateIn ? 1 : 0,
        cursor: isDragging ? 'grabbing' : 'default'
      }}
    >
      {/* 드래그 가능한 상단 프로필/로고 */}
      <div 
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        style={{
          display:'flex', 
          alignItems:'center', 
          padding:'22px 22px 10px 22px', 
          borderBottom:`1px solid ${theme.headerBorder}`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        <div style={{width:44, height:44, borderRadius:'50%', background: theme.headerBorder, marginRight:14}}></div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800, color: theme.textPrimary, fontSize:'18px', letterSpacing:'.2px'}}>MAPro</div>
          <div style={{fontSize:'12px', color: theme.textSecondary, marginTop:2, cursor:'pointer'}}>회사정보 보기 &gt;</div>
        </div>
        <button onClick={onClose} style={{background:'none', border:'none', fontSize:22, color: theme.textSecondary, cursor:'pointer', marginLeft:8}} aria-label="챗봇 닫기">✕</button>
      </div>

      {/* 본문: 대화 메시지 */}
      <div style={{flex:1, padding:'22px 22px 0 22px', overflowY:'auto', display:'flex', flexDirection:'column'}}>
        {messages.map((msg, idx) => (
          msg.type === 'places' ? (
            <div key={idx} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginBottom: 4
                }}
              >
                <div
                  style={{
                    background: theme.placeBackground,
                    border: `1px solid ${theme.placeBorder}`,
                    borderRadius: 12,
                    padding: '12px 14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    minWidth: 180
                  }}
                >
                  {msg.places.map((place, index) => (
                    <div 
                      key={index}
                      style={{
                        fontSize:'13px', 
                        color:'#2357dd', 
                        fontWeight:600, 
                        marginBottom: index === msg.places.length - 1 ? 0 : 4, 
                        cursor:'pointer', 
                        textDecoration:'underline'
                      }}
                    >
                      {place}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                fontSize:'11px', 
                color: theme.textTertiary, 
                marginLeft: '4px',
                marginTop: '2px'
              }}>
                {msg.timestamp}
              </div>
            </div>
          ) : msg.type === 'location_candidates' ? (
            <div key={idx} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {msg.candidates.map((cand, index) => (
                  <button
                    key={index}
                    onClick={() => handleChooseLocation(cand)}
                    style={{
                      display:'inline-flex', alignItems:'center', gap:8,
                      background: isDarkMode 
                        ? 'linear-gradient(180deg, #3a57e8 0%, #2747d8 100%)' 
                        : 'linear-gradient(180deg, #3b6fff 0%, #2357dd 100%)',
                      color:'#fff',
                      border:'1px solid rgba(255,255,255,0.15)',
                      borderRadius:999,
                      padding:'10px 14px',
                      fontSize:13,
                      fontWeight:700,
                      letterSpacing:'.2px',
                      cursor:'pointer',
                      boxShadow: '0 6px 18px rgba(35,87,221,0.25)',
                      transform:'translateZ(0)',
                      transition:'transform .15s ease, box-shadow .15s ease, filter .2s ease',
                      WebkitTapHighlightColor:'transparent'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 10px 24px rgba(35,87,221,0.32)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(35,87,221,0.25)';
                    }}
                    onMouseDown={e => {
                      e.currentTarget.style.transform = 'translateY(0) scale(0.99)';
                      e.currentTarget.style.filter = 'brightness(0.98)';
                    }}
                    onMouseUp={e => {
                      e.currentTarget.style.transform = 'translateY(-1px) scale(1)';
                      e.currentTarget.style.filter = 'none';
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{filter:'drop-shadow(0 1px 0 rgba(0,0,0,0.15))'}}>
                      <path d="M12 21s-7-7.582-7-12a7 7 0 1 1 14 0c0 4.418-7 12-7 12z" fill="rgba(255,255,255,0.9)"/>
                      <circle cx="12" cy="9" r="3" fill={isDarkMode ? '#1c1c1e' : '#2357dd'} />
                    </svg>
                    <span>{cand}</span>
                  </button>
                ))}
              </div>
              <div style={{
                fontSize:'11px', 
                color: theme.textTertiary, 
                marginLeft: '4px',
                marginTop: '6px'
              }}>
                {msg.timestamp}
              </div>
            </div>
          ) : (
            <div key={idx} style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: 4
                }}
              >
                <div
                  style={{
                    maxWidth: '75%',
                    background: msg.role === 'user' ? '#2357dd' : theme.botMessageBg,
                    color: msg.role === 'user' ? '#fff' : theme.botMessageText,
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '10px 16px',
                    fontSize: '14px',
                    fontWeight: msg.role === 'user' ? 600 : 400,
                    whiteSpace: 'pre-line',
                    wordBreak: 'break-word',
                    boxShadow: msg.role === 'user' ? '0 2px 8px rgba(35,87,221,0.08)' : '0 2px 8px rgba(0,0,0,0.04)',
                    textAlign: 'left',
                    lineHeight: 1.6
                  }}
                >
                  {msg.text}
                </div>
              </div>
              <div style={{
                fontSize:'11px', 
                color: theme.textTertiary, 
                textAlign: msg.role === 'user' ? 'right' : 'left',
                marginLeft: msg.role === 'user' ? '0' : '4px',
                marginRight: msg.role === 'user' ? '4px' : '0',
                marginTop: '2px'
              }}>
                {msg.timestamp}
              </div>
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 하단 입력창 및 아이콘 */}
      <div style={{padding:'14px 18px', borderTop:`1px solid ${theme.inputBorder}`, background: theme.inputBackground, display:'flex', alignItems:'center'}}>
        <input
          type="text"
          placeholder="예: 강남구 분위기좋은 카페"
          style={{
            flex:1, 
            height:'38px', 
            borderRadius:'18px', 
            border:`1px solid ${theme.inputFieldBorder}`, 
            padding:'0 14px', 
            fontSize:'14px', 
            outline:'none', 
            background: theme.inputFieldBg,
            color: theme.textPrimary
          }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleInputKeyDown}
        />
        <button
          style={{marginLeft:'8px', background:'#fc9090', color:'#fff', border:'none', borderRadius:'18px', height:'38px', padding:'0 18px', fontWeight:600, cursor:'pointer'}}
          onClick={handleSend}
        >전송</button>
      </div>

      {/* 하단 아이콘 영역 */}
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:32, padding:'10px 0 12px 0', background: theme.inputBackground}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', fontSize:'11px', color: theme.textSecondary, cursor:'pointer'}}>
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path d="M3 10.5L11 4L19 10.5" stroke={theme.textSecondary} strokeWidth="2"/>
            <rect x="6.5" y="12" width="9" height="6" rx="2" stroke={theme.textSecondary} strokeWidth="2"/>
          </svg>
          홈
        </div>
        <div 
          style={{display:'flex', flexDirection:'column', alignItems:'center', fontSize:'11px', color: theme.textSecondary, cursor:'pointer'}}
          onClick={() => setIsDarkMode(!isDarkMode)}
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path 
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" 
              stroke={theme.textSecondary} 
              strokeWidth="2"
              fill={isDarkMode ? theme.textSecondary : 'none'}
              style={{transition: 'fill 0.3s ease'}}
            />
          </svg>
          다크모드
        </div>
      </div>
    </div>
  );
}

export default ChatbotPanel;
