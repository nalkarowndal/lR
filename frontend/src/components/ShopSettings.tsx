import React, { useState } from 'react';
import { 
  ArrowLeft, ChevronRight, User, ShieldCheck, Bell, Sparkles, 
  HelpCircle, FileText, Lock, LogOut, CheckCircle2, AlertCircle, Info, ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Modal } from './ui/Modal';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { api } from '../services/api';

export const ShopSettings: React.FC = () => {
  const { 
    user, logoutUser, goBack, navigateTo, setActiveOverlay,
    userSettings, updateUserSettings 
  } = useApp();
  const { showToast } = useToast();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showCustomerCenterModal, setShowCustomerCenterModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);

  const handleToggle = async (key: keyof typeof userSettings) => {
    const nextVal = !userSettings[key];
    await updateUserSettings({ [key]: nextVal });
    showToast('설정이 성공적으로 저장되었습니다.', 'info');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');

    if (newPassword.length < 6) {
      setPwError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('새 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      setIsChangingPw(true);
      const res = await api.changeMyPassword({ currentPassword, newPassword });
      if (res?.success) {
        showToast('비밀번호가 성공적으로 변경되었습니다.', 'success');
        setShowPasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPwError(err?.message || '비밀번호 변경 중 오류가 발생했습니다.');
    } finally {
      setIsChangingPw(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setShowLogoutConfirm(false);
    showToast('안전하게 로그아웃되었습니다.', 'info');
    navigateTo('SHOP_MAIN');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 relative pb-28 overflow-y-auto scrollbar-hide w-full">
      {/* 1. Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md z-40 px-4 py-3.5 flex items-center justify-between border-b border-gray-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <button
          type="button"
          onClick={() => goBack('SHOP_MAIN')}
          aria-label="뒤로 가기"
          className="p-1.5 -ml-1 text-gray-700 hover:text-black rounded-full hover:bg-gray-100 transition active:scale-95"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-base font-bold text-gray-900 tracking-tight">설정</h1>
        <div className="w-8" />
      </header>

      {/* 2. User Profile Summary Card */}
      <div className="p-4">
        {user ? (
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover rounded-full" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-950 text-base">{user.name}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    user.role === 'ADMIN'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {user.role === 'ADMIN' ? '👑 관리자' : '일반회원'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('SHOP_MY_PAGE')}
              className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition active:scale-95"
            >
              마이페이지
            </button>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-5 text-white shadow-md">
            <h2 className="text-sm font-bold mb-1">로그인이 필요합니다</h2>
            <p className="text-xs text-gray-300 mb-4">로그인하고 럭셔리렌탈의 프리미엄 맞춤 혜택을 설정해보세요.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setActiveOverlay('LOGIN')}
                className="px-4 py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-gray-100 transition active:scale-95 shadow-sm"
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => setActiveOverlay('REGISTER')}
                className="px-4 py-2 bg-gray-700/80 text-white text-xs font-bold rounded-xl hover:bg-gray-700 transition active:scale-95 border border-gray-600"
              >
                회원가입
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 🌟 3. 관리자 전용 대시보드 진입 메뉴 (ADMIN 역할만 노출!) */}
      {user?.role === 'ADMIN' && (
        <div className="px-4 mb-4">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-4 border border-indigo-500/30 shadow-lg text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">통합 관리자 대시보드</span>
                    <span className="text-[10px] bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 px-1.5 py-0.5 rounded font-mono">ADMIN ONLY</span>
                  </div>
                  <p className="text-xs text-indigo-200/80 mt-0.5">상품 등록, 갤러리 및 매장 구인 파트너 관리</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('SHOP_ADMIN')}
                className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/30 active:scale-95"
              >
                진입 <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Settings Sections */}
      <div className="px-4 space-y-4">
        {/* 계정 설정 */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <h2 className="px-4 pt-3.5 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">계정 및 보안</h2>
          <div className="divide-y divide-gray-50">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => navigateTo('SHOP_MY_PAGE')}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 transition"
                >
                  <div className="flex items-center gap-3 text-gray-700">
                    <User size={18} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">내 정보 관리</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 transition"
                >
                  <div className="flex items-center gap-3 text-gray-700">
                    <Lock size={18} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">비밀번호 변경</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 transition"
                >
                  <div className="flex items-center gap-3 text-red-600">
                    <LogOut size={18} />
                    <span className="text-sm font-medium">로그아웃</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteAccountModal(true)}
                  className="w-full px-4 py-3 text-left text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50/80 transition"
                >
                  회원 탈퇴 안내
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setActiveOverlay('LOGIN')}
                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 transition"
              >
                <div className="flex items-center gap-3 text-gray-700">
                  <User size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-900">로그인하기</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </section>

        {/* 알림 설정 */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <h2 className="px-4 pt-3.5 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">알림 설정</h2>
          <div className="divide-y divide-gray-50">
            <div className="px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">서비스 이용 알림</p>
                  <p className="text-xs text-gray-400">주문, 렌탈 반납일, 결제 현황 안내</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={userSettings.service_notifications}
                onClick={() => handleToggle('service_notifications')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ease-in-out cursor-pointer ${
                  userSettings.service_notifications ? 'bg-black' : 'bg-gray-200'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ease-in-out ${
                  userSettings.service_notifications ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">마케팅 및 혜택 알림</p>
                  <p className="text-xs text-gray-400">명품 신규 입고 및 할인 쿠폰 소식</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={userSettings.marketing_notifications}
                onClick={() => handleToggle('marketing_notifications')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ease-in-out cursor-pointer ${
                  userSettings.marketing_notifications ? 'bg-black' : 'bg-gray-200'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ease-in-out ${
                  userSettings.marketing_notifications ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="px-4 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">상품 재입고 알림</p>
                  <p className="text-xs text-gray-400">찜한 상품 입고 및 가격 변동 알림</p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={userSettings.product_notifications}
                onClick={() => handleToggle('product_notifications')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ease-in-out cursor-pointer ${
                  userSettings.product_notifications ? 'bg-black' : 'bg-gray-200'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ease-in-out ${
                  userSettings.product_notifications ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </section>

        {/* 화면 및 앱 설정 */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <h2 className="px-4 pt-3.5 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">화면 및 앱 설정</h2>
          <div className="divide-y divide-gray-50">
            <div className="px-4 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">화면 애니메이션 효과 줄이기</p>
                <p className="text-xs text-gray-400">부드러운 전환 효과 대신 즉시 전환합니다.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={userSettings.reduce_animations}
                onClick={() => handleToggle('reduce_animations')}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition duration-200 ease-in-out cursor-pointer ${
                  userSettings.reduce_animations ? 'bg-black' : 'bg-gray-200'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition duration-200 ease-in-out ${
                  userSettings.reduce_animations ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            <div className="px-4 py-3.5 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">앱 버전</span>
              <span className="text-xs font-mono text-gray-500">v1.2.0 (최신 버전)</span>
            </div>
          </div>
        </section>

        {/* 고객 지원 */}
        <section className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <h2 className="px-4 pt-3.5 pb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">고객 지원</h2>
          <div className="divide-y divide-gray-50">
            <button
              type="button"
              onClick={() => setShowCustomerCenterModal(true)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 transition"
            >
              <div className="flex items-center gap-3 text-gray-700">
                <HelpCircle size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-900">고객센터 안내</span>
              </div>
              <span className="text-xs text-gray-400">1544-0000</span>
            </button>

            <button
              type="button"
              onClick={() => setShowFaqModal(true)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 transition"
            >
              <div className="flex items-center gap-3 text-gray-700">
                <Info size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-900">자주 묻는 질문 (FAQ)</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>

            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50/80 transition"
            >
              <div className="flex items-center gap-3 text-gray-700">
                <FileText size={18} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-900">이용약관 및 개인정보처리방침</span>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>
        </section>
      </div>

      {/* ==========================================
          MODALS & DIALOGS
         ========================================== */}
      {/* 1. 로그아웃 컨펌 다이얼로그 */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="로그아웃 하시겠습니까?"
        message="로그아웃하시면 찜 목록 및 맞춤 추천 서비스 이용이 제한됩니다."
        confirmText="로그아웃"
        cancelText="취소"
        isDestructive={true}
        onConfirm={handleLogout}
        onClose={() => setShowLogoutConfirm(false)}
      />

      {/* 2. 비밀번호 변경 모달 */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="비밀번호 변경"
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {pwError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-100">
              <AlertCircle size={15} />
              <span>{pwError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">현재 비밀번호</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              placeholder="현재 사용 중인 비밀번호"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">새 비밀번호 (6자 이상)</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="새로운 비밀번호 입력"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">새 비밀번호 확인</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 다시 입력"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isChangingPw}
              className="flex-1 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {isChangingPw ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 3. 고객센터 안내 모달 */}
      <Modal
        isOpen={showCustomerCenterModal}
        onClose={() => setShowCustomerCenterModal(false)}
        title="럭셔리렌탈 고객센터"
      >
        <div className="space-y-4 text-xs text-gray-600 leading-relaxed">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="font-bold text-sm text-gray-900 mb-1">📞 대표 고객센터: 1544-0000</p>
            <p className="text-gray-500">운영시간: 평일 09:30 ~ 18:30 (점심시간 12:30 ~ 13:30)</p>
            <p className="text-gray-500">주말 및 공휴일: 1:1 온라인 문의 접수 운영</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-xs mb-1">카카오톡 실시간 상담</h3>
            <p>카카오톡 채널에서 &lsquo;LUXURYRENTAL&rsquo;을 검색하시면 365일 챗봇 및 전문 상담원 연결이 가능합니다.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCustomerCenterModal(false)}
            className="w-full py-2.5 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition"
          >
            확인
          </button>
        </div>
      </Modal>

      {/* 4. FAQ 모달 */}
      <Modal
        isOpen={showFaqModal}
        onClose={() => setShowFaqModal(false)}
        title="자주 묻는 질문 (FAQ)"
      >
        <div className="space-y-3 text-xs leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="font-bold text-gray-900 mb-1">Q. 렌탈 상품은 정품인가요?</p>
            <p className="text-gray-600">A. 럭셔리렌탈의 모든 상품은 전문 감정팀의 3단계 정품 인증을 통과한 100% 정품입니다. 가품 시 200% 보상 제도를 운영합니다.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="font-bold text-gray-900 mb-1">Q. 렌탈 기간 연장이나 구매 전환이 가능한가요?</p>
            <p className="text-gray-600">A. 이용 중 마이페이지에서 간편하게 일 단위 연장이 가능하며, 결제하신 렌탈료를 차감하여 구매하실 수도 있습니다.</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="font-bold text-gray-900 mb-1">Q. 사용 중 생활 오염이나 스크래치는 어떻게 되나요?</p>
            <p className="text-gray-600">A. 전 상품에 프리미엄 케어 안심 보험이 기본 적용되어 일상적인 생활 스크래치나 미세 오염은 무상 처리됩니다.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowFaqModal(false)}
            className="w-full py-2.5 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition mt-2"
          >
            닫기
          </button>
        </div>
      </Modal>

      {/* 5. 이용약관 및 개인정보처리방침 모달 */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="이용약관 및 방침"
      >
        <div className="space-y-3 text-xs text-gray-600 max-h-[60vh] overflow-y-auto leading-relaxed pr-1">
          <h3 className="font-bold text-gray-900 text-xs">제1조 (목적)</h3>
          <p>본 약관은 (주)럭셔리렌탈이 운영하는 명품 렌탈 및 커머스 플랫폼 서비스의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          <h3 className="font-bold text-gray-900 text-xs">제2조 (개인정보 보호)</h3>
          <p>회사는 이용자의 개인정보 수집 시 서비스 제공을 위하여 필요한 최소한의 대상을 수집하며, 관계 법령이 정하는 바에 따라 철저히 보호합니다.</p>
          <button
            type="button"
            onClick={() => setShowTermsModal(false)}
            className="w-full py-2.5 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition mt-2"
          >
            확인 완료
          </button>
        </div>
      </Modal>

      {/* 6. 회원탈퇴 안내 모달 */}
      <Modal
        isOpen={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        title="회원 탈퇴 안내"
      >
        <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
          <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 flex items-start gap-2">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <span>현재 이용 중인 렌탈 상품이나 진행 중인 판매 신청이 있는 경우 탈퇴가 제한될 수 있습니다.</span>
          </div>
          <p>탈퇴 시 등록된 찜 목록, 쿠폰 및 적립금은 즉시 소멸되며 복구되지 않습니다. 전자상거래법에 의거하여 주문 및 결제 내역은 5년간 보관됩니다.</p>
          <p className="text-gray-500">회원 탈퇴 접수는 고객센터(1544-0000) 또는 1:1 상담을 통해 안전한 본인 확인 후 진행됩니다.</p>
          <button
            type="button"
            onClick={() => setShowDeleteAccountModal(false)}
            className="w-full py-2.5 bg-black text-white rounded-xl font-bold text-xs hover:bg-gray-800 transition"
          >
            확인
          </button>
        </div>
      </Modal>
    </div>
  );
};
