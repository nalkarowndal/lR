import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, Mail, CheckCircle2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { api, setAuthToken } from '../services/api';
import {
  KakaoOfficialSymbol,
  GoogleOfficialSymbol,
  AppleOfficialSymbol,
  NaverOfficialSymbol,
  PaycoOfficialSymbol
} from './ui/AuthSymbols';

export const ShopLike = () => {
  const { activeOverlay, setActiveOverlay, setUser } = useApp();
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [loggingInProvider, setLoggingInProvider] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginType, setLoginType] = useState<'SOCIAL' | 'EMAIL'>('SOCIAL');

  // Social login timeout and reset reference
  const socialTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 'LOGIN' 상태일 때만 화면에 노출 및 슬라이드
  const isOpen = activeOverlay === 'LOGIN';

  // 1. 브라우저 뒤로가기(bfcache 복원), 탭 복귀, 포커스 시 소셜 로그인 대기 상태 자동 해제
  useEffect(() => {
    const handleResetLoading = () => {
      if (socialTimeoutRef.current) {
        clearTimeout(socialTimeoutRef.current);
        socialTimeoutRef.current = null;
      }
      setLoggingInProvider(null);
      setIsLoading(false);
    };

    // bfcache(Back-Forward Cache)에서 복원될 때 발생하는 표준 이벤트
    window.addEventListener('pageshow', handleResetLoading);
    // 페이지 이동 직전 상태 저장 대비 이벤트
    window.addEventListener('pagehide', handleResetLoading);
    // 탭 전환 및 브라우저 창 복귀 이벤트
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleResetLoading();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleResetLoading);

    return () => {
      if (socialTimeoutRef.current) {
        clearTimeout(socialTimeoutRef.current);
      }
      window.removeEventListener('pageshow', handleResetLoading);
      window.removeEventListener('pagehide', handleResetLoading);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleResetLoading);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 이전 로딩 잔여 상태 완전 초기화
      setLoggingInProvider(null);
      setIsLoading(false);
      setErrorMsg('');

      const timer = setTimeout(() => {
        emailInputRef.current?.focus({ preventScroll: true });
        window.scrollTo({ left: 0 });
      }, 320);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setActiveOverlay(null);
        }

        // W3C Modal Dialog Focus Trap
        if (e.key === 'Tab' && dialogRef.current) {
          const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          );
          if (focusables.length > 0) {
            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey) {
              if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
              }
            } else {
              if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      if (socialTimeoutRef.current) {
        clearTimeout(socialTimeoutRef.current);
        socialTimeoutRef.current = null;
      }
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
        // Enforce token storage destination based on '로그인 상태 유지' (rememberMe) checkbox:
        // true -> localStorage (persistent across browser restarts)
        // false -> sessionStorage (cleared immediately when browser session ends)
        setAuthToken(res.token, rememberMe);
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

  // 카카오 OAuth 2.0 실제 연동 처리
  const handleKakaoLogin = async () => {
    if (socialTimeoutRef.current) clearTimeout(socialTimeoutRef.current);
    setLoggingInProvider('카카오');
    setErrorMsg('');

    // Safety timeout: 만약 리다이렉트 지연이나 사용자가 이탈 후 복귀할 때 3.5초 후 연결 중 해제
    socialTimeoutRef.current = setTimeout(() => {
      setLoggingInProvider(null);
    }, 3500);

    try {
      // 1. 서버의 카카오 연동 설정 상태 확인
      const status = await api.getKakaoStatus();
      if (!status?.configured) {
        if (socialTimeoutRef.current) clearTimeout(socialTimeoutRef.current);
        setLoggingInProvider(null);
        showToast(
          '카카오 REST API 키 설정이 필요합니다. docs/auth/KAKAO_LOGIN_SETUP.md를 확인해주세요.',
          'info'
        );
        return;
      }

      // 2. 카카오 OAuth 인가 화면으로 리다이렉트
      const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
      window.location.href = `${apiBaseUrl}/auth/kakao`;

      // 브라우저가 외부 페이지로 전환되기 직전 또는 bfcache 저장 스냅샷 대비 1.2초 후 해제
      setTimeout(() => {
        setLoggingInProvider(null);
      }, 1200);
    } catch (err: any) {
      if (socialTimeoutRef.current) clearTimeout(socialTimeoutRef.current);
      setLoggingInProvider(null);
      setErrorMsg('카카오 로그인 서버 연결에 실패했습니다. 백엔드 서버 상태를 확인해주세요.');
    }
  };

  // 구글 OAuth 2.0 실제 연동 처리
  const handleGoogleLogin = async () => {
    if (socialTimeoutRef.current) clearTimeout(socialTimeoutRef.current);
    setLoggingInProvider('구글');
    setErrorMsg('');

    // Safety timeout: 만약 리다이렉트 지연이나 사용자가 이탈 후 복귀할 때 3.5초 후 연결 중 해제
    socialTimeoutRef.current = setTimeout(() => {
      setLoggingInProvider(null);
    }, 3500);

    try {
      // 1. 서버의 Google 연동 설정 상태 확인
      const status = await api.getGoogleStatus();
      if (!status?.configured) {
        if (socialTimeoutRef.current) clearTimeout(socialTimeoutRef.current);
        setLoggingInProvider(null);
        showToast(
          'Google Client ID 설정이 필요합니다. .env 환경변수를 확인해주세요.',
          'info'
        );
        return;
      }

      // 2. 구글 OAuth 인가 화면으로 리다이렉트
      const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
      window.location.href = `${apiBaseUrl}/auth/google`;

      // 브라우저가 외부 페이지로 전환되기 직전 또는 bfcache 저장 스냅샷 대비 1.2초 후 해제
      setTimeout(() => {
        setLoggingInProvider(null);
      }, 1200);
    } catch (err: any) {
      if (socialTimeoutRef.current) clearTimeout(socialTimeoutRef.current);
      setLoggingInProvider(null);
      setErrorMsg('Google 로그인 서버 연결에 실패했습니다. 백엔드 서버 상태를 확인해주세요.');
    }
  };

  // 기타 소셜 간편 로그인 안내 (공식 연동 준비 상태 명시)
  const handleSocialLogin = (provider: string) => {
    setLoggingInProvider(provider);
    setTimeout(() => {
      setLoggingInProvider(null);
      showToast(`${provider} 간편 로그인은 정식 서비스 런칭 시 오픈 예정입니다. 이메일 로그인을 이용해주세요.`, 'info');
    }, 450);
  };

  return (
    <div
      ref={dialogRef}
      aria-modal="true"
      role="dialog"
      aria-label="간편 로그인"
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
      className={`absolute inset-0 bg-white z-[100] transition-all duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0 opacity-100 visible' : 'translate-x-full opacity-0 pointer-events-none invisible'
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
            {/* Kakao Official Button */}
            <button
              type="button"
              onClick={handleKakaoLogin}
              disabled={!!loggingInProvider}
              className="w-full bg-[#FEE500] hover:bg-[#FADA0A] active:scale-[0.99] text-black text-[15px] font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2.5 mb-3 shadow-xs transition-all disabled:opacity-50"
            >
              <KakaoOfficialSymbol className="w-5 h-5 shrink-0" />
              {loggingInProvider === '카카오' ? (
                <span className="inline-block animate-pulse">카카오 로그인 연결 중...</span>
              ) : (
                '카카오로 3초만에 계속하기'
              )}
            </button>

            {/* Google Official Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={!!loggingInProvider}
              className="w-full bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-300 text-gray-800 text-[15px] font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2.5 mb-3 shadow-xs transition-all disabled:opacity-50"
            >
              <GoogleOfficialSymbol className="w-5 h-5 shrink-0" />
              {loggingInProvider === '구글' ? (
                <span className="inline-block animate-pulse">Google 로그인 연결 중...</span>
              ) : (
                'Google로 계속하기'
              )}
            </button>

            {/* Apple Official Button */}
            <button
              type="button"
              onClick={() => handleSocialLogin('Apple')}
              disabled={!!loggingInProvider}
              className="w-full bg-white hover:bg-gray-50 active:scale-[0.99] border border-gray-900 text-black text-[15px] font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2.5 mb-6 shadow-xs transition-all disabled:opacity-50"
            >
              <AppleOfficialSymbol className="w-4 h-4 shrink-0" />
              {loggingInProvider === 'Apple' ? (
                <span className="inline-block animate-pulse">Apple 로그인 연결 중...</span>
              ) : (
                'APPLE로 계속하기'
              )}
            </button>

            {/* Sub Social Row: Naver, PAYCO, Email Switch */}
            <div className="flex items-center gap-5 mb-8">
              <button
                type="button"
                aria-label="네이버 로그인"
                title="네이버로 계속하기"
                onClick={() => handleSocialLogin('네이버')}
                disabled={!!loggingInProvider}
                className="w-12 h-12 bg-[#03C75A] hover:bg-[#02b350] active:scale-95 rounded-full flex items-center justify-center text-white shadow-xs transition disabled:opacity-50"
              >
                <NaverOfficialSymbol className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="페이코 로그인"
                title="PAYCO로 계속하기"
                onClick={() => handleSocialLogin('페이코')}
                disabled={!!loggingInProvider}
                className="w-12 h-12 bg-[#EA3323] hover:bg-[#d82a1b] active:scale-95 rounded-full flex items-center justify-center text-white shadow-xs transition disabled:opacity-50"
              >
                <PaycoOfficialSymbol className="w-5 h-5" />
              </button>
              <button
                type="button"
                aria-label="이메일 로그인 전환"
                title="이메일 로그인"
                onClick={() => setLoginType('EMAIL')}
                className="w-12 h-12 bg-[#4C51F7] hover:bg-[#3d42e0] active:scale-95 rounded-full flex items-center justify-center text-white shadow-xs transition"
              >
                <Mail size={20} />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleEmailLogin} className="w-full max-w-sm space-y-3.5 mb-6 animate-fadeIn">
            <div>
              <input
                ref={emailInputRef}
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
              <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-medium select-none">
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
