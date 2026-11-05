import React from 'react';
import { X, CheckCircle2, Shield, Calendar, FileText } from 'lucide-react';
import { LEGAL_DOCUMENTS, type LegalDocument } from '../../data/legalTerms';

interface LegalTermsModalProps {
  isOpen: boolean;
  docType: 'TERMS_OF_SERVICE' | 'PRIVACY_COLLECTION' | 'PRIVACY_POLICY' | 'MARKETING_CONSENT' | null;
  onClose: () => void;
  onAgree?: (docType: string) => void;
}

export const LegalTermsModal = ({
  isOpen,
  docType,
  onClose,
  onAgree
}: LegalTermsModalProps) => {
  if (!isOpen || !docType) return null;

  const doc: LegalDocument | undefined = LEGAL_DOCUMENTS[docType];
  if (!doc) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] animate-scaleUp overflow-hidden border border-gray-100"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
              doc.isRequired 
                ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                : 'bg-blue-50 text-blue-600 border border-blue-200'
            }`}>
              {doc.isRequired ? '필수 동의' : '선택 안내'}
            </span>
            <h3 id="legal-modal-title" className="font-extrabold text-sm text-gray-900 truncate">
              {doc.shortTitle}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-800 transition rounded-lg hover:bg-gray-100"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        {/* Metadata Bar */}
        <div className="bg-gray-50/80 px-5 py-2.5 border-b border-gray-100 flex items-center justify-between text-[11px] text-gray-500 shrink-0 font-medium">
          <div className="flex items-center gap-1.5">
            <FileText size={13} className="text-gray-400" />
            <span>버전: <strong className="text-gray-700">{doc.version}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={13} className="text-gray-400" />
            <span>시행일자: <strong className="text-gray-700">{doc.effectiveDate}</strong></span>
          </div>
        </div>

        {/* Scrollable Document Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-gray-600 leading-relaxed scrollbar-thin">
          {/* Summary Box */}
          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-blue-900 font-medium flex items-start gap-2.5">
            <Shield size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">{doc.summary}</p>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-4 pt-1">
            {doc.sections.map((section, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                <h4 className="font-bold text-gray-900 text-xs mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-black rounded-full" />
                  {section.title}
                </h4>
                <p className="text-gray-600 text-[11px] leading-relaxed whitespace-pre-line pl-3">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white flex gap-2 shrink-0">
          {onAgree && (
            <button
              type="button"
              onClick={() => {
                onAgree(doc.docType);
                onClose();
              }}
              className="flex-1 py-3 bg-black hover:bg-gray-900 active:scale-[0.99] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 size={15} />
              <span>동의하고 확인 완료</span>
            </button>
          )}
          <button
            type="button"
            data-testid="legal-modal-close"
            onClick={onClose}
            className={`${onAgree ? 'px-4' : 'w-full'} py-3 border border-gray-200 hover:bg-gray-50 active:scale-[0.99] text-gray-700 text-xs font-bold rounded-xl transition`}
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
