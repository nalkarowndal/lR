import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// 1. Context Providers
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';

// 2. Component Imports
import { ShopMain } from './components/ShopMain';
import { ShopCategory } from './components/ShopCategory';
import { ShopSell } from './components/ShopSell';
import { ShopAdmin } from './components/ShopAdmin';
import { RecruitApp } from './components/RecruitApp';
import { ShopSearch } from './components/ShopSearch';
import { ShopLike } from './components/ShopLike';
import { ShopRegister } from './components/ShopRegister';
import { ShopPasswordReset } from './components/ShopPasswordReset';

// 3. Main Router
export const MainRouter = () => {
  const { currentView } = useApp();

  // 관리자 화면일 때는 PC, 태블릿, 모바일 해상도에 맞춰 화면 전체(100%)를 유연하게 활용
  if (currentView === 'SHOP_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-100 w-full flex flex-col">
        <ShopAdmin />
      </div>
    );
  }

  // 쇼핑몰 메인 및 기타 화면일 때는 모바일 앱 뷰(max-w-md) 유지 + 슬라이딩 오버레이 지원
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center font-sans text-gray-900">
      <div className="w-full max-w-md h-screen sm:h-[90vh] bg-white relative flex flex-col overflow-hidden shadow-2xl sm:rounded-2xl">
        
        {currentView === 'SHOP_MAIN' && <ShopMain />}
        {currentView === 'SHOP_CATEGORY' && <ShopCategory />}
        {currentView === 'SHOP_SELL' && <ShopSell />}
        {currentView === 'RECRUIT_APP' && <RecruitApp />}
        
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
