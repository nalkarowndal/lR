import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Settings, Heart, ShoppingBag, Clock, PackageCheck, 
  Edit3, ShieldCheck, UserCheck, AlertCircle, Sparkles, UploadCloud, RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Modal } from './ui/Modal';
import { ProductImage } from './ui/ProductImage';
import { api } from '../services/api';

export const ShopMyPage: React.FC = () => {
  const { 
    user, setUser, goBack, navigateTo, setActiveOverlay,
    products, favorites, toggleFavorite 
  } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'FAVORITES' | 'RENTALS' | 'SELLS'>('FAVORITES');
  const [sellRequests, setSellRequests] = useState<any[]>([]);
  const [isLoadingSells, setIsLoadingSells] = useState(false);

  // Profile Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [editError, setEditError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setEditError('이미지 파일(JPG, PNG, WEBP 등)만 등록 가능합니다.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setEditError('이미지 파일 크기는 최대 2MB까지 등록 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setEditAvatar(reader.result);
        setEditError('');
        showToast('프로필 사진이 로컬에서 선택되었습니다.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  // Filter favorited products
  const favoritedProducts = products.filter(p => favorites.includes(p.id));

  // Load user's sell requests
  const loadSellRequests = async () => {
    if (!user) return;
    try {
      setIsLoadingSells(true);
      const res = await api.getMySellRequests();
      if (res?.success && Array.isArray(res.sellRequests)) {
        setSellRequests(res.sellRequests);
      }
    } catch (err) {
      console.warn('[ShopMyPage] Failed to fetch sell requests:', err);
    } finally {
      setIsLoadingSells(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSellRequests();
    }
  }, [user]);

  const openEditModal = () => {
    if (!user) return;
    setEditName(user.name || '');
    setEditPhone(user.phone || '');
    setEditAvatar(user.avatar_url || '');
    setEditError('');
    setShowEditModal(true);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setEditError('');

    if (!editName.trim()) {
      setEditError('이름을 입력해주세요.');
      return;
    }

    try {
      setIsSavingProfile(true);
      let finalAvatarUrl = editAvatar.trim();

      // If user selected a new file (data:image base64), upload real file to backend storage
      if (editAvatar.startsWith('data:image/')) {
        const uploadRes = await api.uploadMyAvatar(editAvatar);
        if (uploadRes?.success && uploadRes.avatar_url) {
          finalAvatarUrl = uploadRes.avatar_url;
        }
      } else if (!editAvatar.trim() && user.avatar_url) {
        await api.deleteMyAvatar();
        finalAvatarUrl = '';
      }

      const res = await api.updateMyProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        avatar_url: finalAvatarUrl
      });

      if (res?.success && res.profile) {
        setUser(prev => prev ? {
          ...prev,
          name: res.profile.name,
          phone: res.profile.phone,
          avatar_url: res.profile.avatar_url
        } : null);
        showToast('프로필 정보가 수정되었습니다.', 'success');
        setShowEditModal(false);
      }
    } catch (err: any) {
      setEditError(err?.message || '프로필 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSavingProfile(false);
    }
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
        <h1 className="text-base font-bold text-gray-900 tracking-tight">마이페이지</h1>
        <button
          type="button"
          onClick={() => navigateTo('SHOP_SETTINGS')}
          aria-label="설정으로 이동"
          className="p-1.5 -mr-1 text-gray-700 hover:text-black rounded-full hover:bg-gray-100 transition active:scale-95"
        >
          <Settings size={21} />
        </button>
      </header>

      {/* 2. Profile Area */}
      <div className="p-4">
        {user ? (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-gray-950 to-gray-700 text-white flex items-center justify-center font-bold text-xl shadow-md overflow-hidden shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-950 text-base">{user.name}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      user.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.role === 'ADMIN' ? '👑 관리자 계정' : '일반 회원'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                  {user.phone && <p className="text-[11px] text-gray-400 mt-0.5">{user.phone}</p>}
                </div>
              </div>
              <button
                type="button"
                onClick={openEditModal}
                className="p-2 text-gray-500 hover:text-black hover:bg-gray-50 rounded-xl transition active:scale-95 border border-gray-200/80"
                aria-label="내 정보 수정"
              >
                <Edit3 size={16} />
              </button>
            </div>

            {/* Quick Action Badges */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100 text-center">
              <button
                type="button"
                onClick={() => setActiveTab('FAVORITES')}
                className={`p-2.5 rounded-xl transition ${activeTab === 'FAVORITES' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                <p className="text-xs font-bold">좋아요</p>
                <p className="text-sm font-black mt-0.5">{favorites.length}</p>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('RENTALS')}
                className={`p-2.5 rounded-xl transition ${activeTab === 'RENTALS' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                <p className="text-xs font-bold">렌탈/주문</p>
                <p className="text-sm font-black mt-0.5">0</p>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('SELLS')}
                className={`p-2.5 rounded-xl transition ${activeTab === 'SELLS' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
              >
                <p className="text-xs font-bold">판매신청</p>
                <p className="text-sm font-black mt-0.5">{sellRequests.length}</p>
              </button>
            </div>

            {/* 관리자 계정 바로가기 배너 */}
            {user.role === 'ADMIN' && (
              <div className="mt-4 p-3.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-950">관리자 대시보드 바로가기</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('SHOP_ADMIN')}
                  className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                >
                  이동
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-black rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <UserCheck size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold">럭셔리렌탈에 오신 것을 환영합니다</h2>
                <p className="text-xs text-gray-300">로그인하고 나만의 명품 렌탈 라이프를 시작해보세요.</p>
              </div>
            </div>
            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setActiveOverlay('LOGIN')}
                className="flex-1 py-3 bg-white text-black font-bold text-xs rounded-xl hover:bg-gray-100 transition shadow-sm active:scale-95 text-center"
              >
                로그인하기
              </button>
              <button
                type="button"
                onClick={() => setActiveOverlay('REGISTER')}
                className="flex-1 py-3 bg-gray-800 text-white font-bold text-xs rounded-xl border border-gray-700 hover:bg-gray-750 transition active:scale-95 text-center"
              >
                무료 회원가입
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Tab Contents */}
      <div className="px-4">
        {/* Tab Header */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('FAVORITES')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'FAVORITES' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Heart size={15} /> 찜한 상품 ({favorites.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('RENTALS')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'RENTALS' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShoppingBag size={15} /> 이용 중인 렌탈 (0)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SELLS')}
            className={`flex items-center gap-1.5 pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
              activeTab === 'SELLS' ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <Clock size={15} /> 판매 신청 ({sellRequests.length})
          </button>
        </div>

        {/* Tab 1: Favorites */}
        {activeTab === 'FAVORITES' && (
          <div>
            {favoritedProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {favoritedProducts.map(p => (
                  <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col group">
                    <div className="relative aspect-square bg-gray-50 overflow-hidden">
                      <ProductImage 
                        src={p.image_url} 
                        alt={p.title} 
                        category={p.category as any}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => toggleFavorite(p.id)}
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-red-500 shadow-sm active:scale-90 transition"
                        aria-label="찜 취소"
                      >
                        <Heart size={16} fill="currentColor" />
                      </button>
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{p.brand}</span>
                        <h4 className="text-xs font-semibold text-gray-900 line-clamp-1 mt-0.5">{p.title}</h4>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs font-black text-gray-950">
                          {p.price.toLocaleString()}원
                          {p.type === 'RENT' && <span className="text-[10px] text-gray-400 font-normal"> /일</span>}
                        </span>
                        <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">
                          {p.type === 'RENT' ? '렌트' : '구매'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Heart size={22} />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">찜한 상품이 없습니다</h3>
                <p className="text-xs text-gray-400 mb-4">마음에 드는 상품의 하트를 눌러 위시리스트에 담아보세요.</p>
                <button
                  type="button"
                  onClick={() => navigateTo('SHOP_MAIN')}
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition active:scale-95"
                >
                  상품 둘러보기
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Rentals (Honest Empty State as instructed) */}
        {activeTab === 'RENTALS' && (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <PackageCheck size={22} />
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-1">이용 중인 렌탈 상품이 없습니다</h3>
            <p className="text-xs text-gray-400 mb-4">특별한 날, 원하는 명품을 부담 없이 렌탈하여 사용해보세요.</p>
            <button
              type="button"
              onClick={() => navigateTo('SHOP_CATEGORY')}
              className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition active:scale-95"
            >
              렌탈 상품 둘러보기
            </button>
          </div>
        )}

        {/* Tab 3: Sell Requests */}
        {activeTab === 'SELLS' && (
          <div>
            {isLoadingSells ? (
              <div className="p-8 text-center text-xs text-gray-400">판매 신청 내역 조회 중...</div>
            ) : sellRequests.length > 0 ? (
              <div className="space-y-2.5">
                {sellRequests.map((req, idx) => (
                  <div key={req.id || idx} className="bg-white rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-gray-900">{req.brand_name}</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-100">
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">접수일: {req.created_at?.split(' ')[0] || '최근'}</p>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">검수 대기중</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag size={22} />
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">신청된 판매 내역이 없습니다</h3>
                <p className="text-xs text-gray-400 mb-4">옷장에 잠자고 있는 명품을 최고가로 손쉽게 위탁 판매해보세요.</p>
                <button
                  type="button"
                  onClick={() => navigateTo('SHOP_SELL')}
                  className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition active:scale-95"
                >
                  내 상품 판매 신청하기
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Luxury Membership Banner */}
      <div className="p-4 mt-2">
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
          <h2 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-500" />
            럭셔리렌탈 프리미엄 멤버십 혜택
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="p-2.5 bg-gray-50 rounded-xl">
              <p className="font-bold text-gray-900">🛡️ 100% 정품 보증</p>
              <p className="text-[11px] text-gray-400 mt-0.5">전문 감정팀 3단계 검수</p>
            </div>
            <div className="p-2.5 bg-gray-50 rounded-xl">
              <p className="font-bold text-gray-900">✨ 안심 케어 보험</p>
              <p className="text-[11px] text-gray-400 mt-0.5">생활 스크래치 무상 케어</p>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          PROFILE EDIT MODAL
         ========================================== */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="내 프로필 정보 수정"
      >
        <form onSubmit={handleProfileSave} className="space-y-4">
          {editError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-100">
              <AlertCircle size={15} />
              <span>{editError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">이름</label>
            <input
              type="text"
              required
              value={editName}
              onChange={e => setEditName(e.target.value)}
              placeholder="이름 입력"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">연락처</label>
            <input
              type="text"
              value={editPhone}
              onChange={e => setEditPhone(e.target.value)}
              placeholder="010-0000-0000"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* 프로필 이미지 선택 및 미리보기 */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">프로필 사진</label>
            <div className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200/80 rounded-2xl">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                {editAvatar ? (
                  <img src={editAvatar} alt="미리보기" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-lg text-gray-500">
                    {editName ? editName.slice(0, 1).toUpperCase() : 'U'}
                  </span>
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarFileChange} 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-black hover:bg-gray-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <UploadCloud size={14} />
                    <span>사진 업로드</span>
                  </button>
                  {editAvatar && (
                    <button
                      type="button"
                      onClick={() => setEditAvatar('')}
                      className="px-2.5 py-1.5 border border-gray-300 hover:bg-gray-200/70 text-gray-700 rounded-lg text-xs font-medium transition flex items-center gap-1"
                    >
                      <RotateCcw size={12} />
                      <span>기본값</span>
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400">JPG, PNG, WEBP 최대 2MB</p>
              </div>
            </div>

            <div className="mt-2.5">
              <input
                type="text"
                value={editAvatar}
                onChange={e => setEditAvatar(e.target.value)}
                placeholder="또는 이미지 URL 직접 입력 (선택)"
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSavingProfile}
              className="flex-1 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition disabled:opacity-50"
            >
              {isSavingProfile ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
