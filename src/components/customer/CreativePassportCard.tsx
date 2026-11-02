import React, { useState } from 'react';
import { 
  QrCode, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  AlertCircle, 
  Award,
  ChevronDown,
  ChevronUp,
  FileCheck,
  History,
  GitBranch,
  Lock,
  ArrowRight,
  PlusCircle,
  FileText,
  Store,
  Calendar,
  Layers
} from 'lucide-react';
import type { CreativePassportRecord, OrderRequest, UserRole, CreativePassportVersion, PassportMilestone } from '../../types';
import { buildPassportMilestones } from '../../utils/creativePassportTimeline';
import { useApp } from '../../context/AppContext';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

interface CreativePassportCardProps {
  passport: CreativePassportRecord;
  request?: OrderRequest;
  userRole?: UserRole;
  className?: string;
}

export const CreativePassportCard: React.FC<CreativePassportCardProps> = ({
  passport,
  request,
  userRole = 'customer',
  className = ''
}) => {
  const { requests, proposePassportVersion, reviewPassportVersion } = useApp();

  // Find linked request if not provided
  const targetRequest: OrderRequest | undefined = request || requests.find(r => r.id === passport.orderId);

  // Derive 7 visual milestones
  const milestones: PassportMilestone[] = targetRequest 
    ? buildPassportMilestones(targetRequest, userRole)
    : [
        {
          id: 'm1_brief',
          stepIndex: 1,
          label: 'Khách xác nhận yêu cầu',
          status: 'completed',
          timestamp: passport.createdAt,
          actorRole: 'Khách hàng',
          actorName: passport.clientName,
          summary: passport.requirementSummary,
          documentRef: 'Smart Brief đã chuẩn hóa'
        }
      ];

  // Accordion / Collapsible states
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showTimelineDetails, setShowTimelineDetails] = useState(true);
  const [isProposeModalOpen, setIsProposeModalOpen] = useState(false);

  // Propose version form state
  const [proposeBy, setProposeBy] = useState(userRole === 'owner' ? 'Điều phối viên' : 'Khách hàng');
  const [changeSummary, setChangeSummary] = useState('');
  const [newScale, setNewScale] = useState<string>('');
  const [newDate, setNewDate] = useState<string>('');
  const [newBudget, setNewBudget] = useState<string>('');
  const [newSpecialRequests, setNewSpecialRequests] = useState<string>('');

  const isQcPassed = passport.qcStatus === 'dat_chuan';
  const isQcFailed = passport.qcStatus === 'can_xu_ly';
  const isApproved = !!passport.approverName;
  const isCompleted = !!passport.completedDate;
  const isArtisanRole = userRole === 'artisan';

  const versions: CreativePassportVersion[] = passport.versions || [];
  const activeVersionId = passport.activeVersionId || 'V1';
  const activeVersion = versions.find(v => v.versionId === activeVersionId) || versions[0];
  const pendingVersions = versions.filter(v => v.status === 'pending_review');

  const handleOpenProposeModal = () => {
    setChangeSummary('');
    setNewScale(targetRequest?.structuredRequirement?.scaleOrQuantity?.toString() || '');
    setNewDate(targetRequest?.targetDate || '');
    setNewBudget(targetRequest?.budget || '');
    setNewSpecialRequests(targetRequest?.structuredRequirement?.personalizationOrSpecialRequests || '');
    setIsProposeModalOpen(true);
  };

  const handleSubmitProposeVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRequest) return;
    if (!changeSummary.trim()) {
      alert('Vui lòng nêu rõ lý do và nội dung thay đổi phiên bản.');
      return;
    }

    const res = proposePassportVersion(targetRequest.id, {
      proposedBy: proposeBy,
      changeSummary: changeSummary.trim(),
      newScale: newScale ? parseInt(newScale, 10) : undefined,
      newDate: newDate.trim() || undefined,
      newBudget: newBudget.trim() || undefined,
      newSpecialRequests: newSpecialRequests.trim() || undefined
    });

    if (res.success) {
      setIsProposeModalOpen(false);
      setShowVersionHistory(true);
    } else if (res.message) {
      alert(res.message);
    }
  };

  const handleApproveVersion = (versionId: string) => {
    if (!targetRequest) return;
    const reviewerName = userRole === 'owner' ? 'Điều phối viên MADE IN VIETNAM LAB' : (passport.clientName || 'Khách hàng');
    const res = reviewPassportVersion(targetRequest.id, versionId, 'approved', reviewerName, 'Đã thẩm định và chấp thuận điều chỉnh phiên bản');
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  const handleRejectVersion = (versionId: string) => {
    if (!targetRequest) return;
    const reviewerName = userRole === 'owner' ? 'Điều phối viên' : (passport.clientName || 'Khách hàng');
    const res = reviewPassportVersion(targetRequest.id, versionId, 'rejected', reviewerName, 'Không phê duyệt thay đổi, giữ nguyên phiên bản trước');
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  return (
    <div className={`rounded-3xl border-2 border-[#0071e3]/40 bg-gradient-to-br from-[#f5f5f7] via-white to-[#f0f7ff] p-5 sm:p-7 shadow-sm relative overflow-hidden space-y-6 ${className}`}>
      
      {/* Background seal watermark */}
      <div className="absolute -right-8 -bottom-8 w-48 h-48 rounded-full border-8 border-[#0071e3]/5 flex items-center justify-center font-heritage text-5xl text-[#0071e3]/5 font-semibold pointer-events-none select-none">
        MIVL
      </div>

      {/* 1. Header & Passport Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e8e8ed] pb-4 gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#1d1d1f] text-amber-200 flex items-center justify-center font-heritage text-xl font-semibold shadow-xs shrink-0">
            CP
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono tracking-widest text-[#0071e3] uppercase font-semibold">
                HỒ SƠ SÁNG TẠO & GIAO DỊCH (CREATIVE PASSPORT)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold font-mono">
                Khởi tạo: {passport.createdAt}
              </span>
              {activeVersionId && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 font-semibold border border-indigo-200 flex items-center gap-1">
                  <GitBranch size={10} />
                  Phiên bản: {activeVersionId}
                </span>
              )}
            </div>
            <h4 className="font-heritage text-xl sm:text-2xl font-semibold text-[#1d1d1f]">
              {passport.title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#1d1d1f]/10 text-[#1d1d1f] font-semibold border border-[#1d1d1f]/20">
            {passport.passportId}
          </span>
        </div>
      </div>

      {/* Role Protection Banner for Artisan */}
      {isArtisanRole && (
        <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
          <Lock size={15} className="text-blue-700 shrink-0" />
          <span>
            <strong>Bảo mật nền tảng:</strong> Phí điều phối nội bộ và thông tin liên hệ cá nhân của khách được bảo mật, chỉ hiển thị thông số kỹ thuật chế tác và lịch thực hiện cho xưởng.
          </span>
        </div>
      )}

      {/* 2. Visual Timeline: 7 Mốc Giao Dịch & Thực Hiện (Mục III) */}
      <div className="bg-white rounded-2xl p-5 border border-[#e8e8ed] shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#e8e8ed] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-[#0071e3] uppercase tracking-wider block">
              TIẾN TRÌNH TRỰC QUAN • 7 MỐC GIAO DỊCH
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1d1d1f]/10 text-[#1d1d1f]">
              Đồng bộ tự động
            </span>
          </div>

          <button
            onClick={() => setShowTimelineDetails(!showTimelineDetails)}
            className="text-xs text-[#6e6e73] hover:text-[#1d1d1f] flex items-center gap-1 cursor-pointer font-medium"
          >
            <span>{showTimelineDetails ? 'Thu gọn chi tiết' : 'Xem chi tiết mốc'}</span>
            {showTimelineDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Timeline Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 pt-1">
          {milestones.map((m) => {
            const isDone = m.status === 'completed';
            const isInProgress = m.status === 'in_progress';
            const isFailed = m.status === 'failed';

            return (
              <div 
                key={m.id}
                className={`p-3 rounded-xl border transition-all text-xs flex flex-col justify-between ${
                  isDone 
                    ? 'border-emerald-300 bg-emerald-50/60' 
                    : isInProgress
                    ? 'border-[#0071e3] bg-[#f0f7ff] ring-1 ring-[#0071e3]/30'
                    : isFailed
                    ? 'border-red-300 bg-red-50/60'
                    : 'border-[#e8e8ed] bg-[#f5f5f7] opacity-75'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-semibold text-[#86868b]">
                      #{m.stepIndex}
                    </span>
                    {isDone ? (
                      <CheckCircle2 size={15} className="text-emerald-700" />
                    ) : isInProgress ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3] animate-pulse" />
                    ) : isFailed ? (
                      <AlertCircle size={15} className="text-red-700" />
                    ) : (
                      <Clock size={14} className="text-[#86868b]" />
                    )}
                  </div>
                  <strong className="block text-[11px] leading-tight text-[#1d1d1f] mb-1">
                    {m.label}
                  </strong>
                </div>

                {showTimelineDetails && (
                  <div className="pt-2 border-t border-black/5 mt-1 text-[10px] space-y-0.5 text-[#515154]">
                    {m.timestamp && (
                      <span className="block font-mono text-[9px] text-[#86868b]">{m.timestamp}</span>
                    )}
                    <span className="block font-medium text-[#424245] line-clamp-2">{m.summary}</span>
                    {m.documentRef && (
                      <span className="block text-[9px] text-[#0071e3] font-semibold truncate">📄 {m.documentRef}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Ba Lần Xác Nhận: Một Hồ Sơ — Ba Nhóm Xác Nhận (Mục V) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
        
        {/* LẦN 1: Xác Nhận Nhu Cầu */}
        <div className="p-4 rounded-2xl bg-white border border-[#e8e8ed] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#e8e8ed] pb-2">
            <div className="flex items-center gap-1.5 text-[#1d1d1f] font-semibold text-xs uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1d1d1f]" />
              Lần 1: Xác Nhận Nhu Cầu
            </div>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Khách đã duyệt
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#86868b] block">Mã đơn hàng / Yêu cầu:</span>
            <strong className="text-[#1d1d1f] font-mono">{passport.orderId}</strong>
          </div>

          <div>
            <span className="text-[11px] text-[#86868b] block">Khách hàng xác nhận:</span>
            <strong className="text-[#1d1d1f]">{passport.clientName} {passport.clientOrg ? `(${passport.clientOrg})` : ''}</strong>
          </div>

          <div>
            <span className="text-[11px] text-[#86868b] block">Thời hạn mong muốn:</span>
            <span className="text-[#1d1d1f] font-semibold">{passport.targetDate}</span>
          </div>

          {passport.rawBrief && (
            <div className="p-2.5 rounded-xl bg-[#f5f5f7] border border-[#e8e8ed]">
              <span className="text-[10px] text-[#86868b] font-semibold block mb-0.5">Mô tả gốc (Ngôn ngữ tự nhiên):</span>
              <p className="text-[#424245] text-[11px]  leading-relaxed">"{passport.rawBrief}"</p>
            </div>
          )}

          <div>
            <span className="text-[11px] text-[#86868b] block">Thông số Smart Brief:</span>
            <p className="text-[#1d1d1f] text-xs font-medium leading-relaxed">{passport.requirementSummary}</p>
          </div>
        </div>

        {/* LẦN 2: Phương Án & Thiết Kế Đã Duyệt */}
        <div className="p-4 rounded-2xl bg-white border border-[#e8e8ed] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#e8e8ed] pb-2">
            <div className="flex items-center gap-1.5 text-[#0071e3] font-semibold text-xs uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />
              Lần 2: Phương Án Đã Duyệt
            </div>
            {isApproved ? (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Đã phê duyệt
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                Chờ phê duyệt
              </span>
            )}
          </div>

          <div>
            <span className="text-[11px] text-[#86868b] block">Xưởng thực hiện:</span>
            <strong className="text-[#1d1d1f]">
              {passport.workshopName || 'Đang chờ phân công'}
            </strong>
          </div>

          <div>
            <span className="text-[11px] text-[#86868b] block">Phiên bản thiết kế / Chương trình:</span>
            <span className="font-mono text-[#0071e3] font-semibold">
              {passport.approvedDesignVersion || 'Chưa xác lập'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#86868b] block">Người phê duyệt & Ngày chốt:</span>
            <span className="text-[#424245]">
              {isApproved 
                ? `${passport.approverName} (${passport.approvedDate})` 
                : 'Chưa có dữ liệu (Đang chờ khách duyệt)'}
            </span>
          </div>

          {/* Pricing transparency - Masked for artisan role */}
          {!isArtisanRole && passport.clientTotalPrice && (
            <div className="p-2.5 rounded-xl bg-[#f0f7ff] border border-[#0071e3]/20">
              <span className="text-[10px] text-[#86868b] block">Tổng chi phí trọn gói khách thanh toán:</span>
              <strong className="text-sm font-semibold text-[#0071e3] block">
                {passport.clientTotalPrice}
              </strong>
            </div>
          )}

          <div>
            <span className="text-[11px] text-[#86868b] block">Phạm vi đã xác nhận:</span>
            <p className="text-[#515154] text-xs leading-relaxed line-clamp-2">
              {passport.approvedScope || 'Chưa xác lập'}
            </p>
          </div>
        </div>

        {/* LẦN 3: Nghiệm Thu QC & Bàn Giao */}
        <div className="p-4 rounded-2xl bg-white border border-[#e8e8ed] shadow-xs space-y-2.5">
          <div className="flex items-center justify-between border-b border-[#e8e8ed] pb-2">
            <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-xs uppercase tracking-wider">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              Lần 3: Kiểm Tra QC & Bàn Giao
            </div>
            {isCompleted ? (
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                Hoàn tất
              </span>
            ) : isQcPassed ? (
              <span className="text-[10px] font-semibold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                QC Đạt chuẩn
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-[#86868b] bg-gray-100 px-2 py-0.5 rounded-full">
                Chờ nghiệm thu
              </span>
            )}
          </div>

          <div>
            <span className="text-[11px] text-[#86868b] block">Kiểm định chất lượng (QC):</span>
            {isQcPassed ? (
              <div className="space-y-0.5">
                <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                  <CheckCircle2 size={13} />
                  Đạt tiêu chuẩn hồ sơ đã duyệt
                </span>
                <span className="block text-[11px] text-[#6e6e73]">
                  Bởi: {passport.qcCheckedBy} ({passport.qcCheckedAt})
                </span>
                {passport.qcNotes && (
                  <p className="text-[11px] text-[#515154] ">"{passport.qcNotes}"</p>
                )}
              </div>
            ) : isQcFailed ? (
              <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                <AlertCircle size={13} />
                Cần xử lý bổ sung: {passport.qcNotes}
              </span>
            ) : (
              <span className="text-[#86868b]">Chưa kiểm tra (Đang chế tác/chuẩn bị)</span>
            )}
          </div>

          <div className="pt-1 border-t border-black/5">
            <span className="text-[11px] text-[#86868b] block">Xác nhận hoàn tất bàn giao:</span>
            <strong className="text-[#1d1d1f]">
              {passport.handoverConfirmedBy || 'Chưa bàn giao'}
            </strong>
          </div>

          <div>
            <span className="text-[11px] text-[#86868b] block">Căn cứ bàn giao:</span>
            <span className="text-[#424245] font-medium text-xs">
              {passport.handoverBasis || 'Chưa có dữ liệu'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-[#86868b] block">Ngày nghiệm thu hoàn tất:</span>
            <span className="text-[#1d1d1f] font-semibold">
              {passport.completedDate || 'Đang thực hiện'}
            </span>
          </div>
        </div>

      </div>

      {/* 4. Quản Lý Phiên Bản Đơn Giản: V1 - V2 - V3 (Mục IV) */}
      <div className="bg-white rounded-2xl p-5 border border-[#e8e8ed] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8e8ed] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-semibold text-xs font-mono">
              <Layers size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold text-[#1d1d1f] uppercase tracking-wider block">
                  QUẢN LÝ PHIÊN BẢN HỒ SƠ (VERSION CONTROL)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                  {versions.length} phiên bản
                </span>
                {pendingVersions.length > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                    Có {pendingVersions.length} bản chờ duyệt
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6e6e73]">
                Lưu giữ đầy đủ lịch sử V1 – V2 khi có thay đổi thực tế, không ghi đè dữ liệu đã phê duyệt.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCompleted && (userRole === 'customer' || userRole === 'owner') && (
              <Button
                variant="outline"
                size="sm"
                icon={<PlusCircle size={14} />}
                onClick={handleOpenProposeModal}
                className="text-xs font-semibold text-[#1d1d1f] hover:border-[#1d1d1f]"
              >
                Đề xuất điều chỉnh (Tạo V{versions.length + 1})
              </Button>
            )}

            <button
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className="px-3 py-1.5 rounded-xl border border-[#d2d2d7] text-xs text-[#515154] hover:bg-[#f5f5f7] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{showVersionHistory ? 'Thu gọn' : 'Xem toàn bộ'}</span>
              {showVersionHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          </div>
        </div>

        {/* Version List */}
        <div className="space-y-3">
          {versions.map((ver) => {
            const isCurrentActive = ver.versionId === activeVersionId;
            const isApprovedVer = ver.status === 'approved';
            const isPendingVer = ver.status === 'pending_review';
            const isSuperseded = ver.status === 'superseded';

            return (
              <div 
                key={ver.versionId}
                className={`p-4 rounded-xl border transition-all text-xs space-y-2 ${
                  isCurrentActive 
                    ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-400/30' 
                    : isPendingVer
                    ? 'border-amber-300 bg-amber-50/50'
                    : 'border-[#e8e8ed] bg-[#f5f5f7]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#1d1d1f] text-white">
                      {ver.versionId}
                    </span>
                    <span className="font-semibold text-[#1d1d1f]">{ver.changeSummary}</span>
                    {isCurrentActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        Bản đang áp dụng
                      </span>
                    )}
                    {isPendingVer && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold border border-amber-300">
                        Chờ xem xét & duyệt
                      </span>
                    )}
                    {isSuperseded && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 ">
                        Đã thay thế (Lưu vết)
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-[#6e6e73]">
                    Đề xuất bởi: <strong>{ver.proposedBy}</strong> ({ver.createdAt})
                  </div>
                </div>

                {/* Details Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  {ver.details.scaleOrQuantity && (
                    <div>
                      <span className="text-[#86868b] block">Quy mô/Số lượng:</span>
                      <strong className="text-[#1d1d1f]">{ver.details.scaleOrQuantity} {passport.serviceType === 'workshop' ? 'người' : 'bộ'}</strong>
                    </div>
                  )}
                  {ver.details.targetTimeline && (
                    <div>
                      <span className="text-[#86868b] block">Thời hạn/Ngày:</span>
                      <strong className="text-[#1d1d1f]">{ver.details.targetTimeline}</strong>
                    </div>
                  )}
                  {ver.details.budgetEstimated && !isArtisanRole && (
                    <div>
                      <span className="text-[#86868b] block">Dự toán:</span>
                      <strong className="text-[#0071e3]">{ver.details.budgetEstimated}</strong>
                    </div>
                  )}
                  {ver.details.specialRequests && (
                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[#86868b] block">Yêu cầu đặc thù:</span>
                      <span className="text-[#424245] truncate block">{ver.details.specialRequests}</span>
                    </div>
                  )}
                </div>

                {/* Review Notes or Approval Info */}
                {ver.approvedBy && (
                  <div className="text-[11px] text-emerald-900 pt-1 border-t border-black/5 flex items-center justify-between">
                    <span>Đã phê duyệt bởi: <strong>{ver.approvedBy}</strong> ({ver.approvedAt})</span>
                    <span className="text-[10px] text-[#6e6e73] ">{ver.reviewNotes}</span>
                  </div>
                )}

                {/* Actions for pending version (Review / Approval) */}
                {isPendingVer && (userRole === 'owner' || userRole === 'customer') && (
                  <div className="pt-2 border-t border-amber-200 flex items-center justify-end gap-2">
                    <span className="text-[11px] text-amber-900 mr-auto font-medium">
                      ⚠ Thay đổi này chưa được áp dụng vào đơn hàng đang thực hiện cho tới khi được phê duyệt.
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRejectVersion(ver.versionId)}
                      className="text-xs text-red-700 hover:bg-red-50"
                    >
                      Từ chối
                    </Button>
                    <Button
                      variant="forest"
                      size="sm"
                      icon={<CheckCircle2 size={13} />}
                      onClick={() => handleApproveVersion(ver.versionId)}
                      className="text-xs font-semibold"
                    >
                      Phê duyệt & Áp dụng {ver.versionId}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Footer & Notice */}
      <div className="p-4 bg-[#f5f5f7] rounded-2xl border border-[#e8e8ed] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#515154]">
        <div className="flex items-start gap-2.5">
          <QrCode size={20} className="text-[#1d1d1f] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#1d1d1f] block">Mã định danh hồ sơ sáng tạo: {passport.passportId}</strong>
            <p className="text-[11px] leading-relaxed text-[#6e6e73]">
              Creative Passport lưu vết minh bạch toàn bộ 3 mốc xác nhận giữa Khách hàng, Nghệ nhân Bát Tràng và Điều phối viên. <em>Không thay thế chứng chỉ pháp lý hay bảo lãnh tài chính.</em>
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-[#86868b] shrink-0 self-end sm:self-auto">
          MIVL PROTOCOL V2B.03
        </span>
      </div>

      {/* PROPOSE VERSION MODAL */}
      <Modal
        isOpen={isProposeModalOpen}
        onClose={() => setIsProposeModalOpen(false)}
        title="Đề Xuất Điều Chỉnh Thông Số (Tạo Phiên Bản Mới)"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitProposeVersion} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 leading-relaxed">
            <strong>Nguyên tắc đề án (Mục IV):</strong> Mọi thay đổi về số lượng, ngân sách hoặc thời hạn sẽ được ghi nhận thành phiên bản mới (V{versions.length + 1}) ở trạng thái <em>Chờ xem xét</em>. Bản V{activeVersionId} đang thực hiện sẽ không bị ghi đè.
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Người đề xuất thay đổi
            </label>
            <input
              type="text"
              required
              value={proposeBy}
              onChange={(e) => setProposeBy(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Lý do & Nội dung thay đổi (Bắt buộc)
            </label>
            <textarea
              required
              rows={2}
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Ví dụ: Khách đề xuất tăng số lượng từ 20 lên 25 bộ do bổ sung khách mời; dời ngày tổ chức sang 15/11/2026..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
                {passport.serviceType === 'workshop' ? 'Số người tham gia mới' : 'Số lượng sản phẩm mới'}
              </label>
              <input
                type="number"
                value={newScale}
                onChange={(e) => setNewScale(e.target.value)}
                placeholder="Ví dụ: 25"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#d2d2d7] bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
                Thời hạn / Ngày hẹn mới
              </label>
              <input
                type="text"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                placeholder="Ví dụ: 15/11/2026"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#d2d2d7] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Yêu cầu kỹ thuật / Ghi chú bổ sung
            </label>
            <input
              type="text"
              value={newSpecialRequests}
              onChange={(e) => setNewSpecialRequests(e.target.value)}
              placeholder="Ví dụ: Giữ nguyên quy cách đóng hộp, thêm logo nhũ vàng..."
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#d2d2d7] bg-white"
            />
          </div>

          <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsProposeModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button variant="terracotta" size="sm" type="submit" className="font-semibold">
              Xác nhận khởi tạo V{versions.length + 1}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
