import React, { useEffect, useState } from 'react';
import { ChevronLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ShopLike = () => {
  const { activeOverlay, setActiveOverlay } = useApp();
  const [loggingInProvider, setLoggingInProvider] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  
  // 'LOGIN' 상태일 때만 화면에 노출 및 슬라이드
  const isOpen = activeOverlay === 'LOGIN';

  useEffect(() => {
    if (isOpen) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setActiveOverlay(null);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      setLoggingInProvider(null);
      setLoginSuccess(false);
    }
  }, [isOpen, setActiveOverlay]);

  const handleDemoLogin = (provider: string) => {
    if (loggingInProvider) return;
    setLoggingInProvider(provider);
    
    // 데모 인증 플로우 시뮬레이션
    setTimeout(() => {
      setLoggingInProvider(null);
      setLoginSuccess(true);
      setTimeout(() => {
        setActiveOverlay(null);
        setLoginSuccess(false);
      }, 700);
    }, 450);
  };

  return (
    <div 
      aria-modal="true"
      role="dialog"
      aria-label="간편 로그인"
      className={`absolute inset-0 bg-white z-[100] transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}
    >
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
        <button 
          type="button"
          aria-label="로그인 창 닫기"
          onClick={() => setActiveOverlay(null)} 
          className="p-1 -ml-1 text-black hover:text-gray-600 transition"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-xs text-gray-400 font-semibold">간편 로그인 / 가입</span>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-14 px-5 pb-10 scrollbar-hide">
        <p className="text-gray-500 text-[13px] font-semibold mb-2">명품을 경험하는 가장 쉬운 방법</p>
        <h1 className="text-4xl font-black tracking-tighter mb-10 text-gray-950">LUXURYRENTAL</h1>

        {loginSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>로그인되었습니다. 환영합니다!</span>
          </div>
        )}

        <div className="relative mb-3 flex flex-col items-center">
          <div className="bg-[#4C51F7] text-white text-xs font-bold px-3 py-2 rounded-md relative z-10 shadow-sm tracking-tight">
            지금 가입하면 첫 렌트 70% 할인!
          </div>
          <div className="absolute -bottom-1 w-2.5 h-2.5 bg-[#4C51F7] rotate-45 z-0"></div>
        </div>

        <button 
          type="button"
          onClick={() => handleDemoLogin('카카오')}
          disabled={!!loggingInProvider}
          className="w-full bg-[#FEE500] hover:bg-[#FADA0A] active:scale-[0.99] text-black text-[15px] font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 mb-3 shadow-xs transition-all disabled:opacity-50"
        >
          {loggingInProvider === '카카오' ? (
            <span className="inline-block animate-pulse">카카오 로그인 진행중...</span>
          ) : (
            '카카오로 3초만에 계속하기'
          )}
        </button>

        <button 
          type="button"
          onClick={() => handleDemoLogin('Apple')}
          disabled={!!loggingInProvider}
          className="w-full bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-900 text-black text-[15px] font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 mb-8 shadow-xs transition-all disabled:opacity-50"
        >
          {loggingInProvider === 'Apple' ? (
            <span className="inline-block animate-pulse">Apple 로그인 진행중...</span>
          ) : (
            'APPLE로 계속하기'
          )}
        </button>

        <div className="flex gap-5 mb-12">
          <button 
            type="button"
            aria-label="네이버 로그인"
            onClick={() => handleDemoLogin('네이버')}
            className="w-12 h-12 bg-[#03C75A] hover:opacity-90 active:scale-95 rounded-full flex items-center justify-center text-white font-black text-xl shadow-xs transition"
          >
            N
          </button>
          <button 
            type="button"
            aria-label="페이코 로그인"
            onClick={() => handleDemoLogin('페이코')}
            className="w-12 h-12 bg-[#EA3323] hover:opacity-90 active:scale-95 rounded-full flex items-center justify-center text-white font-black text-xl shadow-xs transition"
          >
            P
          </button>
          <button 
            type="button"
            aria-label="이메일 로그인"
            onClick={() => handleDemoLogin('이메일')}
            className="w-12 h-12 bg-[#4C51F7] hover:opacity-90 active:scale-95 rounded-full flex items-center justify-center text-white shadow-xs transition"
          >
            <Mail size={22} />
          </button>
        </div>

        <p className="text-[13px] text-gray-500">
          계정이 기억나지 않나요? <button type="button" className="font-bold underline text-gray-800 ml-1 hover:text-black">계정 찾기</button>
        </p>
      </div>
    </div>
  );
};
