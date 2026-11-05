import React, { type ReactNode } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

interface ProtectedAdminViewProps {
  children: ReactNode;
}

export const ProtectedAdminView: React.FC<ProtectedAdminViewProps> = ({ children }) => {
  const { user, isAuthLoading, navigateTo, returnFromAdmin, setActiveOverlay } = useApp();

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-6 text-center bg-gray-900 text-white">
        <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-gray-300">관리자 인증 권한 확인 중...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[460px] p-6 text-center bg-gray-900 text-white">
        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h3 className="text-lg font-bold mb-2">관리자 인증이 필요합니다</h3>
        <p className="text-xs text-gray-400 mb-6 max-w-xs">
          관리자 대시보드는 최고관리자(ADMIN) 권한으로 로그인한 경우에만 접근할 수 있습니다.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => returnFromAdmin('SHOP_SETTINGS')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg text-xs font-bold hover:bg-gray-700 transition"
          >
            <ArrowLeft size={14} /> 설정으로 복귀
          </button>
          <button
            type="button"
            onClick={() => setActiveOverlay('LOGIN')}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/30"
          >
            <LogIn size={14} /> 관리자 로그인
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[460px] p-6 text-center bg-gray-900 text-white">
        <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mb-4">
          <ShieldAlert size={32} />
        </div>
        <h3 className="text-lg font-bold mb-2">접근 권한이 없습니다</h3>
        <p className="text-xs text-gray-400 mb-6 max-w-xs">
          현재 로그인된 계정({user.email})은 일반 회원(USER)입니다. 관리자 대시보드 진입 권한이 없습니다.
        </p>
        <button
          type="button"
          onClick={() => returnFromAdmin('SHOP_SETTINGS')}
          className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 text-gray-200 rounded-lg text-xs font-bold hover:bg-gray-700 transition"
        >
          <ArrowLeft size={14} /> 설정 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

