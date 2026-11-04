import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export const ShopPasswordReset = () => {
  const { activeOverlay, setActiveOverlay } = useApp();
  const { showToast } = useToast();
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const isOpen = activeOverlay === 'FORGOT_PASSWORD';

  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus({ preventScroll: true });
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

      // Check if URL contains resetToken query param from email link
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('resetToken') || urlParams.get('token');
      if (urlToken) {
        setToken(urlToken);
        setStep('RESET');
        setSuccessMsg('이메일 재설정 링크가 확인되었습니다. 변경하실 새 비밀번호를 입력해주세요.');
      }

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      setStep('REQUEST');
      setErrorMsg('');
      setSuccessMsg('');
      setToken('');
      setNewPassword('');
    }
  }, [isOpen, setActiveOverlay]);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await api.forgotPassword(email.trim());
      if (res?.success) {
        setSuccessMsg(res.message || '등록된 이메일 계정으로 재설정 링크가 전송되었습니다.');
        if (res.resetToken) {
          setToken(res.resetToken);
        }
        setStep('RESET');
      }
    } catch (err: any) {
      setErrorMsg(err.message || '요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await api.resetPassword({
        token: token.trim(),
        newPassword
      });

      if (res?.success) {
        showToast('비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.', 'success');
        setActiveOverlay('LOGIN');
      }
    } catch (err: any) {
      setErrorMsg(err.message || '비밀번호 재설정 실패');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={dialogRef}
      aria-modal="true"
      role="dialog"
      aria-label="비밀번호 재설정"
      aria-hidden={!isOpen}
      inert={!isOpen ? true : undefined}
      className={`absolute inset-0 bg-white z-[100] transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0 visible' : 'translate-x-full pointer-events-none invisible'
      }`}
    >
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
        <button 
          type="button"
          aria-label="뒤로가기"
          onClick={() => setActiveOverlay('LOGIN')} 
          className="p-1 -ml-1 text-black hover:text-gray-600 transition"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-xs text-gray-500 font-bold">계정 찾기</span>
        <div className="w-6" />
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-10 scrollbar-hide">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-800">
            <KeyRound size={22} />
          </div>
          <h2 className="text-xl font-black text-gray-950 mb-1">비밀번호 재설정</h2>
          <p className="text-xs text-gray-500">
            {step === 'REQUEST' 
              ? '가입하신 이메일 주소를 입력하시면 재설정 토큰을 안내해 드립니다.' 
              : '인증 토큰과 변경하실 새 비밀번호를 입력해주세요.'}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {step === 'REQUEST' ? (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">이메일 주소</label>
              <input 
                ref={firstInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="가입된 이메일 입력"
                required
                className="w-full border border-gray-200 focus:border-gray-950 rounded-xl p-3.5 text-sm outline-none transition"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-950 hover:bg-black active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50"
            >
              {isLoading ? '확인 중...' : '재설정 안내 받기'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">재설정 인증 토큰</label>
              <input 
                ref={firstInputRef}
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="발급된 토큰 입력"
                required
                className="w-full border border-gray-200 focus:border-gray-950 rounded-xl p-3.5 text-sm font-mono outline-none transition"
              />
              <p className="text-[11px] text-gray-500 mt-1.5 leading-normal">
                이메일 링크로 접속하신 경우 토큰이 자동 입력됩니다. 수동 입력 시 발송된 안내 메일 또는 서버 콘솔의 인증 토큰을 입력해주세요.
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">새 비밀번호</label>
              <input 
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6자 이상 새 비밀번호"
                required
                minLength={6}
                className="w-full border border-gray-200 focus:border-gray-950 rounded-xl p-3.5 text-sm outline-none transition"
              />
            </div>
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-950 hover:bg-black active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-sm transition shadow-sm disabled:opacity-50"
            >
              {isLoading ? '변경 처리 중...' : '비밀번호 변경 완료'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => setActiveOverlay('LOGIN')}
            className="text-xs font-bold text-gray-600 hover:text-black underline"
          >
            로그인 화면으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
};

