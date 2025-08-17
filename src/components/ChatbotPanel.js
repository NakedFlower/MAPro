import React from 'react';

function ChatbotPanel({ onClose }) {
  return (
    <div
      style={{
        width: 600,
        height: 700,
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
      {/* 본문 */}
      <div style={{flex:1, padding:'22px 22px 0 22px', overflowY:'auto', display:'flex', flexDirection:'column'}}>
        <div style={{fontWeight:700, color:'#222', fontSize:'14px', marginBottom:8}}>MAPro 매니저</div>
        <div style={{background:'#f5f6fa', borderRadius:12, padding:'8px 14px', fontSize:'13px', color:'#444', marginBottom:8}}>
          “운정점의 약국 알려줘” 처럼 채팅창에 입력해 주세요.
        </div>
        <div style={{background:'#f5f6fa', borderRadius:12, padding:'8px 14px', fontSize:'13px', color:'#444', marginBottom:8}}>
          현재 강동석님께서 취향 중 <b style={{color:'#fc9090'}}>공부카페</b>를(을) 선호해요.
        </div>
        <button style={{width:'100%', background:'#2357dd', color:'#fff', border:'none', borderRadius: '18px', fontWeight:700, fontSize:'15px', padding:'10px 0', margin:'10px 0 8px 0', cursor:'pointer'}}>25일에 관련한 강남구 근처 공부카페 찾아줘</button>
        <div style={{fontSize:'13px', color:'#444', marginBottom:8}}>
          강동석님께서 <b style={{color:'#2357dd'}}>7월 25일</b>에 관련한 강남구 근처 공부카페를 찾는군요!
        </div>
        <div style={{background:'#fff', border:'1px solid #eaeaea', borderRadius:12, padding:'12px 14px', marginBottom:8}}>
          <div style={{fontSize:'13px', color:'#2357dd', fontWeight:600, marginBottom:4, cursor:'pointer', textDecoration:'underline'}}>패스트파이브 강남점</div>
          <div style={{fontSize:'13px', color:'#2357dd', fontWeight:600, marginBottom:4, cursor:'pointer', textDecoration:'underline'}}>어라운드랩</div>
          <div style={{fontSize:'13px', color:'#2357dd', fontWeight:600, marginBottom:0, cursor:'pointer', textDecoration:'underline'}}>트라이브드</div>
        </div>
        <div style={{fontSize:'12px', color:'#bcbcbc', margin:'8px 0 0 2px'}}>장소명을 입력해보세요.</div>
      </div>
      {/* 하단 입력창 및 아이콘 */}
      <div style={{padding:'14px 18px', borderTop:'1px solid #f3f3f3', background:'#fafafd', display:'flex', alignItems:'center'}}>
        <input type="text" placeholder="장소명을 입력하세요..." style={{flex:1, height:'38px', borderRadius:'18px', border:'1px solid #eee', padding:'0 14px', fontSize:'14px', outline:'none', background:'#fff'}} />
        <button style={{marginLeft:'8px', background:'#fc9090', color:'#fff', border:'none', borderRadius:'18px', height:'38px', padding:'0 18px', fontWeight:600, cursor:'pointer'}}>전송</button>
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
