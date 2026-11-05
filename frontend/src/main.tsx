import React, { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// 1. Context Providers
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider, useToast } from './context/ToastContext';

// 2. Component Imports
import { ShopMain } from './components/ShopMain';
import { ShopCategory } from './components/ShopCategory';
import { ShopSell } from './components/ShopSell';
import { ShopSettings } from './components/ShopSettings';
import { ShopMyPage } from './components/ShopMyPage';
import { ShopAdmin } from './components/ShopAdmin';
import { RecruitApp } from './components/RecruitApp';
import { ShopSearch } from './components/ShopSearch';
import { ShopLike } from './components/ShopLike';
import { ShopRegister } from './components/ShopRegister';
import { ShopPasswordReset } from './components/ShopPasswordReset';

// 3. Navigation Wrappers
import { AnimatedView } from './components/navigation/AnimatedView';
import { ProtectedAdminView } from './components/navigation/ProtectedAdminView';

// 4. Main Router
export const MainRouter = () => {
  const { currentView, userSettings, activeOverlay, checkUserAuth, setActiveOverlay } = useApp();
  const { showToast } = useToast();

  // Listen for OAuth return query parameters (?oauth=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthStatus = params.get('oauth');
    const provider = params.get('provider') || '카카오';

    if (oauthStatus) {
      // Clear query string immediately to keep URL pristine
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);

      if (oauthStatus === 'success') {
        checkUserAuth().then(user => {
          if (user) {
            showToast(`${user.name}님, ${provider} 계정으로 로그인되었습니다!`, 'success');
            setActiveOverlay(null);
          } else {
            showToast('로그인 세션 확인 중 오류가 발생했습니다. 다시 시도해주세요.', 'error');
          }
        }).catch(() => {
          showToast('로그인 세션 확인 중 오류가 발생했습니다.', 'error');
        });
      } else if (oauthStatus === 'cancelled') {
        showToast(`${provider} 로그인이 취소되었습니다.`, 'info');
      } else if (oauthStatus === 'config_required') {
        showToast('서버에 카카오 REST API 키 설정이 필요합니다. docs/auth/KAKAO_LOGIN_SETUP.md를 확인해주세요.', 'error');
      } else if (oauthStatus === 'email_conflict') {
        const email = params.get('email') || '';
        showToast(`동일한 이메일(${email})로 등록된 기존 계정이 있습니다. 이메일 로그인 후 계정을 연동해주세요.`, 'error');
      } else if (oauthStatus === 'invalid_state') {
        showToast('유효하지 않거나 만료된 요청입니다 (CSRF 검증 실패). 다시 시도해주세요.', 'error');
      } else {
        const reason = params.get('reason') || oauthStatus;
        showToast(`${provider} 로그인에 실패했습니다. (${reason})`, 'error');
      }
    }
  }, [checkUserAuth, setActiveOverlay, showToast]);

  // Sync user preference for reduced motion with body class
  useEffect(() => {
    if (userSettings?.reduce_animations) {
      document.body.classList.add('reduce-motion');
    } else {
      document.body.classList.remove('reduce-motion');
    }
  }, [userSettings?.reduce_animations]);

  // 관리자 화면일 때는 PC, 태블릿, 모바일 해상도에 맞춰 화면 전체(100%)를 유연하게 활용
  // 엄격한 세션 인가 가드(ProtectedAdminView) 적용
  if (currentView === 'SHOP_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-100 w-full flex flex-col">
        <ProtectedAdminView>
          <ShopAdmin />
        </ProtectedAdminView>
      </div>
    );
  }

  // 쇼핑몰 메인 및 기타 화면일 때는 모바일 앱 뷰(max-w-md) 유지 + 부드러운 페이지 전환 시스템
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center font-sans text-gray-900">
      <div className="w-full max-w-md h-screen sm:h-[90vh] bg-white relative flex flex-col overflow-hidden shadow-2xl sm:rounded-2xl">
        
        <div 
          className="flex-1 w-full h-full flex flex-col"
          aria-hidden={activeOverlay !== null}
          inert={activeOverlay !== null ? true : undefined}
        >
          {currentView === 'SHOP_MAIN' && (
            <AnimatedView viewKey="SHOP_MAIN">
              <ShopMain />
            </AnimatedView>
          )}

          {currentView === 'SHOP_CATEGORY' && (
            <AnimatedView viewKey="SHOP_CATEGORY">
              <ShopCategory />
            </AnimatedView>
          )}

          {currentView === 'SHOP_SELL' && (
            <AnimatedView viewKey="SHOP_SELL">
              <ShopSell />
            </AnimatedView>
          )}

          {currentView === 'SHOP_SETTINGS' && (
            <AnimatedView viewKey="SHOP_SETTINGS">
              <ShopSettings />
            </AnimatedView>
          )}

          {currentView === 'SHOP_MY_PAGE' && (
            <AnimatedView viewKey="SHOP_MY_PAGE">
              <ShopMyPage />
            </AnimatedView>
          )}

          {currentView === 'RECRUIT_APP' && (
            <AnimatedView viewKey="RECRUIT_APP">
              <RecruitApp />
            </AnimatedView>
          )}
        </div>
        
        {/* 슬라이딩 오버레이 */}
        <ShopSearch />
        <ShopLike />
        <ShopRegister />
        <ShopPasswordReset />
        
      </div>
    </div>
  );
};

createRoot(getElementByIdRoot()).render(
  <StrictMode>
    <AppProvider>
      <ToastProvider>
        <MainRouter />
      </ToastProvider>
    </AppProvider>
  </StrictMode>
);

function getElementByIdRoot() {
  return document.getElementById('root')!;
}
