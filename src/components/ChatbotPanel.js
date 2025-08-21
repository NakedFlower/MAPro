import React, { useState, useRef, useEffect } from 'react';

function ChatbotPanel({ onClose }) {
  // 대화 메시지 상태 관리
  const [messages, setMessages] = useState([
    { role: 'bot', text: '“운정점의 약국 알려줘” 처럼 채팅창에 입력해 주세요.' },
    { role: 'bot', text: '현재 강동석님께서 취향 중 <b style="color:#fc9090">공부카페</b>를(을) 선호해요.' },
    { role: 'user', text: '25일에 관련한 강남구 근처 공부카페 찾아줘' },
    { role: 'bot', text: '강동석님께서 <b style="color:#2357dd">7월 25일</b>에 관련한 강남구 근처 공부카페를 찾는군요!' },
    { role: 'bot', type: 'places', places: ['패스트파이브 강남점', '어라운드랩', '트라이브드'] },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  // 스크롤 하단 고정
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', text: input }
    ]);
    // 임시 챗봇 응답 (실제 서버 연동 시 이 부분 수정)
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'bot', text: '챗봇의 임시 답변입니다.' }
      ]);
    }, 700);
    setInput("");
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div
      style={{
        width: 500,
        height: 600,
        background: '#fff',
        borderRadius: '28px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'fixed',
        right: 100,
        bottom: 112,
        zIndex: 1100
      }}
    >
      {/* 상단 프로필/로고 */}
      <div style={{display:'flex', alignItems:'center', padding:'22px 22px 10px 22px', borderBottom:'1px solid #f3f3f3'}}>
        <div style={{width:44, height:44, borderRadius:'50%', background:'#f3f3f3', marginRight:14}}></div>
        <div style={{flex:1}}>
          <div style={{fontWeight:800, color:'#3b3b3b', fontSize:'18px', letterSpacing:'.2px'}}>MAPro</div>
          <div style={{fontSize:'12px', color:'#bcbcbc', marginTop:2, cursor:'pointer'}}>회사정보 보기 &gt;</div>
        </div>
        <button onClick={onClose} style={{background:'none', border:'none', fontSize:22, color:'#bcbcbc', cursor:'pointer', marginLeft:8}} aria-label="챗봇 닫기">✕</button>
      </div>
      {/* 본문: 대화 메시지 */}
      <div style={{flex:1, padding:'22px 22px 0 22px', overflowY:'auto', display:'flex', flexDirection:'column'}}>
        {messages.map((msg, idx) => (
          msg.type === 'places' ? (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'flex-start',
                marginBottom: 8
              }}
            >
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #eaeaea',
                  borderRadius: 12,
                  padding: '12px 14px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  minWidth: 180
                }}
              >
                <div style={{fontSize:'13px', color:'#2357dd', fontWeight:600, marginBottom:4, cursor:'pointer', textDecoration:'underline'}}>{msg.places[0]}</div>
                <div style={{fontSize:'13px', color:'#2357dd', fontWeight:600, marginBottom:4, cursor:'pointer', textDecoration:'underline'}}>{msg.places[1]}</div>
                <div style={{fontSize:'13px', color:'#2357dd', fontWeight:600, marginBottom:0, cursor:'pointer', textDecoration:'underline'}}>{msg.places[2]}</div>
              </div>
            </div>
          ) : (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 8
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  background: msg.role === 'user' ? '#2357dd' : '#f5f6fa',
                  color: msg.role === 'user' ? '#fff' : '#444',
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
                dangerouslySetInnerHTML={{ __html: msg.text }}
              />
            </div>
          )
        ))}
        <div ref={messagesEndRef} />
        <div style={{fontSize:'12px', color:'#bcbcbc', margin:'8px 0 0 2px'}}>장소명을 입력해보세요.</div>
      </div>
      {/* 하단 입력창 및 아이콘 */}
      <div style={{padding:'14px 18px', borderTop:'1px solid #f3f3f3', background:'#fafafd', display:'flex', alignItems:'center'}}>
        <input
          type="text"
          placeholder="장소명을 입력하세요..."
          style={{flex:1, height:'38px', borderRadius:'18px', border:'1px solid #eee', padding:'0 14px', fontSize:'14px', outline:'none', background:'#fff'}}
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
      <div style={{display:'flex', justifyContent:'center', alignItems:'center', gap:32, padding:'10px 0 12px 0', background:'#fafafd'}}>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', fontSize:'11px', color:'#bcbcbc', cursor:'pointer'}}>
          {/* 집 아이콘 */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 10.5L11 4L19 10.5" stroke="#bcbcbc" strokeWidth="2"/><rect x="6.5" y="12" width="9" height="6" rx="2" stroke="#bcbcbc" strokeWidth="2"/></svg>
          홈
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', fontSize:'11px', color:'#bcbcbc', cursor:'pointer'}}>
          {/* 설정(톱니바퀴) 아이콘 */}
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="3.5" stroke="#bcbcbc" strokeWidth="2"/><path d="M11 2v2M11 18v2M4.22 4.22l1.42 1.42M16.36 16.36l1.42 1.42M2 11h2M18 11h2M4.22 17.78l1.42-1.42M16.36 5.64l1.42-1.42" stroke="#bcbcbc" strokeWidth="2"/></svg>
          설정
        </div>
      </div>
    </div>
  );
}

export default ChatbotPanel;
