import React, { useState } from 'react';
import { ChevronLeft, Search, ChevronRight, Check, PlusCircle, X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export const ShopSell = () => {
  const { goBack } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<{ ko: string; en: string } | null>(null);
  const [showDirectModal, setShowDirectModal] = useState(false);
  const [directBrandName, setDirectBrandName] = useState('');
  const [sellModal, setSellModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });

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

  const handleSelectBrand = async (brand: { ko: string; en: string }) => {
    setSelectedBrand(brand);
    setIsSubmitting(true);
    try {
      await api.createSellRequest(`${brand.ko} (${brand.en})`);
      setSellModal({
        isOpen: true,
        message: `'${brand.ko} (${brand.en})' 브랜드 위탁 판매 신청이 정상 접수되었습니다. 전문 감정팀 검수 후 안내 연락을 드립니다.`
      });
    } catch (err: any) {
      setErrorModal({
        isOpen: true,
        message: err.message || '판매 신청 접수 중 네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = directBrandName.trim();
    if (!name) return;
    setShowDirectModal(false);
    setSelectedBrand({ ko: name, en: 'Custom' });
    setIsSubmitting(true);
    try {
      await api.createSellRequest(name);
      setSellModal({
        isOpen: true,
        message: `'${name}' 브랜드 직접 등록이 정상 접수되었습니다. 전문 감정팀 검수 후 판매 절차가 진행됩니다.`
      });
      setDirectBrandName('');
    } catch (err: any) {
      setErrorModal({
        isOpen: true,
        message: err.message || '브랜드 직접 등록 접수 중 오류가 발생했습니다.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white select-none relative">
      {/* 🌟 판매 신청 확인 모달 */}
      {sellModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-xs w-full shadow-2xl text-center flex flex-col items-center animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Check size={24} className="stroke-[3]" />
            </div>
            <h3 className="font-extrabold text-base text-gray-900 mb-2">위탁 판매 신청 안내</h3>
            <p className="text-xs text-gray-600 mb-6 leading-relaxed">{sellModal.message}</p>
            <button 
              type="button"
              onClick={() => setSellModal({ isOpen: false, message: '' })}
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

      {/* 🌟 직접 등록 모달 */}
      {showDirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base text-gray-900">브랜드 직접 등록</h3>
              <button type="button" onClick={() => setShowDirectModal(false)} className="text-gray-400 hover:text-black">
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">등록되지 않은 브랜드명을 직접 입력해주시면 전문 감정팀 검수 후 판매 절차가 진행됩니다.</p>
            <form onSubmit={handleDirectRegister} className="space-y-4">
              <input 
                type="text" 
                value={directBrandName}
                onChange={(e) => setDirectBrandName(e.target.value)}
                placeholder="예: 발렉스트라, 모이나..." 
                required
                className="w-full border border-gray-300 focus:border-black rounded-xl p-3.5 text-sm outline-none"
              />
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setShowDirectModal(false)}
                  className="flex-1 border border-gray-200 py-3 rounded-xl text-sm font-bold text-gray-600"
                >
                  취소
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-bold hover:bg-black disabled:opacity-50"
                >
                  {isSubmitting ? '접수 중...' : '등록 신청'}
                </button>
              </div>
            </form>
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
