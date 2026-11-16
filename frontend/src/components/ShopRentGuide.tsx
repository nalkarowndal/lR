import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  BoutiqueChevronLeft,
  BoutiqueShareIcon,
  BoutiqueCalendarIcon,
  BoutiqueCheckSquare,
  BoutiqueChevronDown
} from './icons/boutique';
import {
  AtelierAuthenticSeal,
  AtelierOrderCompleteCrest
} from './icons/atelier';

export const ShopRentGuide: React.FC = () => {
  const { goBack, navigateTo } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'PROCESS' | 'CARE' | 'DELIVERY' | 'FAQ'>('PROCESS');
  const [selectedRentalDays, setSelectedRentalDays] = useState<number>(3);
  const [carePlanActive, setCarePlanActive] = useState<boolean>(true);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast('렌트 이용 가이드 링크가 클립보드에 복사되었습니다.', 'info');
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const faqs = [
    {
      q: '렌탈 상품은 100% 정품이 맞나요?',
      a: '네, 리본즈 전문 명품 감정팀의 3중 전수 검수를 거쳐 100% 정품 인증 씰이 부착된 제품만 출고됩니다. 가품일 시 결제 금액의 200%를 보상해 드립니다.'
    },
    {
      q: '대여 도중 이용 기간을 연장할 수 있나요?',
      a: '다음 예약자가 없는 경우 마이페이지 [렌탈/주문 내역]에서 간편하게 1일 단위로 실시간 연장 신청이 가능합니다.'
    },
    {
      q: '착용 중 생활 스크래치가 발생하면 어떻게 되나요?',
      a: '렌트잇 안심 케어 플랜이 적용된 경우, 일상적인 착용 중 발생하는 미세 스크래치, 가죽 주름, 금속 마모는 전액 무상 처리됩니다.'
    },
    {
      q: '반납은 어떻게 진행되나요?',
      a: '대여 종료일 전날 카카오톡 알림톡으로 수거 안내를 드립니다. 배송 시 동봉된 반납 박스에 넣어 문 앞에 두시면 택배 기사님이 무료로 수거합니다.'
    },
    {
      q: '렌탈 이용 후 마음에 들면 구매할 수 있나요?',
      a: '네, "바이백(Buy-Back)" 프로그램을 통해 지금까지 결제하신 대여료 전액을 차감한 특별 할인가로 즉시 구매 전환하실 수 있습니다.'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAF9F6] text-gray-900 overflow-y-auto scrollbar-hide relative select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-30 shrink-0 bg-white/90 backdrop-blur-md border-b border-gray-100/80 px-4 py-3.5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goBack()}
          aria-label="뒤로가기"
          className="p-1 -ml-1 text-gray-700 hover:text-black rounded-lg transition active:scale-95"
        >
          <BoutiqueChevronLeft size={22} />
        </button>
        <h1 className="font-extrabold text-base tracking-tight text-gray-900">렌트 이용 가이드</h1>
        <button
          type="button"
          onClick={handleShare}
          aria-label="가이드 공유하기"
          className="p-1 -mr-1 text-gray-700 hover:text-black rounded-lg transition active:scale-95"
        >
          <BoutiqueShareIcon size={20} />
        </button>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1C1B1A] to-[#2B2927] text-white px-5 pt-7 pb-8 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#B49A67]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#B49A67]/25 border border-[#B49A67]/40 text-[#DFC89B] text-[10px] font-bold tracking-wider mb-2.5">
              LUXURY CONCIERGE RENTAL
            </div>
            <h2 className="text-xl font-extrabold leading-snug tracking-tight">
              소유하지 않고 경험하는<br />
              <span className="text-[#DFC89B]">하이엔드 명품 라이프스타일</span>
            </h2>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              샤넬, 에르메스, 롤렉스 등 14대 명품을 원하는 일정에 맞춰 부담 없이 경험하세요.
            </p>
          </div>
          <div className="shrink-0 mt-1">
            <AtelierAuthenticSeal size={52} />
          </div>
        </div>

        {/* 3대 안심 지표 바 */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/10 text-center">
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="block text-[10px] text-gray-400">최소 대여 기간</span>
            <span className="font-extrabold text-xs text-[#DFC89B] mt-0.5">1일 단위 자유 렌트</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="block text-[10px] text-gray-400">정품 보증</span>
            <span className="font-extrabold text-xs text-[#DFC89B] mt-0.5">100% 3중 검수 씰</span>
          </div>
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
            <span className="block text-[10px] text-gray-400">배송 및 반납</span>
            <span className="font-extrabold text-xs text-[#DFC89B] mt-0.5">도어투도어 무료 수거</span>
          </div>
        </div>
      </section>

      {/* Interactive Tabs */}
      <nav className="sticky top-[58px] z-20 shrink-0 bg-white border-b border-gray-100 flex text-center font-bold text-xs" aria-label="가이드 탭">
        {[
          { key: 'PROCESS', label: '1. 이용 절차' },
          { key: 'CARE', label: '2. 안심 케어' },
          { key: 'DELIVERY', label: '3. 배송/반납' },
          { key: 'FAQ', label: '4. 자주 묻는 질문' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 py-3 transition-colors relative ${
              activeTab === tab.key ? 'text-[#8C734B] font-extrabold' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8C734B]" />
            )}
          </button>
        ))}
      </nav>

      {/* Main Content Areas */}
      <main className="p-4 flex-1 shrink-0 space-y-4">
        {/* Tab 1: 이용 절차 */}
        {activeTab === 'PROCESS' && (
          <section className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-[#8C734B] text-white flex items-center justify-center text-xs">1</span>
                상품 탐색 및 대여 기간 선택
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                가방, 의류, 시계, 주얼리 등 원하는 상품의 상세 페이지에서 필요한 대여 일수(3일, 7일, 30일 등)를 자유롭게 선택하세요.
              </p>

              {/* Interactive Rental Days Selector */}
              <div className="mt-4 p-3 bg-[#FAF9F6] rounded-xl border border-gray-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                    <BoutiqueCalendarIcon size={14} className="text-[#8C734B]" />
                    대여 일수 시뮬레이터
                  </span>
                  <span className="text-[11px] font-extrabold text-[#8C734B]">
                    {selectedRentalDays === 3 && '기본 3일 (단기 추천)'}
                    {selectedRentalDays === 7 && '7일 패키지 (10% 할인)'}
                    {selectedRentalDays === 14 && '14일 패키지 (20% 할인)'}
                    {selectedRentalDays === 30 && '30일 장기 대여 (35% 할인)'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setSelectedRentalDays(days)}
                      className={`py-2 text-xs font-bold rounded-lg border transition ${
                        selectedRentalDays === days
                          ? 'bg-[#1C1B1A] text-[#DFC89B] border-[#1C1B1A] shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {days}일
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-[#8C734B] text-white flex items-center justify-center text-xs">2</span>
                100% 정품 인증 씰 & 클린 패키징
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                출고 직전 전문 감정팀이 홀로그램 정품 씰을 직접 부착하고, UV-C 살균 소독 및 완벽한 완충재로 밀봉 포장되어 발송됩니다.
              </p>
              <div className="mt-3 flex items-center gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-200/50">
                <AtelierAuthenticSeal size={36} />
                <div className="text-[11px] text-amber-900">
                  <span className="font-bold block">아틀리에 감정 보증 씰 부착</span>
                  수령 후 착용 전까지 씰을 훼손하지 않고 상태를 확인해 주세요.
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-[#8C734B] text-white flex items-center justify-center text-xs">3</span>
                프리미엄 세이프 배송 & 당일 수령
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                서울/수도권은 당일 퀵 안심 배송, 지방은 우체국 특급 배송으로 예약하신 희망 일정에 오차 없이 도착합니다.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-2 mb-3">
                <span className="w-5 h-5 rounded-full bg-[#8C734B] text-white flex items-center justify-center text-xs">4</span>
                원터치 반납 또는 바이백 구매 전환
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                반납일에 무료 방문 수거를 신청하거나, 착용해본 상품이 마음에 드셨다면 결제하신 대여료 전액을 차감받고 영구 소장하실 수 있습니다.
              </p>
              <div className="mt-3 flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-xs font-bold text-gray-700">대여료 100% 차감 바이백</span>
                <span className="text-xs font-extrabold text-emerald-600">추가 할인 구매 가능</span>
              </div>
            </div>
          </section>
        )}

        {/* Tab 2: 안심 케어 */}
        {activeTab === 'CARE' && (
          <section className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-gray-900">렌트잇 안심 케어 플랜</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">파손 및 오염 걱정 없는 프리미엄 보증 서비스</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCarePlanActive(!carePlanActive)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    carePlanActive ? 'bg-[#8C734B]' : 'bg-gray-300'
                  }`}
                  aria-label="안심 케어 플랜 토글"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      carePlanActive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Status Comparison Table */}
              <div className="mt-4 border border-gray-200/80 rounded-xl overflow-hidden text-xs">
                <div className="grid grid-cols-3 bg-[#FAF9F6] p-2.5 font-bold text-gray-600 border-b border-gray-200/80 text-center">
                  <span>손상 유형</span>
                  <span>케어 플랜 적용시</span>
                  <span>미적용시</span>
                </div>
                <div className="divide-y divide-gray-100">
                  <div className="grid grid-cols-3 p-2.5 text-center items-center">
                    <span className="font-medium text-gray-800">가죽 생활 스크래치</span>
                    <span className="font-extrabold text-emerald-600">무상 복원 (0원)</span>
                    <span className="text-gray-400">실 수리비 (5~15만원)</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 text-center items-center">
                    <span className="font-medium text-gray-800">미세 액체 이염/얼룩</span>
                    <span className="font-extrabold text-emerald-600">무상 클리닝 (0원)</span>
                    <span className="text-gray-400">실 세탁비 (3~8만원)</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 text-center items-center">
                    <span className="font-medium text-gray-800">금속 버클 마모/스크래치</span>
                    <span className="font-extrabold text-emerald-600">무상 폴리싱 (0원)</span>
                    <span className="text-gray-400">실 폴리싱비 (5만원)</span>
                  </div>
                  <div className="grid grid-cols-3 p-2.5 text-center items-center bg-gray-50/50">
                    <span className="font-medium text-gray-800">완전 파손/분실</span>
                    <span className="font-bold text-gray-700">소비자가의 50%</span>
                    <span className="text-rose-600 font-bold">소비자가 100%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1C1B1A] text-white rounded-2xl p-4 shadow-sm border border-gray-900">
              <h4 className="font-extrabold text-xs text-[#DFC89B] tracking-wider mb-2">CARE RECOMMENDATION</h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                결제 시 단 <strong className="text-white">대여료의 5%</strong>만 추가하시면 고가의 명품 백도 파손 걱정 없이 온전히 스타일링에만 집중하실 수 있습니다.
              </p>
            </div>
          </section>
        )}

        {/* Tab 3: 배송 및 반납 */}
        {activeTab === 'DELIVERY' && (
          <section className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900 mb-2">수령 및 배송 안내</h3>
              <ul className="space-y-2 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#8C734B] font-bold">✓</span>
                  <span><strong>서울 및 경기 일부:</strong> 오전 11시 이전 주문 시 당일 퀵 배송 도착 지원</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8C734B] font-bold">✓</span>
                  <span><strong>전국 지역:</strong> 우체국 특급 안심 소포로 익일 정오 전 도착</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#8C734B] font-bold">✓</span>
                  <span><strong>배송비:</strong> 왕복 배송비 100% 무료 지원</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <h3 className="font-extrabold text-sm text-gray-900 mb-2">3초 만에 끝나는 간편 반납</h3>
              <div className="space-y-2.5 text-xs text-gray-600">
                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-200/80">
                  <strong className="block text-gray-900 mb-1">Step 1. 안심 박스에 재포장</strong>
                  배송 시 수령하셨던 박스와 완충재에 상품을 넣고 동봉된 반납 테이프로 밀봉해 주세요.
                </div>
                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-200/80">
                  <strong className="block text-gray-900 mb-1">Step 2. 문 앞 보관</strong>
                  반납 예정일 오전 9시까지 문 앞에 놓아두시면 전담 기사님이 수거해 갑니다.
                </div>
                <div className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-200/80">
                  <strong className="block text-gray-900 mb-1">Step 3. 수거 완료 알림</strong>
                  기사님 픽업 즉시 카카오 알림톡으로 수거 접수 완료 알림이 자동 전송됩니다.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tab 4: FAQ */}
        {activeTab === 'FAQ' && (
          <section className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-left font-bold text-xs text-gray-900 hover:bg-gray-50/50"
                  aria-expanded={expandedFaq === idx}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[#8C734B] font-extrabold">Q.</span>
                    {faq.q}
                  </span>
                  <BoutiqueChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${expandedFaq === idx ? 'rotate-180 text-black' : ''}`}
                  />
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-gray-600 leading-relaxed border-t border-gray-50 bg-[#FAF9F6]/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Floating Bottom CTA */}
      <footer className="sticky bottom-0 shrink-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 p-3.5 shadow-lg">
        <button
          type="button"
          onClick={() => navigateTo('SHOP_CATEGORY')}
          className="w-full py-3.5 bg-gradient-to-r from-[#1C1B1A] via-[#2D2A26] to-[#1C1B1A] text-[#DFC89B] font-extrabold text-sm rounded-xl shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <AtelierOrderCompleteCrest size={18} />
          명품 렌탈 상품 둘러보기
        </button>
      </footer>
    </div>
  );
};
