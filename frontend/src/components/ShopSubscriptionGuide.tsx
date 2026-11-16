import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import {
  BoutiqueChevronLeft,
  BoutiqueShareIcon,
  BoutiqueChevronDown,
  BoutiqueCloseIcon
} from './icons/boutique';
import {
  AtelierVipCrest,
  AtelierOrderCompleteCrest,
  AtelierGradeMedal
} from './icons/atelier';

export const ShopSubscriptionGuide: React.FC = () => {
  const { goBack, user, setActiveOverlay } = useApp();
  const { showToast } = useToast();

  const [selectedTier, setSelectedTier] = useState<'BASIC' | 'PREMIUM' | 'HAUTE'>('PREMIUM');
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    showToast('구독 가이드 링크가 클립보드에 복사되었습니다.', 'info');
  };

  const handleStartSubscription = () => {
    if (!user) {
      showToast('로그인이 필요한 서비스입니다.', 'info');
      setActiveOverlay('LOGIN');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSubscription = () => {
    setIsSubscribed(true);
    showToast('명품 구독 멤버십 신청이 완료되었습니다!', 'success');
  };

  const plans = [
    {
      id: 'BASIC',
      name: '베이직 클럽',
      sub: '입문자를 위한 스마트 명품 구독',
      monthlyPrice: 89000,
      yearlyPrice: 75600,
      badge: '시작 추천',
      color: 'border-gray-200',
      features: [
        '월 1회 명품 가방/지갑 자유 대여',
        '왕복 무료 배송 1회 지원',
        '기본 안심 케어 (생활 스크래치 무상)',
        '대여료 5% 추가 적립'
      ]
    },
    {
      id: 'PREMIUM',
      name: '프리미엄 클럽',
      sub: '매주 새로운 스타일링을 위한 베스트셀러',
      monthlyPrice: 159000,
      yearlyPrice: 135100,
      badge: '가장 인기 있는 선택',
      color: 'border-[#B49A67]',
      isPopular: true,
      features: [
        '월 2회 자유 교환 (가방, 의류, 시계, 주얼리)',
        '왕복 안심 특급 배송 무제한 무료',
        '안심 케어 50% 감면 지원',
        '신규 입고 명품 24시간 우선 예약권',
        '바이백 구매 전환 시 구독료 30% 추가 페이백'
      ]
    },
    {
      id: 'HAUTE',
      name: '오뜨 VIP 클럽',
      sub: '하이엔드 명품 컬렉터를 위한 무제한 멤버십',
      monthlyPrice: 299000,
      yearlyPrice: 254100,
      badge: '최고급 VIP 혜택',
      color: 'border-gray-900',
      features: [
        '월 교환 횟수 무제한 (에르메스/샤넬/롤렉스 전용)',
        '1:1 전담 퍼스널 쇼퍼 큐레이션 매칭',
        '파손 및 오염 100% 전액 면책 무상 보증',
        '청담 프라이빗 쇼룸 우선 초대',
        '당일 퀵 특급 세이프 딜리버리 무료'
      ]
    }
  ];

  const currentPlan = plans.find((p) => p.id === selectedTier) || plans[1];

  const faqs = [
    {
      q: '구독 기간 중 상품 교환은 어떻게 하나요?',
      a: '앱 마이페이지 [구독 관리]에서 다음 회차에 받아보실 상품을 선택하시면, 반납과 동시에 다음 상품을 맞교환으로 간편하게 수령하실 수 있습니다.'
    },
    {
      q: '구독을 잠시 일시정지할 수 있나요?',
      a: '네, 출장이나 여행 시 최대 60일까지 결제 및 이용을 일시정지할 수 있으며, 일시정지 기간 동안은 요금이 청구되지 않습니다.'
    },
    {
      q: '중도 해지 시 위약금이 발생하나요?',
      a: '월간 결제는 약정 위약금이 전혀 없으며 언제든 당월 이용 후 자유롭게 해지가 가능합니다.'
    },
    {
      q: '대여 중인 상품을 반납하지 않고 바로 구매할 수 있나요?',
      a: '네, 구독 회원 전용 바이백 혜택으로 납부하신 구독료의 최대 50%를 구매 할인금으로 즉시 차감받고 소장하실 수 있습니다.'
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
        <div className="flex items-center gap-1.5">
          <AtelierVipCrest size={18} />
          <h1 className="font-extrabold text-base tracking-tight text-gray-900">구독 클럽 가이드</h1>
        </div>
        <button
          type="button"
          onClick={handleShare}
          aria-label="구독 가이드 공유하기"
          className="p-1 -mr-1 text-gray-700 hover:text-black rounded-lg transition active:scale-95"
        >
          <BoutiqueShareIcon size={20} />
        </button>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-b from-[#161514] via-[#242220] to-[#161514] text-white px-5 pt-7 pb-8 relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 w-56 h-56 bg-[#B49A67]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#B49A67]/25 border border-[#B49A67]/40 text-[#DFC89B] text-[10px] font-bold tracking-wider mb-2">
              LUXURY WARDROBE MEMBERSHIP
            </span>
            <h2 className="text-xl font-extrabold leading-snug tracking-tight">
              매월 새로운 명품을 옷장처럼,<br />
              <span className="text-[#DFC89B]">무제한 교환 구독 클럽</span>
            </h2>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              한 번의 구독으로 샤넬부터 에르메스까지, 시즌마다 원하는 명품을 자유롭게 교환하세요.
            </p>
          </div>
          <div className="shrink-0 mt-1">
            <AtelierGradeMedal grade="S" size={50} />
          </div>
        </div>

        {/* 결제 주기 토글 (월간 / 연간 15% 할인) */}
        <div className="mt-5 p-1 bg-white/10 rounded-xl flex border border-white/10">
          <button
            type="button"
            onClick={() => setBillingCycle('MONTHLY')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
              billingCycle === 'MONTHLY' ? 'bg-[#DFC89B] text-[#1C1B1A] shadow-xs' : 'text-gray-300 hover:text-white'
            }`}
          >
            월간 결제
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('YEARLY')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              billingCycle === 'YEARLY' ? 'bg-[#DFC89B] text-[#1C1B1A] shadow-xs' : 'text-gray-300 hover:text-white'
            }`}
          >
            <span>연간 결제</span>
            <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[10px] font-extrabold">15% 할인</span>
          </button>
        </div>
      </section>

      {/* Main Section */}
      <main className="p-4 flex-1 shrink-0 space-y-4">
        {/* Tier Cards */}
        <section className="space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900 tracking-tight flex items-center justify-between">
            <span>멤버십 플랜 선택</span>
            <span className="text-[11px] font-normal text-gray-500">언제든 자유롭게 변경 가능</span>
          </h3>

          {plans.map((plan) => {
            const isSelected = selectedTier === plan.id;
            const price = billingCycle === 'YEARLY' ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedTier(plan.id as any)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedTier(plan.id as any)}
                className={`bg-white rounded-2xl p-4 transition-all cursor-pointer relative border-2 ${
                  isSelected
                    ? 'border-[#8C734B] shadow-md bg-gradient-to-b from-white to-[#FBF9F5]'
                    : 'border-gray-100 hover:border-gray-200 shadow-2xs'
                }`}
              >
                {plan.isPopular && (
                  <span className="absolute -top-2.5 right-4 bg-gradient-to-r from-[#8C734B] to-[#B49A67] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs">
                    BEST CHOICE
                  </span>
                )}

                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#8C734B] tracking-wider block mb-0.5">{plan.badge}</span>
                    <h4 className="font-extrabold text-base text-gray-900">{plan.name}</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">{plan.sub}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black text-gray-900">
                      {price.toLocaleString()}원
                    </span>
                    <span className="text-[10px] text-gray-400 block">/월 (VAT 포함)</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="mt-3.5 pt-3 border-t border-gray-100 space-y-1.5 text-xs text-gray-600">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <span className="text-[#8C734B] font-bold text-[11px]">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </section>

        {/* Cost Savings Calculator Card */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-extrabold text-sm text-gray-900 mb-2">개별 렌탈 vs 구독 비용 비교</h3>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">
            월 2회 명품 백을 개별 렌트하는 것보다 <strong className="text-[#8C734B]">프리미엄 클럽</strong> 이용 시 매월 더 합리적입니다.
          </p>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-400 block text-[11px]">개별 렌탈 2회</span>
              <span className="font-bold text-gray-700 text-sm mt-1 block line-through">380,000원</span>
              <span className="text-[10px] text-gray-400">정상 렌탈료 합산</span>
            </div>
            <div className="p-3 bg-amber-50/70 border border-amber-200/50 rounded-xl">
              <span className="text-amber-800 font-bold block text-[11px]">프리미엄 구독시</span>
              <span className="font-extrabold text-[#8C734B] text-sm mt-1 block">159,000원</span>
              <span className="text-[10px] text-emerald-600 font-extrabold block">매월 221,000원 절약 (58%)</span>
            </div>
          </div>
        </section>

        {/* 4대 독점 회원 혜택 그리드 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-extrabold text-sm text-gray-900 mb-3">구독 회원 4대 독점 혜택</h3>
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-100">
              <span className="font-bold text-gray-900 block mb-1">🧼 무상 안심 케어</span>
              <p className="text-[11px] text-gray-500 leading-tight">생활 스크래치, 가죽 미세 마모 0원 무상 복원</p>
            </div>
            <div className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-100">
              <span className="font-bold text-gray-900 block mb-1">📦 안심 맞교환 배송</span>
              <p className="text-[11px] text-gray-500 leading-tight">공백기 없는 반납-수령 동시 배송 무료</p>
            </div>
            <div className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-100">
              <span className="font-bold text-gray-900 block mb-1">🔓 자유로운 위약금 0원</span>
              <p className="text-[11px] text-gray-500 leading-tight">필요할 때만 이용하고 언제든 당월 해지</p>
            </div>
            <div className="p-3 bg-[#FAF9F6] rounded-xl border border-gray-100">
              <span className="font-bold text-gray-900 block mb-1">💎 바이백 구독료 환급</span>
              <p className="text-[11px] text-gray-500 leading-tight">구매 전환 시 결제하신 구독료 추가 할인</p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-3">
          <h3 className="font-extrabold text-sm text-gray-900">자주 묻는 질문</h3>
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
      </main>

      {/* Floating Bottom CTA */}
      <footer className="sticky bottom-0 shrink-0 bg-white/95 backdrop-blur-md border-t border-gray-200/80 p-3.5 shadow-lg">
        <button
          type="button"
          onClick={handleStartSubscription}
          className="w-full py-3.5 bg-gradient-to-r from-[#1C1B1A] via-[#2D2A26] to-[#1C1B1A] text-[#DFC89B] font-extrabold text-sm rounded-xl shadow-md hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <AtelierOrderCompleteCrest size={18} />
          {currentPlan.name} 구독 신청하기 (
          {(billingCycle === 'YEARLY' ? currentPlan.yearlyPrice : currentPlan.monthlyPrice).toLocaleString()}원/월)
        </button>
      </footer>

      {/* Subscription Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-5 border border-gray-100 text-center animate-fade-in">
            {!isSubscribed ? (
              <>
                <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AtelierVipCrest size={28} />
                </div>
                <h4 className="font-extrabold text-base text-gray-900 mb-1">{currentPlan.name} 구독 시작</h4>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  {billingCycle === 'YEARLY' ? '연간 15% 할인 멤버십' : '월간 정기 멤버십'}으로 신청하시겠습니까?<br />
                  첫 회차는 결제 후 바로 명품 대여 신청이 가능합니다.
                </p>
                <div className="p-3 bg-[#FAF9F6] rounded-xl text-left text-xs space-y-1 mb-4 border border-gray-200/70">
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>선택 플랜</span>
                    <span>{currentPlan.name}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>월 청구 금액</span>
                    <span className="font-extrabold text-[#8C734B]">
                      {(billingCycle === 'YEARLY' ? currentPlan.yearlyPrice : currentPlan.monthlyPrice).toLocaleString()}원
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={confirmSubscription}
                    className="flex-1 py-2.5 rounded-xl bg-[#1C1B1A] text-[#DFC89B] text-xs font-extrabold hover:bg-black shadow-xs"
                  >
                    신청 완료
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AtelierOrderCompleteCrest size={32} />
                </div>
                <h4 className="font-extrabold text-base text-gray-900 mb-1">구독 신청이 완료되었습니다!</h4>
                <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                  이제 {currentPlan.name} 회원 혜택이 즉시 적용됩니다.<br />
                  원하는 첫 번째 명품 상품을 선택해 보세요.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    setIsSubscribed(false);
                    goBack();
                  }}
                  className="w-full py-2.5 bg-[#1C1B1A] text-[#DFC89B] text-xs font-extrabold rounded-xl"
                >
                  명품 큐레이션 둘러보기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
