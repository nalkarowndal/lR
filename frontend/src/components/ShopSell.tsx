import React, { useState } from 'react';
import { ChevronLeft, Search, ChevronRight, Check, PlusCircle, X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const ShopSell = () => {
  const { goBack, user } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<{ ko: string; en: string } | null>(null);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [directBrandName, setDirectBrandName] = useState('');
  const [directCategory, setDirectCategory] = useState<'bag' | 'clothing' | 'shoes' | 'jewelry'>('bag');

  // 명품 위탁·판매 신청서 모달 상태
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; brand: { ko: string; en: string } | null }>({
    isOpen: false,
    brand: null
  });
  const [sellCategory, setSellCategory] = useState<'bag' | 'clothing' | 'shoes' | 'jewelry'>('bag');
  const [itemCondition, setItemCondition] = useState<'S' | 'A' | 'B'>('S');
  const [saleMethod, setSaleMethod] = useState<'CONSIGN' | 'BUYOUT'>('CONSIGN');
  const [hasGuaranteeCard, setHasGuaranteeCard] = useState(true);
  const [hasDustBag, setHasDustBag] = useState(true);
  const [hasOriginalBox, setHasOriginalBox] = useState(true);

  // 위탁 판매 접수 완료 모달 상태
  const [receiptModal, setReceiptModal] = useState<{
    isOpen: boolean;
    receiptCode: string;
    brandName: string;
    category: string;
    applicantPhone: string;
  }>({
    isOpen: false,
    receiptCode: '',
    brandName: '',
    category: '',
    applicantPhone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestPhoneError, setGuestPhoneError] = useState('');

  const brands = [
    { ko: '고야드', en: 'Goyard' },
    { ko: '구찌', en: 'Gucci' },
    { ko: '그라프', en: 'Graff' },
    { ko: '까르띠에', en: 'Cartier' },
    { ko: '끌로에', en: 'Chloe' },
    { ko: '다미아니', en: 'Damiani' },
    { ko: '더 로우', en: 'The Row' },
    { ko: '델보', en: 'Delvaux' },
    { ko: '드래곤 디퓨전', en: 'Dragon Diffusion' },
    { ko: '디젤', en: 'Diesel' },
    { ko: '로로피아나', en: 'Loro Piana' },
    { ko: '로에베', en: 'Loewe' },
  ];

  const filteredBrands = brands.filter(b => 
    b.ko.includes(searchQuery) || b.en.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectBrand = (brand: { ko: string; en: string }) => {
    setSelectedBrand(brand);
    setConfirmModal({ isOpen: true, brand });
  };

  const handleConfirmSell = async () => {
    if (!confirmModal.brand) return;
    const brand = confirmModal.brand;

    // 비회원인 경우 감정팀 회신 연락처 필수 검증
    if (!user) {
      const cleanPhone = guestPhone.trim();
      if (!cleanPhone || cleanPhone.length < 9) {
        setGuestPhoneError('감정팀의 안내 및 무료 수거 연락을 위해 연락처를 입력해주세요.');
        return;
      }
    }

    setConfirmModal({ isOpen: false, brand: null });
    setIsSubmitting(true);
    setGuestPhoneError('');

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptCode = `SELL-${todayStr}-${randSuffix}`;

    try {
      const applicantName = user ? user.name : (guestName.trim() || '고객');
      const applicantPhone = user ? (user.phone || '') : guestPhone.trim();

      await api.createSellRequest(
        brand.en === 'Custom' ? brand.ko : `${brand.ko} (${brand.en})`,
        applicantName,
        applicantPhone
      );

      setReceiptModal({
        isOpen: true,
        receiptCode,
        brandName: brand.ko,
        category: sellCategory === 'bag' ? '가방' : sellCategory === 'clothing' ? '의류' : sellCategory === 'shoes' ? '슈즈' : '시계/주얼리',
        applicantPhone: applicantPhone || '등록 연락처'
      });
      setGuestPhone('');
      setGuestName('');
    } catch (err: any) {
      setErrorModal({
        isOpen: true,
        message: err.message || '판매 신청 접수 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const name = directBrandName.trim();
    if (!name) return;
    setShowDirectModal(false);
    setSelectedBrand({ ko: name, en: 'Custom' });
    setSellCategory(directCategory);
    setConfirmModal({ isOpen: true, brand: { ko: name, en: 'Custom' } });
    setDirectBrandName('');
  };

  return (
    <div className="flex flex-col h-full bg-white select-none relative">
      {/* 🌟 1. 신규 브랜드 직접 등록 모달 */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-gray-900">신규 브랜드 직접 등록</h3>
              <button type="button" onClick={() => setShowDirectModal(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">목록에 없는 명품 브랜드명을 직접 등록하시면, 전문 감정팀 검수 후 위탁 및 매입 절차가 진행됩니다.</p>
            <form onSubmit={handleDirectRegister} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">브랜드명 (국문/영문)</label>
                <input 
                  type="text" 
                  value={directBrandName}
                  onChange={(e) => setDirectBrandName(e.target.value)}
                  placeholder="예: 발렉스트라, 모이나, 델보..." 
                  required
                  className="w-full border border-gray-300 focus:border-black rounded-xl p-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">상품 대표 카테고리</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'bag', label: '가방' },
                    { id: 'clothing', label: '의류' },
                    { id: 'shoes', label: '슈즈' },
                    { id: 'jewelry', label: '시계/주얼리' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setDirectCategory(cat.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        directCategory === cat.id
                          ? 'bg-gray-950 text-white border-gray-950'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowDirectModal(false)}
                  className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-black transition"
                >
                  신청서 작성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 2. 명품 위탁·판매 신청서 모달 */}
      {confirmModal.isOpen && confirmModal.brand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center flex flex-col items-center animate-fadeIn max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="w-11 h-11 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
              <AlertCircle size={22} />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">명품 위탁·판매 신청서</h3>
            <p className="text-xs text-gray-500 mb-3">
              <span className="font-bold text-gray-900">'{confirmModal.brand.ko} ({confirmModal.brand.en})'</span> 상품 정보를 확인해주세요.
            </p>

            {/* 품목 카테고리 선택 */}
            <div className="w-full text-left mb-3">
              <label className="text-[11px] font-bold text-gray-700 block mb-1">상품 카테고리</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'bag', label: '가방' },
                  { id: 'clothing', label: '의류' },
                  { id: 'shoes', label: '슈즈' },
                  { id: 'jewelry', label: '시계/주얼리' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSellCategory(cat.id as any)}
                    className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                      sellCategory === cat.id
                        ? 'bg-gray-950 text-white border-gray-950'
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 상품 상태 선택 */}
            <div className="w-full text-left mb-3">
              <label className="text-[11px] font-bold text-gray-700 block mb-1">상품 상태 (외관/사용감)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'S', label: 'S급 (미사용급)' },
                  { id: 'A', label: 'A급 (미세사용감)' },
                  { id: 'B', label: 'B급 (자연스런사용감)' }
                ].map(cond => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => setItemCondition(cond.id as any)}
                    className={`py-1.5 rounded-lg text-[11px] font-bold border transition ${
                      itemCondition === cond.id
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-gray-700 border-gray-200'
                    }`}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 부속품 유무 체크박스 */}
            <div className="w-full text-left mb-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100 text-[11px] space-y-1.5">
              <span className="font-bold text-gray-700 block mb-1">보유 부속품 체크</span>
              <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                <input
                  type="checkbox"
                  checked={hasGuaranteeCard}
                  onChange={(e) => setHasGuaranteeCard(e.target.checked)}
                  className="w-3.5 h-3.5 accent-black rounded"
                />
                <span>정품 보증서 / 개런티 카드</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                <input
                  type="checkbox"
                  checked={hasDustBag}
                  onChange={(e) => setHasDustBag(e.target.checked)}
                  className="w-3.5 h-3.5 accent-black rounded"
                />
                <span>오리지널 더스트백</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                <input
                  type="checkbox"
                  checked={hasOriginalBox}
                  onChange={(e) => setHasOriginalBox(e.target.checked)}
                  className="w-3.5 h-3.5 accent-black rounded"
                />
                <span>브랜드 하드케이스 / 박스</span>
              </label>
            </div>

            {/* 신청자 정보 */}
            {user ? (
              <div className="w-full bg-gray-100/70 border border-gray-200 rounded-xl p-2.5 mb-3 text-left">
                <p className="text-[11px] text-gray-500 font-medium">신청 회원</p>
                <p className="text-xs font-bold text-gray-900 mt-0.5">
                  {user.name} <span className="text-gray-500 font-normal">({user.phone || user.email})</span>
                </p>
              </div>
            ) : (
              <div className="w-full text-left space-y-2 mb-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">신청자 성명 (선택)</label>
                  <input 
                    type="text" 
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="성함 입력 (예: 홍길동)"
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl outline-none focus:border-black transition"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-700 block mb-1">
                    회신 연락처 <span className="text-red-500 font-black">*</span>
                  </label>
                  <input 
                    type="tel" 
                    value={guestPhone}
                    onChange={(e) => {
                      setGuestPhone(e.target.value);
                      if (guestPhoneError) setGuestPhoneError('');
                    }}
                    placeholder="010-1234-5678"
                    className={`w-full text-xs px-3 py-2 border rounded-xl outline-none transition ${
                      guestPhoneError ? 'border-red-500 bg-red-50/30' : 'border-gray-200 focus:border-black'
                    }`}
                  />
                  {guestPhoneError && (
                    <p className="text-[11px] text-red-600 mt-1 font-semibold">{guestPhoneError}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 w-full pt-1">
              <button 
                type="button"
                onClick={() => {
                  setConfirmModal({ isOpen: false, brand: null });
                  setGuestPhoneError('');
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold text-xs transition"
              >
                취소
              </button>
              <button 
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSell}
                className="flex-1 bg-gray-950 hover:bg-black text-white py-3 rounded-xl font-bold text-xs transition disabled:opacity-50"
              >
                {isSubmitting ? '접수중...' : '위탁 신청 완료'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 3. 위탁 판매 접수 완료 모달 */}
      {receiptModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl text-center flex flex-col items-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Check size={24} className="stroke-[3]" />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-1">위탁 판매 접수 완료</h3>
            <p className="text-xs text-emerald-600 font-bold mb-3">접수번호: {receiptModal.receiptCode}</p>

            <div className="w-full bg-gray-50 rounded-xl p-3 text-left text-xs text-gray-700 space-y-1.5 mb-4 border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-400">신청 브랜드</span>
                <span className="font-bold text-gray-900">{receiptModal.brandName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">상품 분류</span>
                <span className="font-bold text-gray-900">{receiptModal.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">안내 연락처</span>
                <span className="font-bold text-gray-900">{receiptModal.applicantPhone}</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 mb-5 leading-relaxed">
              접수 확인 문자가 발송되었습니다. 24시간 내 전문 감정팀이 안심 수거 키트를 무료로 발송해 드립니다.
            </p>

            <button 
              type="button"
              onClick={() => setReceiptModal({ isOpen: false, receiptCode: '', brandName: '', category: '', applicantPhone: '' })}
              className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm transition"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 🌟 접수 오류 모달 */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl text-center flex flex-col items-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <AlertCircle size={24} className="stroke-[2.5]" />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-2">접수 오류 안내</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">{errorModal.message}</p>
            <button 
              type="button"
              onClick={() => setErrorModal({ isOpen: false, message: '' })}
              className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-xl font-bold text-sm transition"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 1. 상단 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <button 
          type="button"
          aria-label="메인 화면으로 뒤로가기"
          onClick={() => goBack('SHOP_MAIN')} 
          className="p-1 -ml-1 text-gray-800 hover:text-black transition active:scale-95"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[15px] font-extrabold text-gray-900 flex-1 text-center pr-6 tracking-tight">브랜드 선택</h1>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {/* 2. 타이틀 */}
        <h2 className="text-[20px] font-extrabold text-gray-900 leading-snug mt-4 mb-5 px-5 tracking-tight">
          판매할 상품의<br/>브랜드명을 검색해주세요
        </h2>

        {/* 3. 검색창 */}
        <div className="px-5 mb-4">
          <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition-all">
            <input 
              type="text" 
              placeholder="브랜드명을 검색해주세요." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 text-[15px] placeholder-gray-400 outline-none bg-transparent"
            />
            {searchQuery ? (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-700 mr-1"
              >
                <X size={16} />
              </button>
            ) : null}
            <Search size={20} className="text-gray-600" />
          </div>
        </div>

        {/* 4. 직접 등록 링크 */}
        <div className="flex justify-center mb-6">
          <button 
            type="button"
            onClick={() => setShowDirectModal(true)}
            className="text-[13px] text-gray-700 font-bold flex items-center gap-1 hover:text-black transition group"
          >
            <span>원하는 브랜드가 없다면 직접 등록해보세요</span>
            <ChevronRight size={14} className="text-gray-700 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* 5. 브랜드 리스트 */}
        <div className="flex flex-col border-t border-gray-100 pt-2 pb-10">
          {filteredBrands.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm font-semibold mb-3">'{searchQuery}' 브랜드가 목록에 없습니다.</p>
              <button 
                type="button"
                onClick={() => {
                  setDirectBrandName(searchQuery);
                  setShowDirectModal(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs bg-gray-900 text-white font-bold px-4 py-2 rounded-lg hover:bg-black transition"
              >
                <PlusCircle size={14} /> '{searchQuery}' 직접 등록하기
              </button>
            </div>
          ) : (
            filteredBrands.map((brand, idx) => (
              <div 
                key={idx} 
                role="button"
                tabIndex={0}
                onClick={() => handleSelectBrand(brand)}
                className={`flex justify-between items-center py-4 px-5 border-b border-gray-50 cursor-pointer transition-colors ${
                  selectedBrand?.ko === brand.ko 
                    ? 'bg-blue-50/70 border-blue-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`font-extrabold text-[15px] ${selectedBrand?.ko === brand.ko ? 'text-blue-600' : 'text-gray-900'}`}>
                    {brand.ko}
                  </span>
                  <span className="text-gray-300 font-light text-[14px]">|</span>
                  <span className={`text-[15px] font-medium ${selectedBrand?.ko === brand.ko ? 'text-blue-500' : 'text-gray-400'}`}>
                    {brand.en}
                  </span>
                </div>
                {selectedBrand?.ko === brand.ko ? (
                  <Check size={18} className="text-blue-600 stroke-[3]" />
                ) : (
                  <ChevronRight size={16} className="text-gray-300" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
