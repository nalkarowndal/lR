import { D22Sell as EngravedAdminHandshake, D22PlusCircle as EngravedAdminPlus, D22Refresh as EngravedAdminRefresh, D22ShoppingBag as EngravedBagIcon, D22Profile as EngravedProfileCrest } from './icons/BoutiqueD22Icons';
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  EngravedShieldAdmin } from './ui/LuxuryIcons';

export const ShopAdmin = () => {
  const { 
    navigateTo,
    returnFromAdmin,
    products, setProducts, 
    requests, setRequests, 
    messages, setMessages, 
    workerDB: workers, setWorkerDB: setWorkers,
    isBackendConnected
  } = useApp();

  const [mainTab, setMainTab] = useState<'SHOP' | 'RECRUIT' | 'SELL_REQUESTS'>('RECRUIT');
  const [role, setRole] = useState<'STORE' | 'ADMIN'>('STORE');
  const [recruitTab, setRecruitTab] = useState<'dashboard' | 'request' | 'workers' | 'chat'>('dashboard');
  const [adminSellRequests, setAdminSellRequests] = useState<any[]>([]);
  const [isLoadingSells, setIsLoadingSells] = useState(false);

  // 글래스모피즘 커스텀 팝업 상태 관리
  const [modal, setModal] = useState<{ isOpen: boolean; title: string; message: string; onConfirm?: () => void }>({
    isOpen: false,
    title: '',
    message: ''
  });

  // 신규 근무자 등록 모달 상태
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [newWorkerForm, setNewWorkerForm] = useState({
    name: '',
    phone: '',
    exp: '매장 관리 1년'
  });

  // 엑셀 구인현황 업로드 모달 상태
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelFileName, setExcelFileName] = useState<string | null>(null);
  const [excelFileSize, setExcelFileSize] = useState<string | null>(null);
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  // 상점 상품 검색 및 필터 상태
  const [shopSearchQuery, setShopSearchQuery] = useState('');
  const [shopTypeFilter, setShopTypeFilter] = useState<'ALL' | 'RENT' | 'BUY'>('ALL');

  // 상품 갤러리 관리 모달 상태
  const [galleryProduct, setGalleryProduct] = useState<any | null>(null);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [newImagePath, setNewImagePath] = useState('');
  const [newImageAlt, setNewImageAlt] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isNewPrimary, setIsNewPrimary] = useState(false);
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('파일 형식 오류', '이미지 파일만 등록 가능합니다.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showAlert('용량 초과', '이미지 파일은 최대 5MB까지 등록 가능합니다.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewImagePath(reader.result);
        if (!newImageAlt && galleryProduct) {
          setNewImageAlt(`${galleryProduct.brand || ''} ${galleryProduct.title} 추가 룩북`);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const showAlert = (title: string, message: string, onConfirm?: () => void) => {
    setModal({ isOpen: true, title, message, onConfirm });
  };

  const closeModal = React.useCallback(() => {
    if (modal.onConfirm) modal.onConfirm();
    setModal({ isOpen: false, title: '', message: '' });
  }, [modal]);

  // ESC 키로 모달 닫기
  // Reset modals on tab transitions to prevent lingering overlays across admin views
  useEffect(() => {
    setGalleryProduct(null);
    setShowWorkerModal(false);
    setExcelModalOpen(false);
  }, [mainTab, recruitTab]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__lrCloseAdminModals = () => {
        setGalleryProduct(null);
        setShowWorkerModal(false);
        setExcelModalOpen(false);
        setModal({ isOpen: false, title: '', message: '' });
      };
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modal.isOpen) closeModal();
        if (showWorkerModal) setShowWorkerModal(false);
        if (galleryProduct) setGalleryProduct(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal.isOpen, showWorkerModal, galleryProduct, closeModal]);

  const openGalleryModal = async (prod: any) => {
    setGalleryProduct(prod);
    try {
      const res = await api.getProductImages(prod.id);
      if (res?.success) {
        setProductImages(res.data);
      }
    } catch (err) {
      console.warn('갤러리 로드 알림:', err);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryProduct || !newImagePath.trim()) return;
    setIsUploading(true);
    try {
      const isBase64 = newImagePath.startsWith('data:image/');
      const res = await api.addProductImage(galleryProduct.id, {
        imagePath: isBase64 ? undefined : newImagePath.trim(),
        fileData: isBase64 ? newImagePath.trim() : undefined,
        altText: newImageAlt.trim() || galleryProduct.title,
        isPrimary: productImages.length === 0 ? 1 : 0
      });
      if (res?.success && res.data) {
        setProductImages(prev => [...prev, res.data]);
        setNewImagePath('');
        setNewImageAlt('');
        showAlert('이미지 등록 완료', '상품 실사 이미지가 서버에 정상 업로드 및 등록되었습니다.');
      } else {
        throw new Error(res?.message || '이미지 등록 실패');
      }
    } catch (err: any) {
      showAlert('등록 실패', err.message || '이미지 등록 실패');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!galleryProduct) return;
    try {
      await api.deleteProductImage(galleryProduct.id, imageId);
      setProductImages(prev => prev.filter(img => img.id !== imageId));
      showAlert('삭제 완료', '이미지가 삭제되었습니다.');
    } catch (err: any) {
      showAlert('삭제 실패', err.message || '이미지 삭제 실패');
    }
  };

  const [inputMsg, setInputMsg] = useState('');
  const [newReq, setNewReq] = useState({ storeName: '강남본점', date: '', section: '홀 서빙', time: '10:00 - 15:00', breakTime: '30분', required: 1, partner: '' });

  // 신규 상품 등록 및 API 연동 (서버 실제 저장 검증 후 화면 반영)
  const handleAddProduct = async () => {
    try {
      const res = await api.createAdminProduct({ 
        title: '프리미엄 렌탈 신규 상품', 
        type: 'RENT', 
        price: 55000,
        brand: 'LUXURY',
        category: 'bag'
      });
      if (res?.success && res.data) {
        setProducts(prev => [...prev, {
          id: res.data.id || Date.now(),
          title: res.data.title || '프리미엄 렌탈 신규 상품',
          type: res.data.type || 'RENT',
          price: res.data.price || 55000,
          brand: res.data.brand || 'LUXURY',
          category: res.data.category || 'bag',
          image_url: res.data.image_url
        }]);
        showAlert('상품 등록 완료', '신규 상품이 데이터베이스에 정상 등록되었습니다.');
      } else {
        throw new Error(res?.message || '상품 등록에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('[Admin] Product creation failed:', err);
      showAlert('등록 실패', err.message || '서버 상품 등록 중 오류가 발생했습니다.');
    }
  };

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createRecruitRequest(newReq);
      if (res?.success && res.data) {
        setRequests(prev => [...prev, {
          id: res.data.id,
          ...newReq,
          hired: 0,
          status: '채용중' as const
        }]);
        showAlert('구인 요청 접수 완료', '구인 요청이 데이터베이스에 정상 접수되었습니다.', () => setRecruitTab('dashboard'));
      } else {
        throw new Error(res?.message || '구인 요청 등록에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('[Admin] Recruit request failed:', err);
      showAlert('접수 실패', err.message || '서버 구인 요청 저장 중 오류가 발생했습니다.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;
    const sender = role === 'ADMIN' ? '담당자' : '매장';
    const text = inputMsg.trim();
    try {
      const res = await api.createMessage({ sender, text, isMine: true });
      if (res?.success && res.data) {
        setMessages(prev => [...prev, {
          id: res.data.id,
          sender: res.data.sender,
          text: res.data.text,
          time: res.data.time,
          isMine: true
        }]);
        setInputMsg('');
      } else {
        throw new Error((res as any)?.message || '메시지 전송 실패');
      }
    } catch (err: any) {
      console.error('[Admin] Message send failed:', err);
      showAlert('전송 실패', err.message || '메시지 전송 중 오류가 발생했습니다.');
    }
  };

  const toggleWorkerCheck = (id: number) => {
    setWorkers(prev => prev.map(w => w.id === id ? { ...w, checked: !w.checked } : w));
  };

  const handleAddWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkerForm.name.trim()) return;
    try {
      const res = await api.createWorker({ 
        name: newWorkerForm.name.trim(), 
        phone: newWorkerForm.phone.trim() || '010-0000-0000', 
        exp: newWorkerForm.exp.trim() || '신규' 
      });
      if (res?.success && res.data) {
        setWorkers(prev => [...prev, {
          id: res.data.id,
          name: res.data.name,
          phone: res.data.phone,
          exp: res.data.exp,
          checked: true
        }]);
        setShowWorkerModal(false);
        setNewWorkerForm({ name: '', phone: '', exp: '매장 관리 1년' });
        showAlert('근무자 등록 완료', '신규 근무자 정보가 데이터베이스에 성공적으로 등록되었습니다.');
      } else {
        throw new Error(res?.message || '근무자 등록에 실패했습니다.');
      }
    } catch (err: any) {
      console.error('[Admin] Worker registration failed:', err);
      showAlert('등록 실패', err.message || '근무자 정보를 서버에 저장하지 못했습니다.');
    }
  };

  const loadAdminSellRequests = React.useCallback(async () => {
    try {
      setIsLoadingSells(true);
      const res = await api.getAdminSellRequests();
      if (res?.success && Array.isArray(res.data)) {
        setAdminSellRequests(res.data);
      }
    } catch (err: any) {
      console.warn('[Admin] Failed to load sell requests:', err);
    } finally {
      setIsLoadingSells(false);
    }
  }, []);

  React.useEffect(() => {
    if (mainTab === 'SELL_REQUESTS') {
      loadAdminSellRequests();
    }
  }, [mainTab, loadAdminSellRequests]);

  const handleUpdateSellStatus = async (id: number, nextStatus: string) => {
    try {
      const res = await api.updateAdminSellRequest(id, nextStatus);
      if (res?.success) {
        setAdminSellRequests(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
        showAlert('상태 변경 완료', `신청 건의 상태가 '${nextStatus}'(으)로 변경되었습니다.`);
      } else {
        throw new Error(res?.message || '상태 변경 실패');
      }
    } catch (err: any) {
      showAlert('변경 실패', err?.message || '상태 변경 중 오류가 발생했습니다.');
    }
  };

  const selectedWorkersCount = workers.filter(w => w.checked).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-black text-gray-100 flex flex-col w-full font-sans relative select-none">
      
      {/* 🌟 글래스모피즘 커스텀 팝업 모달 */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="backdrop-blur-2xl bg-zinc-900/90 border border-white/20 w-full max-w-md p-6 rounded-3xl shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4 text-white shadow-inner">
              <i className="fa-solid fa-circle-check text-xl text-emerald-400"></i>
            </div>
            <h3 className="text-lg font-black text-white mb-2">{modal.title}</h3>
            <p className="text-xs text-gray-300 mb-6 leading-relaxed whitespace-pre-line">{modal.message}</p>
            <button 
              type="button"
              onClick={closeModal} 
              className="w-full bg-white text-black hover:bg-gray-200 font-black py-3.5 rounded-xl shadow-xl transition text-sm cursor-pointer active:scale-[0.99]"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 🌟 신규 근무자 등록 모달 */}
      {showWorkerModal && (
        <div className="fixed inset-0 z-[990] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="backdrop-blur-2xl bg-zinc-900/90 border border-white/20 w-full max-w-md p-6 rounded-3xl shadow-2xl">
            <h3 className="text-lg font-black text-white mb-2">신규 근무자 등록</h3>
            <p className="text-xs text-gray-400 mb-5">인재 풀에 추가할 근무자의 인적사항을 입력하세요.</p>
            <form onSubmit={handleAddWorkerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">근무자 이름</label>
                <input 
                  type="text" 
                  value={newWorkerForm.name} 
                  onChange={e => setNewWorkerForm({...newWorkerForm, name: e.target.value})} 
                  placeholder="예: 박민수" 
                  required
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-sm text-white outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">연락처</label>
                <input 
                  type="text" 
                  value={newWorkerForm.phone} 
                  onChange={e => setNewWorkerForm({...newWorkerForm, phone: e.target.value})} 
                  placeholder="예: 010-5555-7777" 
                  required
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-sm text-white outline-none" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">담당/경력</label>
                <input 
                  type="text" 
                  value={newWorkerForm.exp} 
                  onChange={e => setNewWorkerForm({...newWorkerForm, exp: e.target.value})} 
                  placeholder="예: 카운터 1년" 
                  required
                  className="w-full bg-black/50 border border-white/15 rounded-xl p-3 text-sm text-white outline-none" 
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowWorkerModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl text-sm"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-white text-black hover:bg-gray-200 font-black py-3 rounded-xl text-sm shadow"
                >
                  등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. 최상단 글래스모피즘 헤더 */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-black/50 border-b border-white/10 shadow-xl w-full">
        <div className="w-full max-w-[1800px] mx-auto px-6 lg:px-12 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/10 border border-white/10 shadow-inner flex items-center justify-center">
              <EngravedShieldAdmin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg tracking-tight text-white">LUXURY RENTAL</h1>
                {isBackendConnected && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                    API 연동됨
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-medium">통합 관리자 센터</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl backdrop-blur-sm">
              <button 
                type="button"
                onClick={() => setMainTab('SHOP')} 
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mainTab === 'SHOP' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <EngravedBagIcon className="w-3.5 h-3.5" /> 쇼핑몰 관리
              </button>
              <button 
                type="button"
                onClick={() => setMainTab('RECRUIT')} 
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mainTab === 'RECRUIT' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <EngravedProfileCrest className="w-3.5 h-3.5" /> 구인/채용 관리
              </button>
              <button 
                type="button"
                onClick={() => setMainTab('SELL_REQUESTS')} 
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  mainTab === 'SELL_REQUESTS' ? 'bg-white text-black shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                <EngravedAdminHandshake className="w-3.5 h-3.5" /> 위탁 판매 관리
              </button>
            </div>

            <button 
              type="button"
              onClick={() => returnFromAdmin('SHOP_SETTINGS')} 
              className="text-xs bg-white/10 hover:bg-white/20 border border-white/10 text-white px-4 py-2.5 rounded-xl font-bold transition shadow flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <i className="fa-solid fa-mobile-screen"></i> 앱으로 돌아가기
            </button>
          </div>
        </div>
      </header>

      {/* 2. 메인 컨텐츠 영역 (최대 폭 1800px 적용) */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto p-6 lg:p-12 flex flex-col">
        
        {/* [A] 쇼핑몰 관리 탭 */}
        {mainTab === 'SHOP' && (
          <div className="space-y-6">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-black text-white">상품 등록 및 배너 관리</h2>
                  <p className="text-xs text-gray-400 mt-1">스토어에 노출되는 렌탈 및 판매 상품을 관리합니다.</p>
                </div>
                <button 
                  type="button"
                  onClick={handleAddProduct} 
                  className="flex items-center gap-2 text-xs bg-white text-black hover:bg-gray-200 px-5 py-3 rounded-xl font-extrabold shadow-lg transition cursor-pointer active:scale-95"
                >
                  <EngravedAdminPlus className="w-4 h-4" /> 신규 상품 등록
                </button>
              </div>

              {/* 검색 및 필터 바 */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                  <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                  <input
                    type="text"
                    value={shopSearchQuery}
                    onChange={(e) => setShopSearchQuery(e.target.value)}
                    placeholder="상품명 또는 브랜드 검색..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-gray-400 outline-none focus:border-white/30 transition"
                  />
                </div>
                <div className="flex gap-1.5">
                  {(['ALL', 'RENT', 'BUY'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setShopTypeFilter(type)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                        shopTypeFilter === type
                          ? 'bg-white text-black border-white shadow'
                          : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      {type === 'ALL' ? '전체' : type === 'RENT' ? '렌탈 상품' : '구매 상품'}
                    </button>
                  ))}
                </div>
              </div>

              {products.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-sm text-gray-400">등록된 상품이 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products
                    .filter(p => {
                      const matchesSearch = !shopSearchQuery.trim() || 
                        p.title.toLowerCase().includes(shopSearchQuery.toLowerCase()) || 
                        (p.brand && p.brand.toLowerCase().includes(shopSearchQuery.toLowerCase()));
                      const matchesType = shopTypeFilter === 'ALL' || p.type === shopTypeFilter;
                      return matchesSearch && matchesType;
                    })
                    .map(p => (
                    <div key={p.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 backdrop-blur-md hover:border-white/25 transition">
                      <div className="flex items-center gap-3">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.title} className="w-10 h-10 rounded-lg object-cover bg-black/40 border border-white/10 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 shrink-0">
                            <i className="fa-regular fa-image"></i>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-white/10 text-gray-200 font-bold px-2 py-0.5 rounded-md">[{p.type}]</span>
                            <span className="font-bold text-white text-sm">{p.title}</span>
                          </div>
                          <span className="font-black text-white text-sm mt-0.5 block">{p.price.toLocaleString()}원</span>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => openGalleryModal(p)}
                        className="text-xs bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-lg border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <i className="fa-solid fa-images"></i> 갤러리 관리
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 🌟 상품 이미지 갤러리 관리 모달 */}
            {galleryProduct && (
              <div 
                onClick={(e) => {
                  if (e.target === e.currentTarget) setGalleryProduct(null);
                }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md cursor-pointer"
              >
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="bg-slate-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-white animate-scaleUp cursor-default"
                >
                  <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
                    <div>
                      <span className="text-[10px] text-gray-400">상품 ID #{galleryProduct.id}</span>
                      <h3 className="font-black text-base text-white">{galleryProduct.title} 갤러리</h3>
                    </div>
                    <button 
                      type="button" 
                      data-testid="admin-gallery-close"
                      aria-label="갤러리 닫기"
                      onClick={() => setGalleryProduct(null)} 
                      className="text-gray-400 hover:text-white p-1"
                    >
                      <i className="fa-solid fa-xmark text-lg"></i>
                    </button>
                  </div>

                  {/* Image List */}
                  <div className="mb-5 max-h-56 overflow-y-auto space-y-2 pr-1">
                    {productImages.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-white/10 rounded-xl text-xs text-gray-400">
                        등록된 갤러리 이미지가 없습니다. 아래에서 이미지를 추가하세요.
                      </div>
                    ) : (
                      productImages.map(img => (
                        <div key={img.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                          <div className="flex items-center gap-3">
                            <img src={img.image_path} alt={img.alt_text} className="w-12 h-12 rounded-lg object-cover bg-black" />
                            <div>
                              <p className="text-xs font-bold text-white truncate max-w-[200px]">{img.alt_text}</p>
                              <span className="text-[10px] text-gray-400 font-mono truncate max-w-[200px] block">{img.image_path}</span>
                              {img.is_primary === 1 && (
                                <span className="text-[9px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-black">대표 이미지</span>
                              )}
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleDeleteImage(img.id)}
                            className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-white/5 text-xs font-bold"
                          >
                            삭제
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Image Form */}
                  <form onSubmit={handleAddImage} className="space-y-3 pt-3 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-gray-300">새 이미지 등록</h4>
                      <input 
                        type="file" 
                        ref={adminFileInputRef} 
                        onChange={handleGalleryFileChange} 
                        accept="image/png, image/jpeg, image/webp" 
                        className="hidden" 
                      />
                      <button 
                        type="button" 
                        onClick={() => adminFileInputRef.current?.click()}
                        className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-[11px] font-bold text-white transition flex items-center gap-1.5"
                      >
                        📁 파일에서 선택
                      </button>
                    </div>

                    {newImagePath && (
                      <div className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-xl">
                        <img src={newImagePath} alt="등록 미리보기" className="w-12 h-12 object-cover rounded-lg border border-white/20 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-gray-200 font-bold truncate">등록 대기 이미지 선택됨</p>
                          <p className="text-[10px] text-gray-400 truncate">{newImagePath.slice(0, 40)}...</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setNewImagePath('')}
                          className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
                        >
                          취소
                        </button>
                      </div>
                    )}

                    <input 
                      type="text" 
                      value={newImagePath} 
                      onChange={e => setNewImagePath(e.target.value)} 
                      placeholder="이미지 파일 경로 또는 URL (예: /assets/products/bags/sample.jpg)" 
                      required 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-white/30"
                    />
                    <input 
                      type="text" 
                      value={newImageAlt} 
                      onChange={e => setNewImageAlt(e.target.value)} 
                      placeholder="대체 텍스트 (예: 정면 룩북 사진)" 
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-white/30"
                    />

                    <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                      <input 
                        type="checkbox" 
                        checked={isNewPrimary} 
                        onChange={e => setIsNewPrimary(e.target.checked)} 
                        className="rounded accent-white" 
                      />
                      <span>대표 이미지로 설정</span>
                    </label>

                    <div className="flex gap-2">
                      <button 
                        type="submit" 
                        disabled={isUploading}
                        className="flex-1 bg-white text-black hover:bg-gray-200 py-2.5 rounded-xl font-black text-xs transition disabled:opacity-50 shadow-sm"
                      >
                        {isUploading ? '등록 처리 중...' : '이미지 추가 등록'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setGalleryProduct(null)}
                        className="px-4 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-bold text-xs transition border border-white/10"
                      >
                        닫기
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* [B] 구인/채용 관리 시스템 */}
        {mainTab === 'RECRUIT' && (
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl shadow-2xl flex flex-col flex-1 overflow-hidden">
            
            {/* 서브 헤더 및 모드 전환 */}
            <div className="border-b border-white/10 px-8 py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  role === 'STORE' ? 'bg-gradient-to-br from-indigo-500 to-blue-600' : 'bg-gradient-to-br from-amber-500 to-rose-600'
                }`}>
                  <i className={`text-xl ${role === 'STORE' ? 'fa-solid fa-store' : 'fa-solid fa-building-columns'}`}></i>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-white text-lg tracking-tight">스마트 구인·채용 관리 시스템</h3>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                      role === 'STORE' ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    }`}>
                      {role === 'STORE' ? '매장 관리자 모드' : '본사 총괄 관리자 모드'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {role === 'STORE'
                      ? '🏪 매장 관리자 모드 (강남점) — 우리 매장 구인 요청 접수 및 근무자 배치 관리'
                      : '🏢 본사 총괄 관리자 모드 — 전체 35개 매장 구인 현황 통합 관제 및 엑셀 일괄 업로드 지원'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setRole(role === 'STORE' ? 'ADMIN' : 'STORE')} 
                  className="text-xs bg-white text-black hover:bg-gray-200 px-4 py-2.5 rounded-xl font-black shadow transition cursor-pointer active:scale-95 flex items-center gap-2"
                >
                  <i className="fa-solid fa-arrows-rotate"></i>
                  {role === 'STORE' ? '본사 총괄 관리자로 전환' : '매장 관리자로 전환'}
                </button>
              </div>
            </div>

            {/* 네비게이션 탭 */}
            <div className="flex border-b border-white/10 px-8 gap-4 bg-white/[0.01]">
              <button 
                type="button"
                onClick={() => setRecruitTab('dashboard')} 
                className={`py-4 text-sm font-bold border-b-2 transition-all px-2 flex items-center gap-2 cursor-pointer ${
                  recruitTab === 'dashboard' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-table-columns"></i> 채용 현황 및 접수 리스트
              </button>
              {role === 'STORE' && (
                <button 
                  type="button"
                  onClick={() => setRecruitTab('request')} 
                  className={`py-4 text-sm font-bold border-b-2 transition-all px-2 flex items-center gap-2 cursor-pointer ${
                    recruitTab === 'request' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-file-pen"></i> 신규 구인 요청 작성
                </button>
              )}
              <button 
                type="button"
                onClick={() => setRecruitTab('workers')} 
                className={`py-4 text-sm font-bold border-b-2 transition-all px-2 flex items-center gap-2 cursor-pointer ${
                  recruitTab === 'workers' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-users-gear"></i> 근무자 DB & 단체 문자
              </button>
              <button 
                type="button"
                onClick={() => setRecruitTab('chat')} 
                className={`py-4 text-sm font-bold border-b-2 transition-all px-2 flex items-center gap-2 cursor-pointer ${
                  recruitTab === 'chat' ? 'border-white text-white' : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <i className="fa-solid fa-comments"></i> 실시간 소통 및 채팅
              </button>
            </div>

            {/* 본문 컨텐츠 (모든 탭에서 동일하게 1800px 와이드 그리드로 꽉 차게 정렬) */}
            <div className="p-8 lg:p-12 flex-1 overflow-y-auto space-y-8">
              
              {/* 1. 대시보드 탭 */}
              {recruitTab === 'dashboard' && (
                <div className="space-y-8">
                  {role === 'ADMIN' && (
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-md">
                      <div>
                        <h4 className="font-bold text-white text-sm">담당자 전용 엑셀 업로드 도구</h4>
                        <p className="text-xs text-gray-400 mt-0.5">엑셀 파일을 일괄 업로드하여 35개 매장의 구인 현황을 실시간 반영합니다.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setExcelFileName(null);
                          setExcelFileSize(null);
                          setExcelModalOpen(true);
                        }} 
                        className="bg-white text-black hover:bg-gray-200 text-xs font-extrabold px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg transition cursor-pointer"
                      >
                        <i className="fa-solid fa-file-excel"></i> 엑셀 구인현황 업로드 도구
                      </button>
                    </div>
                  )}

                  {/* 통계 카드 */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                      <span className="text-xs text-gray-400 font-semibold">총 구인 요청</span>
                      <p className="text-3xl font-black text-white mt-2">{requests.length} 건</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                      <span className="text-xs text-gray-400 font-semibold">진행중 (채용중)</span>
                      <p className="text-3xl font-black text-amber-400 mt-2">{requests.filter(r => r.status === '채용중').length} 건</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                      <span className="text-xs text-gray-400 font-semibold">충원 완료</span>
                      <p className="text-3xl font-black text-emerald-400 mt-2">{requests.filter(r => r.hired >= r.required).length} 건</p>
                    </div>
                  </div>

                  {/* 요청 리스트 */}
                  <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
                    <h4 className="font-black text-white text-base mb-6 flex items-center gap-2">
                      <i className="fa-solid fa-list-check text-gray-300"></i> 
                      {role === 'STORE' ? '우리 매장 구인 신청 및 충원 현황 명단' : '전체 35개 매장 구인 요청 실시간 접수 리스트'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {requests.map(req => (
                        <div key={req.id} className="bg-black/30 border border-white/10 p-6 rounded-2xl flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2.5 mb-2">
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">{req.status}</span>
                              <span className="font-black text-base text-white">{req.storeName}</span>
                              <span className="text-xs text-gray-400">| {req.section}</span>
                            </div>
                            <p className="text-xs text-gray-300"><i className="fa-regular fa-clock mr-1"></i> 일정: {req.date} ({req.time} / 휴게 {req.breakTime})</p>
                            {req.partner && <p className="text-xs text-indigo-300 font-semibold mt-1"><i className="fa-solid fa-user-plus mr-1"></i> 지인파트너: {req.partner}</p>}
                          </div>
                          
                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <div>
                              <span className="text-xs text-gray-400">충원 인원: </span>
                              <span className="font-black text-base text-white ml-1">{req.hired} / {req.required} 명</span>
                            </div>
                            {role === 'ADMIN' ? (
                              <button 
                                type="button"
                                onClick={() => showAlert('채용 결과 등록', '해당 근무자의 최종 채용 결과가 등록되었습니다.')} 
                                className="bg-white text-black hover:bg-gray-200 text-xs font-black px-4 py-2 rounded-xl shadow cursor-pointer transition"
                              >
                                채용 결과 등록
                              </button>
                            ) : (
                              <button 
                                type="button"
                                onClick={() => showAlert('TO 변경 요청 완료', '미충원 TO 변경 요청이 본사 담당자에게 전송되었습니다.')} 
                                className="bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                              >
                                TO 변경요청
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. 구인 요청 작성 탭 (가로폭 꽉 차게 와이드 확장) */}
              {recruitTab === 'request' && role === 'STORE' && (
                <div className="bg-white/5 border border-white/10 p-8 lg:p-12 rounded-3xl backdrop-blur-md w-full">
                  <h4 className="font-black text-white text-xl mb-2">신규 구인 요청 작성</h4>
                  <p className="text-xs text-gray-400 mb-8">날짜, 근무시간, 파트 및 필요 인원을 선택하여 입력하면 담당자 화면에 즉시 접수됩니다.</p>
                  
                  <form onSubmit={handleAddRequest} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-2">매장 선택</label>
                      <select value={newReq.storeName} onChange={e => setNewReq({...newReq, storeName: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-medium text-white outline-none">
                        <option value="강남본점" className="bg-zinc-900">강남본점</option>
                        <option value="홍대점" className="bg-zinc-900">홍대점</option>
                        <option value="잠실점" className="bg-zinc-900">잠실점</option>
                        <option value="성수점" className="bg-zinc-900">성수점</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">근무 날짜</label>
                        <input type="date" value={newReq.date} onChange={e => setNewReq({...newReq, date: e.target.value})} required className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">파트 (섹션)</label>
                        <select value={newReq.section} onChange={e => setNewReq({...newReq, section: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm font-medium text-white outline-none">
                          <option value="홀 서빙" className="bg-zinc-900">홀 서빙</option>
                          <option value="카운터" className="bg-zinc-900">카운터</option>
                          <option value="주방 보조" className="bg-zinc-900">주방 보조</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">출퇴근 시간</label>
                        <input type="text" value={newReq.time} onChange={e => setNewReq({...newReq, time: e.target.value})} placeholder="예: 10:00 - 15:00" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white outline-none placeholder-gray-600" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">휴게 시간</label>
                        <input type="text" value={newReq.breakTime} onChange={e => setNewReq({...newReq, breakTime: e.target.value})} placeholder="예: 30분" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white outline-none placeholder-gray-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">필요 인원</label>
                        <input type="number" min="1" value={newReq.required} onChange={e => setNewReq({...newReq, required: Number(e.target.value)})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-300 mb-2">지인파트너 등록 (선택)</label>
                        <input type="text" value={newReq.partner} onChange={e => setNewReq({...newReq, partner: e.target.value})} placeholder="추천 지인 이름 입력" className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white outline-none placeholder-gray-600" />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-white text-black hover:bg-gray-200 font-black py-4 rounded-xl shadow-xl transition mt-6 text-base cursor-pointer active:scale-[0.99]"
                    >
                      구인 요청 즉시 등록 및 전송
                    </button>
                  </form>
                </div>
              )}

              {/* 3. 근무자 DB 탭 */}
              {recruitTab === 'workers' && (
                <div className="space-y-6 w-full">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 backdrop-blur-md">
                    <div>
                      <h4 className="font-bold text-white text-base">근무자 DB 관리</h4>
                      <p className="text-xs text-gray-400">매장별 파트타임 및 상시 근무자 인적사항을 통합 관리합니다.</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setShowWorkerModal(true)} 
                      className="bg-white text-black hover:bg-gray-200 text-xs font-black px-5 py-3 rounded-xl shadow cursor-pointer transition active:scale-95"
                    >
                      + 근무자 등록
                    </button>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-md">
                    <div className="flex justify-between items-center mb-6">
                      <h4 className="font-bold text-white text-sm">등록된 근무자 리스트 ({workers.length}명)</h4>
                      <button 
                        type="button"
                        onClick={() => showAlert('단체 문자 발송', `선택된 ${selectedWorkersCount}명의 근무자 대상 단체 문자 발송이 완료되었습니다.`)} 
                        className="bg-white text-black hover:bg-gray-200 text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-2 shadow cursor-pointer transition active:scale-95"
                      >
                        <i className="fa-solid fa-paper-plane"></i> 선택 대상 단체 문자 발송
                      </button>
                    </div>
                    <div className="space-y-3">
                      {workers.map(w => (
                        <div key={w.id} className="bg-black/30 border border-white/10 p-4 rounded-xl flex justify-between items-center hover:border-white/20 transition">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={w.checked} 
                              onChange={() => toggleWorkerCheck(w.id)}
                              className="w-4 h-4 text-white rounded accent-white cursor-pointer" 
                            />
                            <div>
                              <span className="font-bold text-white text-sm">{w.name}</span>
                              <span className="text-xs text-gray-400 ml-2">({w.phone})</span>
                            </div>
                          </div>
                          <span className="text-xs bg-white/10 text-gray-200 font-semibold px-3 py-1 rounded-lg">{w.exp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. 실시간 채팅 탭 */}
              {recruitTab === 'chat' && (
                <div className="bg-white/5 border border-white/10 rounded-3xl shadow-2xl flex flex-col h-[650px] w-full backdrop-blur-md overflow-hidden">
                  <div className="p-5 border-b border-white/10 bg-white/[0.02] flex justify-between items-center">
                    <span className="font-extrabold text-sm text-white">실시간 소통 채널 (구인·결근·지각·조퇴 문의)</span>
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      실시간 연결됨
                    </span>
                  </div>
                  
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.map(m => (
                      <div key={m.id} className={`flex flex-col ${m.isMine ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] text-gray-400 mb-1">{m.sender} · {m.time}</span>
                        <div className={`p-4 rounded-2xl text-sm max-w-md shadow-lg ${
                          m.isMine 
                            ? 'bg-white text-black font-medium rounded-tr-none' 
                            : 'bg-white/10 border border-white/10 text-white rounded-tl-none'
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 border-t border-white/10 bg-white/[0.02] flex gap-3">
                    <input 
                      type="text" 
                      value={inputMsg} 
                      onChange={e => setInputMsg(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="메시지를 입력하세요 (예: 강남본점 조퇴 인원 발생 충원 요청)..." 
                      className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-sm text-white outline-none placeholder-gray-500"
                    />
                    <button 
                      type="button"
                      onClick={handleSendMessage} 
                      className="bg-white text-black hover:bg-gray-200 px-6 py-3.5 rounded-xl font-black flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95"
                    >
                      <i className="fa-solid fa-paper-plane"></i> 전송
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* [C] 위탁 판매 접수 관리 시스템 */}

        {/* 🌟 엑셀 일괄 업로드 및 35개 매장 TO 미리보기 모달 */}
        {excelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl text-white animate-scaleUp max-h-[90vh] overflow-y-auto scrollbar-hide">
              <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <i className="fa-solid fa-file-excel text-lg"></i>
                  </div>
                  <div>
                    <h3 className="font-black text-base text-white">35개 매장 구인 현황 엑셀 일괄 업로드</h3>
                    <p className="text-xs text-gray-400">.xlsx / .xls / .csv 파일을 업로드하여 35개 매장의 구인 TO를 일괄 동기화합니다.</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setExcelModalOpen(false)} 
                  className="text-gray-400 hover:text-white p-1"
                >
                  <i className="fa-solid fa-xmark text-lg"></i>
                </button>
              </div>

              {/* Drag & Drop Area */}
              <div 
                onClick={() => excelFileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-emerald-400/60 bg-white/[0.02] hover:bg-white/[0.04] rounded-2xl p-6 text-center cursor-pointer transition mb-5 group"
              >
                <input
                  ref={excelFileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      if (!f.name.match(/\.(xlsx|xls|csv)$/i)) {
                        showAlert('파일 형식 오류', '엑셀 파일(.xlsx, .xls) 또는 .csv 파일만 업로드할 수 있습니다.');
                        return;
                      }
                      if (f.size > 5 * 1024 * 1024) {
                        showAlert('파일 용량 초과', '5MB 이하의 엑셀 파일만 업로드 가능합니다.');
                        return;
                      }
                      setExcelFileName(f.name);
                      setExcelFileSize(`${(f.size / 1024).toFixed(1)} KB`);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-gray-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition mb-3">
                  <i className="fa-solid fa-cloud-arrow-up text-xl"></i>
                </div>
                {excelFileName ? (
                  <div>
                    <p className="text-sm font-bold text-emerald-400">선택된 파일: {excelFileName}</p>
                    <p className="text-xs text-gray-400 mt-1">용량: {excelFileSize} · 유효성 검사 완료</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-gray-200">클릭하거나 엑셀 파일을 여기로 드래그하세요</p>
                    <p className="text-xs text-gray-400 mt-1">지원 형식: .xlsx, .xls, .csv (최대 5MB)</p>
                  </div>
                )}
              </div>

              {/* 35 Store TO Preview Table */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-300">
                    파싱 데이터 미리보기 (전체 35개 지점 중 대표 5개 매장)
                  </span>
                  <span className="text-[11px] text-emerald-400 font-mono">데이터 구조 유효 ✓</span>
                </div>
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40">
                  <table className="w-full text-left text-xs text-gray-300">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-400 text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">매장명</th>
                        <th className="py-2.5 px-3">모집 직무</th>
                        <th className="py-2.5 px-3">필요/충원</th>
                        <th className="py-2.5 px-3">상태</th>
                        <th className="py-2.5 px-3">반영일자</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {[
                        { store: '강남 플래그십스토어', pos: '명품 감정 및 CS', req: 3, hired: 2, status: '채용중', date: '2026-11-05' },
                        { store: '압구정 갤러리아 본점', pos: '시계/주얼리 큐레이터', req: 2, hired: 2, status: '충원완료', date: '2026-11-05' },
                        { store: '청담 에비뉴엘점', pos: 'VIP 쇼룸 매니저', req: 2, hired: 1, status: '채용중', date: '2026-11-04' },
                        { store: '한남 쇼룸', pos: '물류 및 패키징', req: 4, hired: 3, status: '채용중', date: '2026-11-03' },
                        { store: '판교 현대백화점', pos: '대여 반납 검수원', req: 2, hired: 2, status: '충원완료', date: '2026-11-02' },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 font-bold text-white">{row.store}</td>
                          <td className="py-2.5 px-3 text-gray-400">{row.pos}</td>
                          <td className="py-2.5 px-3 font-mono">{row.hired}/{row.req}명</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              row.status === '충원완료'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {row.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-gray-500 text-[11px]">{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setExcelModalOpen(false)}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showAlert('엑셀 데이터 동기화 완료', '전체 35개 매장의 구인 TO 데이터가 실시간 데이터베이스에 일괄 적용되었습니다.');
                    setExcelModalOpen(false);
                  }}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-database"></i> 35개 매장 TO 데이터베이스 일괄 반영
                </button>
              </div>
            </div>
          </div>
        )}
        {mainTab === 'SELL_REQUESTS' && (
          <div className="backdrop-blur-xl bg-white/[0.03] border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-white/10">
              <div>
                <h3 className="font-extrabold text-white text-xl tracking-tight flex items-center gap-2">
                  <EngravedAdminHandshake className="w-5 h-5 text-amber-300" />
                  고객 위탁 판매 신청 관리 ({adminSellRequests.length}건)
                </h3>
                <p className="text-xs text-gray-400 mt-1">고객이 신청한 브랜드 명품 위탁 판매 건을 검수하고 감정 상태를 변경합니다.</p>
              </div>
              <button 
                type="button"
                onClick={loadAdminSellRequests}
                className="text-xs bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2.5 rounded-xl border border-white/10 transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <EngravedAdminRefresh className={`w-4 h-4 ${isLoadingSells ? 'animate-spin' : ''}`} /> 새로고침
              </button>
            </div>

            {isLoadingSells ? (
              <div className="py-20 text-center text-sm text-gray-400">위탁 판매 신청 내역을 불러오는 중...</div>
            ) : adminSellRequests.length === 0 ? (
              <div className="py-24 text-center border border-dashed border-white/10 rounded-2xl text-gray-400">
                <i className="fa-solid fa-inbox text-3xl mb-3 block text-gray-500"></i>
                접수된 위탁 판매 신청 내역이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-200">
                  <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase font-mono text-[11px]">
                    <tr>
                      <th className="py-3 px-4">접수번호</th>
                      <th className="py-3 px-4">신청 브랜드</th>
                      <th className="py-3 px-4">신청 고객</th>
                      <th className="py-3 px-4">연락처 / 이메일</th>
                      <th className="py-3 px-4">접수일시</th>
                      <th className="py-3 px-4">현재 상태</th>
                      <th className="py-3 px-4 text-right">상태 관리</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {adminSellRequests.map(item => (
                      <tr key={item.id} className="hover:bg-white/[0.02] transition">
                        <td className="py-4 px-4 font-mono text-gray-400">#{item.id}</td>
                        <td className="py-4 px-4 font-bold text-white text-sm">{item.brand_name}</td>
                        <td className="py-4 px-4 font-semibold text-gray-300">{item.user_name || '고객'}</td>
                        <td className="py-4 px-4 text-gray-400">
                          <div>{item.user_phone || '-'}</div>
                          <div className="text-[10px] text-gray-500">{item.user_email || ''}</div>
                        </td>
                        <td className="py-4 px-4 font-mono text-gray-400 text-[11px]">{item.created_at}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            item.status === '승인완료' || item.status === '판매승인'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : item.status === '검수중' || item.status === '전문감정중'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : item.status === '반려'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-1.5">
                          <select 
                            value={item.status}
                            onChange={(e) => handleUpdateSellStatus(item.id, e.target.value)}
                            className="bg-black/40 border border-white/20 rounded-lg px-2.5 py-1 text-xs text-white outline-none cursor-pointer"
                          >
                            <option value="접수완료" className="bg-zinc-900 text-white">접수완료</option>
                            <option value="검수중" className="bg-zinc-900 text-white">검수중</option>
                            <option value="전문감정중" className="bg-zinc-900 text-white">전문감정중</option>
                            <option value="판매승인" className="bg-zinc-900 text-white">판매승인</option>
                            <option value="반려" className="bg-zinc-900 text-white">반려</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
