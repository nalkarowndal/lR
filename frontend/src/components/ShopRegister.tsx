import React, { useState, useEffect } from 'react';
import { ChevronLeft, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { api, setAuthToken } from '../services/api';

export const ShopRegister = () => {
  const { activeOverlay, setActiveOverlay, setUser } = useApp();
  const { showToast } = useToast();

  const isOpen = activeOverlay === 'REGISTER';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successRegistered, setSuccessRegistered] = useState(false);

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
      setErrorMsg('');
      setIsLoading(false);
      setSuccessRegistered(false);
    }
  }, [isOpen, setActiveOverlay]);

  // Password strength check
  const hasMinLen = password.length >= 6;
  const hasNum = /\d/.test(password);
  const isMatch = password && password === passwordConfirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!termsAgreed) {
      setErrorMsg('필수 이용약관 및 개인정보 수집에 동의해주세요.');
      return;
    }

    if (!hasMinLen) {
      setErrorMsg('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (!isMatch) {
      setErrorMsg('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.register({
        email: email.trim(),
        password,
        name: name.trim(),
        phone: phone.trim(),
        termsAgreed: true,
        marketingConsent
      });

      if (res?.success) {
        setSuccessRegistered(true);
        setAuthToken(res.token);
        setUser(res.user);
        showToast('회원가입이 완료되었습니다. 첫 렌트 할인 혜택이 적용됩니다!', 'success');

        setTimeout(() => {
          setActiveOverlay(null);
          setSuccessRegistered(false);
        }, 1200);
      }
    } catch (err: any) {
      setErrorMsg(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      aria-modal="true"
      role="dialog"
      aria-label="회원가입"
      className={`absolute inset-0 bg-white z-[100] transition-transform duration-300 ease-in-out flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
      }`}
    >
      {/* 1. Header */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between">
        <button 
          type="button"
          aria-label="뒤로가기"
          onClick={() => setActiveOverlay('LOGIN')} 
          className="p-1 -ml-1 text-black hover:text-gray-600 transition"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-xs text-gray-500 font-bold">회원가입</span>
        <div className="w-6" />
      </div>

      {/* 2. Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8 scrollbar-hide">
        <div className="text-center mb-8">
          <p className="text-gray-500 text-xs font-semibold mb-1.5">프리미엄 명품 라이프의 시작</p>
          <h2 className="text-2xl font-black tracking-tight text-gray-950">LUXURYRENTAL 가입</h2>
        </div>

        {successRegistered && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center animate-scaleUp">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-2">
              <Check size={24} className="stroke-[3]" />
            </div>
            <h4 className="font-extrabold text-sm text-emerald-950 mb-1">회원가입 완료!</h4>
            <p className="text-xs text-emerald-700">로그인 상태로 메인 화면으로 이동합니다.</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
            <AlertCircle size={16} className="text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              이메일 주소 <span className="text-rose-500">*</span>
            </label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@luxury.com"
              required
              className="w-full border border-gray-200 focus:border-gray-950 rounded-xl p-3.5 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              이름(또는 닉네임) <span className="text-rose-500">*</span>
            </label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              required
              className="w-full border border-gray-200 focus:border-gray-950 rounded-xl p-3.5 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              휴대폰 번호 <span className="text-gray-400 font-normal">(선택)</span>
            </label>
            <input 
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full border border-gray-200 focus:border-gray-950 rounded-xl p-3.5 text-sm outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              비밀번호 <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6자 이상 영문/숫자 조합"
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
            {password && (
              <div className="flex items-center gap-3 mt-1.5 text-[11px] font-semibold text-gray-500">
                <span className={hasMinLen ? 'text-emerald-600 font-bold' : ''}>• 6자 이상</span>
                <span className={hasNum ? 'text-emerald-600 font-bold' : ''}>• 숫자 포함</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              비밀번호 확인 <span className="text-rose-500">*</span>
            </label>
            <input 
              type={showPassword ? 'text' : 'password'}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호 재입력"
              required
              className="w-full border border-gray-200 focus:border-gray-950 rounded-xl p-3.5 text-sm outline-none transition"
            />
            {passwordConfirm && (
              <p className={`text-[11px] font-bold mt-1 ${isMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                {isMatch ? '✓ 비밀번호가 일치합니다.' : '✗ 비밀번호가 일치하지 않습니다.'}
              </p>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="pt-3 pb-2 border-t border-gray-100 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input 
                type="checkbox"
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-black rounded"
                required
              />
              <span className="text-xs text-gray-700 leading-snug">
                <span className="text-indigo-600 font-bold">[필수]</span> 이용약관 및 개인정보 수집·이용 동의
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input 
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-black rounded"
              />
              <span className="text-xs text-gray-500 leading-snug">
                [선택] 이벤트 할인 혜택 및 신상품 입고 알림 수신 동의
              </span>
            </label>
          </div>

          <button 
            type="submit"
            disabled={isLoading || successRegistered}
            className="w-full bg-gray-950 hover:bg-black active:scale-[0.98] text-white text-sm font-extrabold py-4 rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <span className="animate-pulse">가입 처리 중...</span>
            ) : (
              <span>가입 완료하고 혜택 받기</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            이미 계정이 있으신가요?{' '}
            <button 
              type="button" 
              onClick={() => setActiveOverlay('LOGIN')}
              className="font-bold underline text-gray-950 hover:text-black ml-1"
            >
              로그인하기
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
