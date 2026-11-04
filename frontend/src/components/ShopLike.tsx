import React, { useEffect, useState } from 'react';
import { ChevronLeft, Mail, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { api, setAuthToken } from '../services/api';

export const ShopLike = () => {
  const { activeOverlay, setActiveOverlay, setUser } = useApp();
  const { showToast } = useToast();

  const [loggingInProvider, setLoggingInProvider] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginType, setLoginType] = useState<'SOCIAL' | 'EMAIL'>('SOCIAL');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      setErrorMsg('');
      setIsLoading(false);
    }
  }, [isOpen, setActiveOverlay]);

  // 이메일 로그인 처리
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await api.login({ email: email.trim(), password });
      if (res?.success) {
        setAuthToken(res.token);
        setUser(res.user);
        setLoginSuccess(true);
        showToast(`${res.user.name}님, 환영합니다!`, 'success');

        setTimeout(() => {
          setActiveOverlay(null);
          setLoginSuccess(false);
        }, 600);
      }
    } catch (err: any) {
      setErrorMsg(err.message || '로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 소셜 간편 로그인 (실제 데모 계정 세션 연동)
  const handleSocialLogin = async (provider: string) => {
    if (loggingInProvider) return;
    setLoggingInProvider(provider);
    setErrorMsg('');

    try {
      // 데모 편의를 위해 기본 고객 계정으로 실제 세션 생성
      const res = await api.login({
        email: 'customer@luxuryrental.com',
        password: 'luxury1234!'
      });

      if (res?.success) {
        setAuthToken(res.token);
        setUser(res.user);
        setLoginSuccess(true);
        showToast(`${provider} 간편 로그인 완료! (${res.user.name}님)`, 'success');

        setTimeout(() => {
          setActiveOverlay(null);
          setLoginSuccess(false);
          setLoggingInProvider(null);
        }, 650);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || `${provider} 로그인 연동 중 오류가 발생했습니다.`);
      setLoggingInProvider(null);
    }
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
      {/* 1. Header */}
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

      {/* 2. Scrollable Body */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center pt-8 px-5 pb-10 scrollbar-hide">
        <p className="text-gray-500 text-[13px] font-semibold mb-1.5">명품을 경험하는 가장 쉬운 방법</p>
        <h1 className="text-3xl font-black tracking-tighter mb-6 text-gray-950">LUXURYRENTAL</h1>

        {loginSuccess && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-fadeIn w-full max-w-sm justify-center">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>로그인되었습니다. 환영합니다!</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-fadeIn w-full max-w-sm">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Event Banner */}
        <div 
          onClick={() => setActiveOverlay('REGISTER')}
          className="relative mb-5 flex flex-col items-center cursor-pointer hover:scale-[1.02] transition"
        >
          <div className="bg-[#4C51F7] text-white text-xs font-bold px-3 py-2 rounded-md relative z-10 shadow-sm tracking-tight flex items-center gap-1.5">
            <span>지금 가입하면 첫 렌트 70% 할인!</span>
            <span className="underline text-[11px] font-normal">가입하기 &gt;</span>
          </div>
          <div className="absolute -bottom-1 w-2.5 h-2.5 bg-[#4C51F7] rotate-45 z-0"></div>
        </div>

        {/* Tab Selection: 간편 로그인 vs 이메일 로그인 */}
        <div className="flex w-full max-w-sm bg-gray-100 p-1 rounded-xl mb-5 text-xs font-bold">
          <button 
            type="button"
            onClick={() => setLoginType('SOCIAL')}
            className={`flex-1 py-2 rounded-lg transition ${loginType === 'SOCIAL' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'}`}
          >
            소셜 간편 로그인
          </button>
          <button 
            type="button"
            onClick={() => setLoginType('EMAIL')}
            className={`flex-1 py-2 rounded-lg transition ${loginType === 'EMAIL' ? 'bg-white text-black shadow-xs' : 'text-gray-500 hover:text-black'}`}
          >
            이메일 로그인
          </button>
        </div>

        {loginType === 'SOCIAL' ? (
          <div className="w-full max-w-sm flex flex-col items-center animate-fadeIn">
            <button 
              type="button"
              onClick={() => handleSocialLogin('카카오')}
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
              onClick={() => handleSocialLogin('Apple')}
              disabled={!!loggingInProvider}
              className="w-full bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-900 text-black text-[15px] font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 mb-6 shadow-xs transition-all disabled:opacity-50"
            >
              {loggingInProvider === 'Apple' ? (
                <span className="inline-block animate-pulse">Apple 로그인 진행중...</span>
              ) : (
                'APPLE로 계속하기'
              )}
            </button>

            <div className="flex gap-5 mb-8">
              <button 
                type="button"
                aria-label="네이버 로그인"
                onClick={() => handleSocialLogin('네이버')}
                className="w-12 h-12 bg-[#03C75A] hover:opacity-90 active:scale-95 rounded-full flex items-center justify-center text-white font-black text-xl shadow-xs transition"
              >
                N
              </button>
              <button 
                type="button"
                aria-label="페이코 로그인"
                onClick={() => handleSocialLogin('페이코')}
                className="w-12 h-12 bg-[#EA3323] hover:opacity-90 active:scale-95 rounded-full flex items-center justify-center text-white font-black text-xl shadow-xs transition"
              >
                P
              </button>
              <button 
                type="button"
                aria-label="이메일 로그인 전환"
                onClick={() => setLoginType('EMAIL')}
                className="w-12 h-12 bg-[#4C51F7] hover:opacity-90 active:scale-95 rounded-full flex items-center justify-center text-white shadow-xs transition"
              >
                <Mail size={22} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="w-full max-w-sm space-y-3.5 mb-6 animate-fadeIn">
            <div>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="아이디(이메일)"
                required
                className="w-full border border-gray-200 focus:border-gray-950 rounded-xl p-3.5 text-sm outline-none transition"
              />
            </div>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                required
                className="w-full border border-gray-200 focus:border-gray-950 rounded-xl p-3.5 pr-11 text-sm outline-none transition"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-1"
                aria-label="비밀번호 표시 토글"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 pb-1">
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-black rounded"
                />
                <span>로그인 상태 유지</span>
              </label>

              <button 
                type="button"
                onClick={() => setActiveOverlay('FORGOT_PASSWORD')}
                className="text-gray-500 hover:text-black underline font-semibold"
              >
                비밀번호 찾기
              </button>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-950 hover:bg-black active:scale-[0.99] text-white py-3.5 rounded-xl font-extrabold text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="animate-pulse">로그인 확인 중...</span>
              ) : (
                <span>로그인</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button 
                type="button"
                onClick={() => setActiveOverlay('REGISTER')}
                className="w-full border border-gray-200 hover:bg-gray-50 active:scale-[0.99] text-gray-800 py-3.5 rounded-xl font-bold text-sm transition"
              >
                이메일로 회원가입
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 flex items-center gap-3 text-[13px] text-gray-500">
          <span>계정이 기억나지 않나요?</span>
          <button 
            type="button" 
            onClick={() => setActiveOverlay('FORGOT_PASSWORD')}
            className="font-bold underline text-gray-800 hover:text-black"
          >
            계정 찾기
          </button>
        </div>
      </div>
    </div>
  );
};
