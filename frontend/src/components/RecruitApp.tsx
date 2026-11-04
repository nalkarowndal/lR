import React, { useState } from 'react';
import { 
  Send, Upload, FileText, CheckCircle2, AlertCircle, Info
} from 'lucide-react';

export const RecruitApp = () => {
  const [role] = useState<'STORE' | 'ADMIN'>('STORE');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'request' | 'workers' | 'chat'>('dashboard');

  // 상태 데이터
  const [requests, setRequests] = useState([
    { id: 1, storeName: '강남본점', date: '2026-10-31', section: '홀 서빙', time: '10:00 - 15:00', breakTime: '30분', required: 2, hired: 1, status: '채용중' as const, partner: '' },
    { id: 2, storeName: '홍대점', date: '2026-11-01', section: '카운터', time: '12:00 - 20:00', breakTime: '60분', required: 1, hired: 0, status: '채용중' as const, partner: '김지인' }
  ]);

  const [workers] = useState([
    { id: 1, name: '김철수', phone: '010-1234-5678', exp: '홀 서빙 1년' },
    { id: 2, name: '이영희', phone: '010-8765-4321', exp: '카운터 2년' }
  ]);

  const [messages, setMessages] = useState([
    { id: 1, sender: '강남본점', text: '오늘 저녁 타임 구인 급합니다!', time: '10:30 AM', isMine: false }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [newReq, setNewReq] = useState({ storeName: '강남본점', date: '', section: '홀 서빙', time: '10:00 - 15:00', breakTime: '30분', required: 1, partner: '' });

  const [noticeModal, setNoticeModal] = useState<{ isOpen: boolean; title: string; message: string; type?: 'info' | 'success' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showNotice = (title: string, message: string, type: 'info' | 'success' = 'info') => {
    setNoticeModal({ isOpen: true, title, message, type });
  };

  const handleAddRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setRequests([...requests, { id: Date.now(), ...newReq, hired: 0, status: '채용중' }]);
    showNotice('구인 요청 등록 안내', '구인 요청이 시뮬레이션 대시보드에 정상 등록되었습니다.', 'success');
    setActiveTab('dashboard');
  };

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: '나 (매장)', text: inputMsg, time: '방금', isMine: true }]);
    setInputMsg('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans pb-16">
      {/* 🌟 통합 안내 모달 */}
      {noticeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center flex flex-col items-center animate-fadeIn">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              noticeModal.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'
            }`}>
              {noticeModal.type === 'success' ? <CheckCircle2 size={24} /> : <Info size={24} />}
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-2">{noticeModal.title}</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed whitespace-pre-line">{noticeModal.message}</p>
            <button 
              type="button"
              onClick={() => setNoticeModal({ isOpen: false, title: '', message: '' })}
              className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs transition active:scale-95"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-xs">
        <div>
          <h1 className="font-black text-lg text-gray-900 tracking-tight flex items-center gap-1.5">
            <span className="text-indigo-600">LUXURY</span> RECRUIT
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">DEMO</span>
          </h1>
          <p className="text-[11px] text-gray-500">매장 인력 긴급 구인 및 현장 충원 관리 시스템</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-full border border-indigo-100">
            {role === 'STORE' ? '매장 매니저 모드' : '총괄 관리자 모드'}
          </span>
        </div>
      </header>

      {/* 탭 내비게이션 */}
      <div className="bg-white border-b border-gray-200 px-4 flex gap-6 text-sm font-semibold text-gray-500 overflow-x-auto scrollbar-hide">
        <button 
          onClick={() => setActiveTab('dashboard')} 
          className={`py-3 border-b-2 whitespace-nowrap ${activeTab === 'dashboard' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'}`}
        >
          실시간 현황
        </button>
        {role === 'STORE' && (
          <button 
            onClick={() => setActiveTab('request')} 
            className={`py-3 border-b-2 whitespace-nowrap ${activeTab === 'request' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'}`}
          >
            구인 요청 등록
          </button>
        )}
        <button 
          onClick={() => setActiveTab('workers')} 
          className={`py-3 border-b-2 whitespace-nowrap ${activeTab === 'workers' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'}`}
        >
          근무자 인재풀
        </button>
        <button 
          onClick={() => setActiveTab('chat')} 
          className={`py-3 border-b-2 whitespace-nowrap ${activeTab === 'chat' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent hover:text-gray-900'}`}
        >
          실시간 소통
        </button>
      </div>

      {/* 본문 콘텐츠 */}
      <main className="p-4 max-w-4xl mx-auto w-full flex-1">
        
        {/* 실시간 현황 탭 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-sm text-gray-900">당일 현장 인력 충원 현황</h2>
                <p className="text-xs text-gray-500 mt-0.5">매장별 실시간 구인 요청 건을 모니터링하고 배치합니다.</p>
              </div>
              {role === 'STORE' && (
                <button 
                  onClick={() => setActiveTab('request')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition"
                >
                  + 긴급 구인 요청
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-center">
                <span className="text-xs text-gray-400 font-semibold">총 구인 요청</span>
                <p className="text-xl sm:text-2xl font-black text-gray-900 mt-1">{requests.length} 건</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-center">
                <span className="text-xs text-gray-400 font-semibold">진행중 (채용중)</span>
                <p className="text-xl sm:text-2xl font-black text-orange-500 mt-1">{requests.filter(r => r.status === '채용중').length} 건</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs text-center">
                <span className="text-xs text-gray-400 font-semibold">충원 완료</span>
                <p className="text-xl sm:text-2xl font-black text-green-600 mt-1">{requests.filter(r => r.hired >= r.required).length} 건</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
              <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={18} className="text-indigo-600" /> 
                {role === 'STORE' ? '우리 매장 구인 신청 및 충원 현황 명단' : '전체 35개 매장 구인 요청 실시간 접수 리스트'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {requests.map(req => (
                  <div key={req.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">{req.status}</span>
                        <span className="font-extrabold text-sm text-gray-900">{req.storeName}</span>
                        <span className="text-xs text-gray-500">| {req.section}</span>
                      </div>
                      <p className="text-xs text-gray-600">일정: {req.date} ({req.time} / 휴게 {req.breakTime})</p>
                      {req.partner && <p className="text-xs text-indigo-600 font-semibold mt-1">지인파트너: {req.partner}</p>}
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div>
                        <span className="text-[10px] text-gray-400">충원 인원: </span>
                        <span className="font-black text-sm text-indigo-600">{req.hired} / {req.required} 명</span>
                      </div>
                      {role === 'ADMIN' ? (
                        <button 
                          onClick={() => showNotice('채용 결과 처리 안내', '채용 심사 및 합격 통보 기능은 관리자 콘솔 연동 모듈에서 지원됩니다.', 'info')} 
                          className="bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xs"
                        >
                          채용 결과 등록
                        </button>
                      ) : (
                        <button 
                          onClick={() => showNotice('TO 변경 요청 안내', '미충원 인원 TO 변경 요청이 관리자 전용 대시보드로 전달되었습니다.', 'success')} 
                          className="bg-white border border-gray-300 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-100"
                        >
                          TO 변경요청
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 구인 요청 작성 탭 */}
        {activeTab === 'request' && role === 'STORE' && (
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs max-w-2xl mx-auto w-full">
            <h3 className="font-bold text-base text-gray-900 mb-1">신규 구인 요청 작성</h3>
            <p className="text-xs text-gray-500 mb-6">날짜, 근무시간, 파트 및 필요 인원을 선택하여 입력하면 담당자 화면에 즉시 접수됩니다.</p>
            <form onSubmit={handleAddRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">매장 선택</label>
                <select value={newReq.storeName} onChange={e => setNewReq({...newReq, storeName: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 text-sm">
                  <option value="강남본점">강남본점</option>
                  <option value="홍대점">홍대점</option>
                  <option value="잠실점">잠실점</option>
                  <option value="성수점">성수점</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">근무 날짜</label>
                  <input type="date" value={newReq.date} onChange={e => setNewReq({...newReq, date: e.target.value})} required className="w-full border border-gray-300 rounded-xl p-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">파트 (섹션)</label>
                  <select value={newReq.section} onChange={e => setNewReq({...newReq, section: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 text-sm">
                    <option value="홀 서빙">홀 서빙</option>
                    <option value="카운터">카운터</option>
                    <option value="주방 보조">주방 보조</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">출퇴근 시간</label>
                  <input type="text" value={newReq.time} onChange={e => setNewReq({...newReq, time: e.target.value})} placeholder="예: 10:00 - 15:00" className="w-full border border-gray-300 rounded-xl p-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">휴게 시간</label>
                  <input type="text" value={newReq.breakTime} onChange={e => setNewReq({...newReq, breakTime: e.target.value})} placeholder="예: 30분" className="w-full border border-gray-300 rounded-xl p-3 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">필요 인원</label>
                  <input type="number" min="1" value={newReq.required} onChange={e => setNewReq({...newReq, required: Number(e.target.value)})} className="w-full border border-gray-300 rounded-xl p-3 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">지인파트너 등록</label>
                  <input type="text" value={newReq.partner} onChange={e => setNewReq({...newReq, partner: e.target.value})} placeholder="추천 지인 이름" className="w-full border border-gray-300 rounded-xl p-3 text-sm" />
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-xs hover:bg-indigo-700 mt-4 transition active:scale-95">
                구인 요청 즉시 등록
              </button>
            </form>
          </div>
        )}

        {/* 근무자 DB 탭 */}
        {activeTab === 'workers' && (
          <div className="space-y-4 max-w-4xl mx-auto w-full">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-gray-900">근무자 DB 관리</h3>
                <p className="text-xs text-gray-500">인재 풀을 관리하고 선별된 인원에게 단체 문자를 발송합니다.</p>
              </div>
              <button 
                onClick={() => showNotice('근무자 등록 안내', '신규 근무자 등록은 ShopAdmin 관리자 모드에서 데이터베이스와 직접 동기화됩니다.', 'info')} 
                className="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs hover:bg-indigo-700 transition"
              >
                + 근무자 등록
              </button>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-gray-500">등록된 인재 ({workers.length}명)</span>
                <button 
                  onClick={() => showNotice('단체 문자 발송 안내', `선택된 ${workers.length}명의 인재에게 매장 구인 안내 메시지가 시뮬레이션 발송되었습니다.`, 'success')} 
                  className="text-xs bg-gray-900 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-black transition"
                >
                  <Send size={12} /> 선택 대상 단체 문자 발송
                </button>
              </div>
              {workers.map(w => (
                <div key={w.id} className="p-3 border border-gray-100 rounded-xl flex justify-between items-center bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="rounded text-indigo-600" />
                    <div>
                      <span className="font-bold text-sm text-gray-900">{w.name}</span>
                      <span className="text-xs text-gray-500 ml-2">({w.phone})</span>
                    </div>
                  </div>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-1 rounded-md">{w.exp}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 실시간 채팅 탭 */}
        {activeTab === 'chat' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs flex flex-col h-[500px] max-w-4xl mx-auto w-full overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <span className="font-bold text-sm text-gray-800">실시간 소통 채널</span>
              <span className="text-xs text-emerald-600 font-bold">● 연결됨</span>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.isMine ? 'items-end' : 'items-start'}`}>
                  <span className="text-[10px] text-gray-500 mb-1">{m.sender} · {m.time}</span>
                  <div className={`p-3 rounded-2xl text-xs max-w-xs ${m.isMine ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100 flex gap-2">
              <input 
                type="text" 
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="채널 메시지를 입력하세요..." 
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-600"
              />
              <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-2 rounded-xl">
                <Send size={18} />
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
