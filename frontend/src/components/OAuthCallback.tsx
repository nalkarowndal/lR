import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { GoogleOfficialSymbol, KakaoOfficialSymbol } from './ui/AuthSymbols';

export const OAuthCallback: React.FC = () => {
  const { checkUserAuth } = useApp();
  const { showToast } = useToast();
  const [status, setStatus] = useState<'PROCESSING' | 'SUCCESS' | 'ERROR'>('PROCESSING');
  const [message, setMessage] = useState('인증 정보를 안전하게 확인하는 중입니다...');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDesc = searchParams.get('error_description');

    const path = window.location.pathname.toLowerCase();
    const isGoogle = path.includes('google') || (!path.includes('kakao') && Boolean(code));
    const providerName = isGoogle ? 'Google' : '카카오';
    const providerSlug = isGoogle ? 'google' : 'kakao';

    // 1. Handle error response from provider
    if (error) {
      setStatus('ERROR');
      if (error === 'access_denied') {
        setMessage(`${providerName} 로그인이 취소되었습니다.`);
        showToast(`${providerName} 로그인이 취소되었습니다.`, 'info');
      } else {
        setMessage(`${providerName} 로그인 오류: ${errorDesc || error}`);
        showToast(`${providerName} 로그인 오류: ${errorDesc || error}`, 'error');
      }
      setTimeout(() => {
        window.history.replaceState({}, document.title, '/');
        window.location.href = '/';
      }, 1200);
      return;
    }

    // 2. Validate code & state
    if (!code || !state) {
      setStatus('ERROR');
      setMessage('인증 코드 또는 보안 State가 누락되었습니다.');
      showToast('유효하지 않은 OAuth 접근입니다.', 'error');
      setTimeout(() => {
        window.history.replaceState({}, document.title, '/');
        window.location.href = '/';
      }, 1200);
      return;
    }

    // 3. Forward to backend callback endpoint with code & state
    setMessage(`${providerName} 세션 연결 및 보안 토큰을 발급하고 있습니다...`);
    const apiBaseUrl = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
    const targetUrl = `${apiBaseUrl}/auth/${providerSlug}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;

    // Direct browser redirect to let backend set the HttpOnly lr_session cookie seamlessly
    window.location.href = targetUrl;
  }, [checkUserAuth, showToast]);

  const isKakao = window.location.pathname.toLowerCase().includes('kakao');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-gray-100 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200/80 flex items-center justify-center mb-5 shadow-2xs">
          {isKakao ? (
            <KakaoOfficialSymbol className="w-8 h-8" />
          ) : (
            <GoogleOfficialSymbol className="w-8 h-8" />
          )}
        </div>
        <h2 className="text-lg font-black text-gray-900 tracking-tight mb-2">
          {isKakao ? '카카오' : 'Google'} 간편 로그인
        </h2>
        <p className="text-xs text-gray-500 font-medium leading-relaxed mb-6">
          {message}
        </p>
        <div className="w-8 h-8 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    </div>
  );
};

