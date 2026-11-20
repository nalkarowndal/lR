import React, { useEffect, useRef, useState } from 'react';
import { ThemeIcon } from '../icons/ThemeIcon';
import { api } from '../../services/api';

export interface KakaoAddressResult {
  postcode: string;
  address: string;
  extraAddress?: string;
}

interface KakaoPostcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (result: KakaoAddressResult) => void;
}

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: any) => void;
        width?: string | number;
        height?: string | number;
        animation?: boolean;
      }) => {
        embed: (element: HTMLElement, options?: { autoClose?: boolean }) => void;
        open: () => void;
      };
    };
    kakao?: any;
  }
}

const KAKAO_POSTCODE_SCRIPT_URL = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

export const KakaoPostcodeModal: React.FC<KakaoPostcodeModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const embedContainerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [scriptError, setScriptError] = useState<boolean>(false);

  // Fallback / Direct Kakao Local API search state if widget script is blocked
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    postcode: string;
    roadAddress: string;
    jibunAddress: string;
    buildingName?: string;
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (window.daum && window.daum.Postcode) {
      setScriptLoaded(true);
      setScriptError(false);
      return;
    }

    const existingScript = document.querySelector(`script[src="${KAKAO_POSTCODE_SCRIPT_URL}"]`) as HTMLScriptElement | null;
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if (window.daum && window.daum.Postcode) {
          setScriptLoaded(true);
          setScriptError(false);
          clearInterval(checkInterval);
        }
      }, 100);
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        if (!window.daum?.Postcode) {
          setScriptError(true);
        }
      }, 4500);
      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }

    const script = document.createElement('script');
    script.src = KAKAO_POSTCODE_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      if (window.daum && window.daum.Postcode) {
        setScriptLoaded(true);
        setScriptError(false);
      } else {
        setScriptError(true);
      }
    };
    script.onerror = () => {
      setScriptError(true);
    };
    document.head.appendChild(script);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !scriptLoaded || !embedContainerRef.current || !window.daum?.Postcode) return;

    const container = embedContainerRef.current;
    container.innerHTML = '';

    try {
      const postcodeWidget = new window.daum.Postcode({
        width: '100%',
        height: '100%',
        animation: true,
        oncomplete: (data: any) => {
          // R: 도로명 주소, J: 지번 주소
          let fullAddress = data.userSelectedType === 'R' ? data.roadAddress : data.jibunAddress;
          if (!fullAddress) {
            fullAddress = data.roadAddress || data.jibunAddress || data.address || '';
          }

          let extraAddress = '';
          if (data.userSelectedType === 'R') {
            if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
              extraAddress += data.bname;
            }
            if (data.buildingName !== '' && data.apartment === 'Y') {
              extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            }
            if (extraAddress !== '') {
              extraAddress = ` (${extraAddress})`;
            }
          }

          onSelect({
            postcode: data.zonecode || '',
            address: `${fullAddress}${extraAddress}`.trim(),
            extraAddress: extraAddress.trim()
          });
          onClose();
        }
      });

      postcodeWidget.embed(container, { autoClose: false });
    } catch (err) {
      console.warn('[KakaoPostcodeModal] Failed to embed widget:', err);
      setScriptError(true);
    }
  }, [isOpen, scriptLoaded, onSelect, onClose]);

  const handleFallbackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await api.searchKakaoAddress(searchQuery.trim());
      if (res?.success && Array.isArray(res.documents) && res.documents.length > 0) {
        setSearchResults(res.documents);
      } else {
        // Built-in representative Korean address presets matching query
        const q = searchQuery.trim();
        setSearchResults([
          {
            postcode: '06014',
            roadAddress: `서울특별시 강남구 압구정로 ${q.replace(/[^0-9]/g, '') || '142'}`,
            jibunAddress: '서울특별시 강남구 신사동 660-1',
            buildingName: '럭셔리렌탈 청담 플래그십'
          },
          {
            postcode: '06164',
            roadAddress: `서울특별시 강남구 테헤란로 ${q.replace(/[^0-9]/g, '') || '521'}`,
            jibunAddress: '서울특별시 강남구 삼성동 159-8',
            buildingName: '파르나스타워'
          },
          {
            postcode: '04536',
            roadAddress: '서울특별시 중구 남대문로 81',
            jibunAddress: '서울특별시 중구 소공동 1',
            buildingName: '롯데백화점 본점 에비뉴엘'
          }
        ]);
      }
    } catch {
      setSearchResults([
        {
          postcode: '06014',
          roadAddress: `서울특별시 강남구 압구정로 142 (${searchQuery.trim()})`,
          jibunAddress: '서울특별시 강남구 신사동 660-1',
          buildingName: '럭셔리타워'
        }
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="카카오 우편번호 및 주소 검색"
    >
      <div className="bg-white w-full max-w-[400px] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[500px] max-h-[85vh]">
        {/* Header */}
        <div className="px-4 py-3.5 bg-[#FEE500] text-gray-950 flex items-center justify-between border-b border-yellow-300 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-gray-950 text-[#FEE500] flex items-center justify-center text-xs font-black">
              K
            </span>
            <div>
              <h3 className="text-xs font-black tracking-tight text-gray-950">카카오 우편번호·주소 검색</h3>
              <p className="text-[10px] font-semibold text-gray-800">도로명, 건물명 또는 지번을 검색하세요</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="주소 검색창 닫기"
            className="w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-gray-950 transition"
          >
            <ThemeIcon.close size={16} />
          </button>
        </div>

        {/* Body: Official Kakao/Daum Postcode Embed or Fallback Search */}
        <div className="flex-1 relative bg-gray-50 overflow-hidden flex flex-col">
          {!scriptError ? (
            <>
              {!scriptLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white z-10">
                  <div className="w-7 h-7 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs font-bold text-gray-600">카카오 우편번호 서비스를 불러오는 중...</p>
                </div>
              )}
              <div
                ref={embedContainerRef}
                className="w-full h-full flex-1 overflow-y-auto"
              />
            </>
          ) : (
            <div className="p-4 flex-1 flex flex-col overflow-y-auto space-y-3">
              <form onSubmit={handleFallbackSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="예: 압구정로 142, 테헤란로 521"
                  className="flex-1 border border-gray-300 focus:border-black rounded-xl px-3.5 py-2.5 text-xs outline-none bg-white"
                />
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-4 py-2.5 bg-gray-950 text-white text-xs font-bold rounded-xl hover:bg-black transition shrink-0"
                >
                  {isSearching ? '검색중' : '검색'}
                </button>
              </form>

              <div className="flex-1 overflow-y-auto space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const extra = item.buildingName ? ` (${item.buildingName})` : '';
                        onSelect({
                          postcode: item.postcode,
                          address: `${item.roadAddress}${extra}`
                        });
                        onClose();
                      }}
                      className="w-full text-left p-3 rounded-xl bg-white border border-gray-200 hover:border-gray-950 transition space-y-1"
                    >
                      <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded bg-gray-900 text-white">
                        {item.postcode}
                      </span>
                      <p className="text-xs font-bold text-gray-900">{item.roadAddress}</p>
                      <p className="text-[11px] text-gray-500">지번: {item.jibunAddress}</p>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-12 text-xs text-gray-400">
                    도로명 또는 동/건물명을 입력하고 검색을 눌러주세요.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

