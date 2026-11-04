import React, { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// 1. Context Providers
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';

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
  const { currentView, userSettings } = useApp();

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
