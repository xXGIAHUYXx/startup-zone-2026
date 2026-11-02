import React, { useState } from 'react';
import type { OrderRequest, WorkshopPartner, MatchResult, MatchProposal } from '../../types';
import { runSmartMatching } from '../../utils/matchingEngine';
import { Button } from '../common/Button';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Store, 
  ShieldCheck, 
  Info, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface SmartMatchingModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: OrderRequest;
  workshops: WorkshopPartner[];
  onSelectWorkshop: (workshopId: string, suggestedNote: string) => void;
  onOpenManualDispatch?: () => void;
}

export const SmartMatchingModal: React.FC<SmartMatchingModalProps> = ({
  isOpen,
  onClose,
  request,
  workshops,
  onSelectWorkshop,
  onOpenManualDispatch
}) => {
  const [showIneligible, setShowIneligible] = useState(false);

  if (!isOpen) return null;

  // Run the matching engine
  const matchResult: MatchResult = runSmartMatching(request, workshops);
  const { topRecommendations, ineligibleWorkshops, emptyExplanation, ownerRecommendationTip } = matchResult;

  const handleChoose = (proposal: MatchProposal) => {
    // Generate pre-filled dispatch note based on matching reasons
    const suggestedNote = `Hệ thống Smart Matching đề xuất xưởng do đáp ứng: ${proposal.reasons.slice(0, 2).join('; ')}. Nhờ ${proposal.workshop.artisanLeader} kiểm tra và xác nhận: ${proposal.unconfirmedConditions.slice(0, 2).join('; ')}.`;
    onSelectWorkshop(proposal.workshopId, suggestedNote);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="bg-[#fbfbfd] w-full max-w-4xl rounded-3xl border border-[#e8e8ed] shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-[#1d1d1f] text-white p-5 sm:p-6 border-b border-[#000000] relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-300" />
                  Smart Matching • Thuật Toán Quy Tắc Minh Bạch
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                  Mã đơn: {request.id}
                </span>
              </div>
              <h3 className="font-heritage text-2xl sm:text-3xl font-semibold tracking-tight">
                Đề Xuất Xưởng Phù Hợp Cho Đơn Hàng
              </h3>
              <p className="text-xs text-white/80 max-w-2xl">
                Sàng lọc xưởng Bát Tràng bằng điều kiện bắt buộc (Hard Filters) và xếp hạng minh bạch theo năng lực chuyên môn, quy mô và tiến độ mẻ lò.
              </p>
            </div>

            <button
              onClick={onClose}
              className="self-end sm:self-center p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          
          {/* Smart Brief Criteria Strip */}
          <div className="p-4 rounded-2xl bg-white border border-[#e8e8ed] shadow-xs space-y-2">
            <div className="flex items-center justify-between border-b border-[#e8e8ed] pb-2 text-xs">
              <span className="font-semibold text-[#1d1d1f] uppercase tracking-wider flex items-center gap-1.5">
                <Info size={14} className="text-[#0071e3]" />
                Tiêu Chí Trích Xuất Từ Yêu Cầu Khách Đã Xác Nhận (Smart Brief)
              </span>
              <span className="text-[11px] font-semibold text-[#86868b]">
                {request.serviceType === 'workshop' ? 'Dịch vụ: Trải nghiệm Workshop' : 'Dịch vụ: Quà tặng thủ công theo lô'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div>
                <span className="text-[#86868b] block text-[11px]">Quy mô yêu cầu:</span>
                <strong className="text-[#1d1d1f]">
                  {matchResult.requiredScale > 0 ? `${matchResult.requiredScale} ${matchResult.scaleUnit}` : 'Chưa chốt số lượng'}
                </strong>
              </div>
              <div>
                <span className="text-[#86868b] block text-[11px]">Hạn mong muốn:</span>
                <strong className="text-[#1d1d1f]">
                  {matchResult.requiredDate || 'Linh hoạt'}
                </strong>
              </div>
              <div>
                <span className="text-[#86868b] block text-[11px]">Dự toán ngân sách:</span>
                <span className="text-[#0071e3] font-semibold">
                  {request.budget || 'Chưa cung cấp'}
                </span>
              </div>
              <div>
                <span className="text-[#86868b] block text-[11px]">Kỹ thuật bắt buộc:</span>
                <span className="text-[#424245] font-medium">
                  {matchResult.requiredTechniques.length > 0 ? matchResult.requiredTechniques.join(', ') : 'Quy chuẩn tiêu chuẩn'}
                </span>
              </div>
            </div>
          </div>

          {/* Demonstrative Notice */}
          <div className="px-3.5 py-2 rounded-xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-amber-700 shrink-0" />
              <span>
                <strong>Nhãn minh họa:</strong> Dữ liệu xưởng và mức giá tham khảo dưới đây phục vụ mô phỏng thuật toán, không thay thế bước thẩm định năng lực và báo giá trực tiếp của nghệ nhân tại Mốc 2.
              </span>
            </div>
          </div>

          {/* CASE A: EMPTY STATE (Không có xưởng phù hợp) */}
          {topRecommendations.length === 0 && (
            <div className="p-6 rounded-2xl bg-red-50/70 border border-red-200 text-xs sm:text-sm text-red-950 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-red-800 text-base">
                <XCircle size={20} className="text-red-600" />
                <span>Không có xưởng nào vượt qua toàn bộ điều kiện lọc cứng (Hard Filters)</span>
              </div>
              <p className="text-red-900 leading-relaxed">
                {emptyExplanation}
              </p>
              {ownerRecommendationTip && (
                <div className="p-3 bg-white/80 rounded-xl border border-red-200/80 text-xs text-red-900 font-medium">
                  💡 {ownerRecommendationTip}
                </div>
              )}
            </div>
          )}

          {/* CASE B: TOP RECOMMENDATIONS (Tối đa 3 phương án) */}
          {topRecommendations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1d1d1f] flex items-center gap-2">
                  <span>Phương Án Đề Xuất Phù Hợp Nhất ({topRecommendations.length}/3)</span>
                </span>
                <span className="text-xs text-[#86868b]">
                  Sắp xếp theo độ phù hợp chuyên môn, công suất và tiến độ
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {topRecommendations.map((proposal, idx) => {
                  const ws = proposal.workshop;
                  const isTopOne = idx === 0;

                  return (
                    <div 
                      key={ws.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isTopOne 
                          ? 'border-[#1d1d1f] bg-white ring-2 ring-[#1d1d1f]/10 shadow-sm' 
                          : 'border-[#e8e8ed] bg-white hover:border-[#0071e3]/40'
                      }`}
                    >
                      {/* Top bar of card */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#e8e8ed]">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={ws.avatar}
                            alt={ws.name}
                            className="w-14 h-14 rounded-xl object-cover border border-[#e8e8ed] shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                                isTopOne ? 'bg-[#1d1d1f] text-amber-200' : 'bg-[#f5f5f7] text-[#6e6e73] border border-[#e8e8ed]'
                              }`}>
                                #{idx + 1} Đề xuất
                              </span>
                              <span className="text-xs text-[#86868b] font-mono">{ws.id}</span>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                                proposal.status === 'phu_hop_so_bo'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}>
                                {proposal.statusLabel}
                              </span>
                            </div>
                            <h4 className="font-heritage text-lg sm:text-xl font-semibold text-[#1d1d1f]">
                              {ws.name}
                            </h4>
                            <p className="text-xs text-[#515154]">
                              Nghệ nhân: <strong>{ws.artisanLeader}</strong> • {ws.generation} ({ws.villageArea})
                            </p>
                          </div>
                        </div>

                        {/* Match score display */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0">
                          <div className="text-right">
                            <span className="text-[10px] text-[#86868b] uppercase tracking-wider block">Điểm quy tắc</span>
                            <span className="font-mono text-xl sm:text-2xl font-semibold text-[#1d1d1f]">
                              {proposal.matchScore}<span className="text-xs text-[#86868b]">/100</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Reasons & Unconfirmed Conditions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3 text-xs border-b border-[#e8e8ed]">
                        {/* Reasons for recommendation */}
                        <div className="space-y-1.5">
                          <span className="font-semibold text-emerald-900 uppercase tracking-wide text-[11px] block flex items-center gap-1.5">
                            <CheckCircle2 size={13} className="text-emerald-700" />
                            Lý do đề xuất:
                          </span>
                          <ul className="space-y-1 text-[#1d1d1f] pl-1">
                            {proposal.reasons.map((r, rIdx) => (
                              <li key={rIdx} className="flex items-start gap-1.5">
                                <span className="text-emerald-600 font-semibold">•</span>
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Unconfirmed conditions that need artisan verification */}
                        <div className="space-y-1.5">
                          <span className="font-semibold text-amber-900 uppercase tracking-wide text-[11px] block flex items-center gap-1.5">
                            <Clock size={13} className="text-amber-700" />
                            Điều kiện xưởng cần xác minh (Mốc 2):
                          </span>
                          <ul className="space-y-1 text-[#515154] pl-1">
                            {proposal.unconfirmedConditions.map((u, uIdx) => (
                              <li key={uIdx} className="flex items-start gap-1.5">
                                <span className="text-amber-600 font-semibold">⚠</span>
                                <span>{u}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Bottom action bar */}
                      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-[#6e6e73]">
                          <span className="block text-[11px] text-[#86868b]">Khung giá tham khảo minh họa:</span>
                          <span className="text-xs font-medium text-[#1d1d1f]">
                            {proposal.indicativePriceNote}
                          </span>
                        </div>

                        <Button
                          variant={isTopOne ? 'terracotta' : 'forest'}
                          size="sm"
                          icon={<ArrowRight size={14} />}
                          onClick={() => handleChoose(proposal)}
                          className="text-xs font-semibold shadow-xs cursor-pointer"
                        >
                          Chọn xưởng này & Điều phối
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hard-filtered out workshops (Collapsible for Transparency) */}
          {ineligibleWorkshops.length > 0 && (
            <div className="pt-2 border-t border-[#e8e8ed]">
              <button
                onClick={() => setShowIneligible(!showIneligible)}
                className="flex items-center justify-between w-full text-xs text-[#6e6e73] hover:text-[#1d1d1f] py-2 cursor-pointer font-medium"
              >
                <span className="flex items-center gap-1.5">
                  <XCircle size={14} className="text-[#86868b]" />
                  Xem danh sách các xưởng không đạt điều kiện lọc cứng ({ineligibleWorkshops.length} xưởng)
                </span>
                {showIneligible ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              {showIneligible && (
                <div className="mt-2 space-y-2 animate-in fade-in duration-150">
                  {ineligibleWorkshops.map((inelig) => (
                    <div 
                      key={inelig.workshopId}
                      className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <strong className="text-[#424245]">{inelig.workshopName}</strong>
                        <span className="text-[11px] text-[#86868b] font-mono ml-2">({inelig.workshopId})</span>
                      </div>
                      <div className="text-red-700 text-xs text-right sm:max-w-md">
                        {inelig.rejectionReasons.join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#f5f5f7] border-t border-[#e8e8ed] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-[#6e6e73]">
            * Hệ thống không tự động chuyển trạng thái đơn hàng khi chưa có xác nhận từ Điều phối viên.
          </span>

          <div className="flex items-center gap-2">
            {onOpenManualDispatch && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenManualDispatch();
                }}
                className="text-xs"
              >
                Tự chọn xưởng thủ công
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Đóng lại
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
