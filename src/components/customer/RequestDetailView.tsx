import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { OrderRequest, HandoverRecord } from '../../types';
import { Button } from '../common/Button';
import { CreativePassportCard } from './CreativePassportCard';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Store, 
  ShieldCheck, 
  Award,
  Sparkles,
  FileCheck,
  Check,
  PackageCheck
} from 'lucide-react';

interface RequestDetailViewProps {
  request: OrderRequest;
  onBack: () => void;
  onOpenChat: () => void;
}

export const RequestDetailView: React.FC<RequestDetailViewProps> = ({
  request,
  onBack,
  onOpenChat
}) => {
  const { customerApprove, confirmHandover } = useApp();

  // Mốc 2: State phê duyệt mẫu & báo giá
  const [approverName, setApproverName] = useState(request.contactName);
  const [confirmedSampleOrSpecs, setConfirmedSampleOrSpecs] = useState('');
  const [isSampleConfirmed, setIsSampleConfirmed] = useState(false);

  // Mốc 3: State xác nhận nhận hàng
  const [clientReceivedNotes, setClientReceivedNotes] = useState('');

  const handleApprove = () => {
    if (!isSampleConfirmed) return;
    const fallbackSpecs = request.serviceType === 'gifts'
      ? `Đồng ý mẫu thiết kế ${request.ownerProposal?.designOrProgramVersion || 'VER-CHOT'} và quy cách kỹ thuật`
      : `Đồng ý chương trình workshop ${request.ownerProposal?.designOrProgramVersion || 'VER-CHOT'} và lịch hẹn`;

    const res = customerApprove(request.id, {
      approvedBy: approverName || request.contactName,
      confirmedSampleOrSpecs: confirmedSampleOrSpecs.trim() || fallbackSpecs,
      notes: 'Khách hàng xác nhận đồng ý mẫu thiết kế, báo giá và điều kiện hợp tác'
    });

    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  const handleClientConfirmHandover = () => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const handover: HandoverRecord = {
      confirmedBy: request.contactName,
      confirmedAt: formattedDate,
      method: 'client_online',
      documentBasis: 'Khách hàng xác nhận hoàn tất trực tuyến trên Customer Portal',
      notes: clientReceivedNotes.trim() || 'Khách hàng xác nhận dịch vụ/thành phẩm hoàn tất trực tuyến',
      postFiringFollowupStatus: request.serviceType === 'workshop' 
        ? (request.artisanExecutionReport?.postFiringFollowup || 'Đã giao tại workshop hoặc lưu nung giao sau') 
        : undefined
    };

    const res = confirmHandover(request.id, handover);
    if (!res.success && res.message) {
      alert(res.message);
    }
  };

  const getStatusText = (status: OrderRequest['status']) => {
    switch (status) {
      case 'cho_tiep_nhan':
        return 'Chờ tiếp nhận từ chuyên viên điều phối';
      case 'dang_tu_van':
        return 'Đang tư vấn và làm rõ thông số yêu cầu';
      case 'da_chuyen_xuong':
        return 'Đang đợi xưởng Bát Tràng phản hồi khả năng & báo giá';
      case 'cho_owner_kiem_tra':
        return 'Xưởng đã phản hồi • Điều phối viên đang kiểm tra phương án';
      case 'cho_khach_duyet':
        return 'Phương án & Báo giá đã sẵn sàng • Chờ bạn phê duyệt';
      case 'dang_thuc_hien':
        return request.serviceType === 'workshop' 
          ? 'Đang chuẩn bị tổ chức buổi workshop trải nghiệm' 
          : 'Đang tiến hành tạo hình và chế tác tại xưởng';
      case 'cho_owner_qc':
        return 'Xưởng đã báo xong • Điều phối viên đang kiểm tra chất lượng (QC)';
      case 'cho_khach_nghiem_thu':
        return 'QC Đạt chuẩn • Chờ bạn xác nhận nhận hàng hoặc hoàn tất dịch vụ';
      case 'can_xu_ly_qc':
        return 'Đang hiệu chỉnh chất lượng theo yêu cầu của Điều phối viên';
      case 'hoan_thanh':
        return 'Đã nghiệm thu kiểm định và bàn giao thành phẩm hoàn tất';
      case 'xuong_tu_choi':
        return 'Xưởng bận lịch • Điều phối viên đang chuyển xưởng khác';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Back button & top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e8ed]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl border border-[#d2d2d7] hover:bg-white text-[#424245] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold text-[#0071e3]">{request.id}</span>
              <span className="text-xs text-[#86868b]">| Gửi lúc: {request.createdAt}</span>
            </div>
            <h2 className="font-heritage text-2xl sm:text-3xl font-semibold text-[#1d1d1f]">
              {request.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<MessageSquare size={14} />}
            onClick={onOpenChat}
            className="text-xs font-semibold"
          >
            Nhắn tin với chuyên viên điều phối
          </Button>
        </div>
      </div>

      {/* 3 Step Progress Tracking Bar (Chuẩn hóa theo Mục II) */}
      <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold tracking-wider uppercase text-[#0071e3] block">
            TIẾN TRÌNH: MỘT HỒ SƠ — BA LẦN XÁC NHẬN
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#1d1d1f]/10 text-[#1d1d1f]">
            {getStatusText(request.status)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Mốc 1: Xác nhận nhu cầu */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1d1d1f]">
              <span>Mốc 1: Xác Nhận Nhu Cầu</span>
              <CheckCircle2 size={16} className="text-emerald-700" />
            </div>
            <p className="text-xs text-[#6e6e73]">
              Yêu cầu đã được bạn đối chiếu và gửi lên hệ thống.
            </p>
          </div>

          {/* Mốc 2: Thẩm định khả thi & Phê duyệt */}
          <div className={`p-4 rounded-xl border space-y-1 transition-all ${
            request.status === 'dang_thuc_hien' || request.status === 'cho_owner_qc' || request.status === 'cho_khach_nghiem_thu' || request.status === 'hoan_thanh'
              ? 'border-emerald-200 bg-emerald-50/50'
              : request.status === 'cho_khach_duyet'
              ? 'border-[#0071e3] bg-[#f0f7ff] ring-1 ring-[#0071e3]/40'
              : 'border-[#e8e8ed] bg-[#f5f5f7]'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-[#1d1d1f]">
              <span>Mốc 2: Xác Nhận Khả Thi & Duyệt</span>
              {request.status === 'dang_thuc_hien' || request.status === 'cho_owner_qc' || request.status === 'cho_khach_nghiem_thu' || request.status === 'hoan_thanh' ? (
                <CheckCircle2 size={16} className="text-emerald-700" />
              ) : request.status === 'cho_khach_duyet' ? (
                <span className="text-xs text-[#0071e3] font-mono font-semibold animate-pulse">Cần bạn duyệt</span>
              ) : (
                <Clock size={16} className="text-[#86868b]" />
              )}
            </div>
            <p className="text-xs text-[#6e6e73]">
              {request.status === 'cho_khach_duyet' 
                ? 'Phương án & báo giá đã chuẩn bị xong, chờ bạn duyệt.' 
                : request.clientApproval?.approved
                ? `Đã duyệt phiên bản ${request.clientApproval.approvedDesignVersion}`
                : 'Xưởng và Điều phối viên thẩm định năng lực & giá.'}
            </p>
          </div>

          {/* Mốc 3: Kiểm tra chất lượng & Bàn giao */}
          <div className={`p-4 rounded-xl border space-y-1 ${
            request.status === 'hoan_thanh'
              ? 'border-emerald-200 bg-emerald-50/50'
              : request.status === 'cho_khach_nghiem_thu'
              ? 'border-teal-200 bg-teal-50/50 ring-1 ring-teal-500/40'
              : 'border-[#e8e8ed] bg-[#f5f5f7]'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold text-[#1d1d1f]">
              <span>Mốc 3: Xác Nhận Hoàn Tất</span>
              {request.status === 'hoan_thanh' ? (
                <CheckCircle2 size={16} className="text-emerald-700" />
              ) : request.status === 'cho_khach_nghiem_thu' ? (
                <span className="text-xs text-teal-800 font-semibold animate-pulse">Chờ bạn xác nhận</span>
              ) : (
                <Award size={16} className="text-[#86868b]" />
              )}
            </div>
            <p className="text-xs text-[#6e6e73]">
              {request.status === 'hoan_thanh'
                ? 'Đã nghiệm thu đạt chuẩn và bàn giao hoàn tất.'
                : request.status === 'cho_khach_nghiem_thu'
                ? 'QC đã đạt chuẩn, chờ bạn xác nhận nhận hàng / hoàn tất.'
                : 'Kiểm tra chất lượng và nhận bàn giao.'}
            </p>
          </div>

        </div>
      </div>

      {/* MỐC 1: BẢN THÔNG SỐ YÊU CẦU ĐÃ CHUẨN HÓA (ĐỢT 2B.01) */}
      <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e8e8ed]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0071e3]/10 text-[#0071e3] flex items-center justify-center font-semibold font-mono text-xs">
              01
            </div>
            <div>
              <span className="text-[11px] font-mono font-semibold tracking-wider uppercase text-[#0071e3] block">
                MỐC 1 • HỒ SƠ YÊU CẦU ĐÃ CHUẨN HÓA
              </span>
              <h3 className="font-heritage text-lg font-semibold text-[#1d1d1f]">
                Bản Thông Số Khách Hàng Đã Đối Chiếu & Xác Nhận
              </h3>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto flex items-center gap-1.5">
            <CheckCircle2 size={13} />
            Đã khách hàng xác nhận
          </span>
        </div>

        {/* Raw brief quotation */}
        {request.rawBrief && (
          <div className="p-3.5 rounded-xl bg-[#f5f5f7] border border-[#e8e8ed] text-xs space-y-1">
            <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wide block">
              Mô tả ban đầu bằng ngôn ngữ tự nhiên:
            </span>
            <p className="text-[#1d1d1f]  leading-relaxed">
              "{request.rawBrief}"
            </p>
          </div>
        )}

        {/* Structured specs grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed]">
            <span className="text-[#86868b] block text-[11px]">Loại hình dịch vụ:</span>
            <strong className="text-[#1d1d1f] text-sm block mt-0.5">
              {request.serviceType === 'workshop' ? 'Trải Nghiệm Workshop' : 'Quà Tặng Thủ Công'}
            </strong>
          </div>

          <div className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed]">
            <span className="text-[#86868b] block text-[11px]">Quy mô / Số lượng:</span>
            <strong className="text-[#1d1d1f] text-sm block mt-0.5">
              {request.serviceType === 'workshop' 
                ? `${request.workshopDetails?.participantsCount || 'Chưa rõ'} người` 
                : `${request.giftsDetails?.quantity || 'Chưa rõ'} sản phẩm`}
            </strong>
          </div>

          <div className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed]">
            <span className="text-[#86868b] block text-[11px]">Ngân sách dự kiến:</span>
            <strong className="text-[#0071e3] text-sm block mt-0.5">
              {request.budget || 'Đang trao đổi'}
            </strong>
          </div>

          <div className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed]">
            <span className="text-[#86868b] block text-[11px]">Thời hạn mong muốn:</span>
            <strong className="text-[#1d1d1f] text-sm block mt-0.5">
              {request.targetDate || 'Đang thống nhất'}
            </strong>
          </div>
        </div>

        {/* Personalization & Special requirements */}
        <div className="p-3.5 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed] text-xs space-y-1">
          <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wide block">
            {request.serviceType === 'workshop' ? 'Chủ đề / Yêu cầu tổ chức:' : 'Dòng sản phẩm & Yêu cầu cá nhân hóa:'}
          </span>
          <p className="text-[#1d1d1f] leading-relaxed">
            {request.serviceType === 'workshop'
              ? (request.workshopDetails?.specialRequests || request.structuredRequirement?.personalizationOrSpecialRequests || 'Không có yêu cầu đặc biệt')
              : `${request.giftsDetails?.productType || 'Sản phẩm thủ công'}${request.giftsDetails?.personalizationNotes ? ` — ${request.giftsDetails.personalizationNotes}` : ''}`}
          </p>
        </div>

        {/* Audit Disclaimer Notice: Yêu cầu 7 */}
        <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
          <Clock size={14} className="text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong>Lưu ý cam kết:</strong> Bản thông số trên là cơ sở chuẩn hóa sơ bộ để Điều phối viên chuyển sang xưởng Bát Tràng. Báo giá trọn gói, lịch thực tế và tính khả thi kỹ thuật chỉ được xác lập chính thức sau khi xưởng và chuyên viên thẩm định năng lực tại Mốc 2.
          </div>
        </div>
      </div>

      {/* ACTION BANNER WHEN WAITING FOR CUSTOMER APPROVAL (MỐC 2 - MỤC 2) */}
      {request.status === 'cho_khach_duyet' && request.ownerProposal && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-[#0071e3] shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
            <div>
              <span className="text-xs font-mono font-semibold text-[#0071e3] uppercase tracking-wider block">
                BƯỚC PHÊ DUYỆT BẮT BUỘC (MỐC 2)
              </span>
              <h3 className="font-heritage text-xl sm:text-2xl font-semibold text-[#1d1d1f]">
                Phương Án Chế Tác & Báo Giá Trọn Gói Đã Sẵn Sàng
              </h3>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
              Chờ bạn phê duyệt
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed] space-y-1.5">
              <span className="text-[#86868b] block text-xs">Xưởng thực hiện:</span>
              <strong className="text-[#1d1d1f] text-base">{request.assignedWorkshopName}</strong>
              <p className="text-xs text-[#515154]">
                {request.artisanResponse?.technicalNotes || 'Đã đối chiếu khả năng đáp ứng kỹ thuật và lịch nung.'}
              </p>
            </div>

            <div className="p-4 bg-[#f0f7ff] rounded-xl border border-[#0071e3]/30 space-y-1.5">
              <span className="text-[#86868b] block text-xs">Tổng chi phí thanh toán trọn gói:</span>
              <strong className="text-xl font-semibold text-[#0071e3] block">
                {request.ownerProposal.clientTotalPrice}
              </strong>
              <span className="text-xs text-[#6e6e73] block">
                Lịch dự kiến: {request.ownerProposal.proposedSchedule}
              </span>
            </div>
          </div>

          <div className="p-4 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed] space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center pb-1 border-b border-black/5">
              <span className="text-[#6e6e73]">Mã phiên bản đã chốt:</span>
              <strong className="font-mono text-[#1d1d1f]">{request.ownerProposal.designOrProgramVersion}</strong>
            </div>
            <div>
              <span className="text-[#6e6e73] block mb-0.5">Điều kiện & cam kết chất lượng:</span>
              <p className="text-[#1d1d1f] leading-relaxed">
                {request.ownerProposal.termsAndConditions}
              </p>
            </div>
          </div>

          {/* Explicit sample approval checkbox as required in Mục 2 */}
          <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 space-y-3">
            <span className="text-xs font-semibold text-amber-950 uppercase block">
              Xác Nhận Phê Duyệt Mẫu Thiết Kế & Báo Giá (Bắt Buộc)
            </span>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isSampleConfirmed}
                onChange={(e) => setIsSampleConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#0071e3]"
              />
              <span className="text-xs text-amber-900 leading-relaxed font-medium">
                {request.serviceType === 'gifts'
                  ? `Tôi xác nhận đồng ý mẫu thiết kế ${request.ownerProposal.designOrProgramVersion}, mức giá trọn gói và các thông số cá nhân hóa theo hồ sơ để xưởng bắt đầu chế tác.`
                  : `Tôi xác nhận đồng ý chương trình trải nghiệm ${request.ownerProposal.designOrProgramVersion}, mức giá trọn gói và lịch tổ chức theo hồ sơ để xưởng bắt đầu công tác chuẩn bị.`}
              </span>
            </label>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-[#6e6e73]">
              * Khi bạn bấm duyệt, đơn hàng sẽ chuyển sang trạng thái "Đang thực hiện".
            </span>

            <Button
              variant="terracotta"
              size="lg"
              icon={<CheckCircle2 size={18} />}
              onClick={handleApprove}
              disabled={!isSampleConfirmed}
              className={`text-sm font-semibold shadow-sm ${!isSampleConfirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Phê duyệt phương án & Chốt điều kiện
            </Button>
          </div>
        </div>
      )}

      {/* CONFIRMED APPROVAL NOTICE WHEN DANG THUC HIEN */}
      {request.status === 'dang_thuc_hien' && (
        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 flex items-center justify-between gap-3 text-xs sm:text-sm text-indigo-900">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-indigo-700 shrink-0" />
            <div>
              <strong className="block text-indigo-950">
                Phương án đã được bạn phê duyệt ({request.clientApproval?.approvedDesignVersion})
              </strong>
              <span>
                {request.serviceType === 'workshop'
                  ? 'Xưởng đang hoàn tất công tác chuẩn bị nguyên vật liệu và không gian tiếp đón.'
                  : 'Xưởng đang tiến hành tạo hình đất sét, tráng men và chuẩn bị mẻ nung chín.'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* NOTICE WHEN ARTISAN REPORTED BUT OWNER IS DOING QC */}
      {request.status === 'cho_owner_qc' && (
        <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 flex items-center gap-3 text-xs sm:text-sm text-teal-900">
          <Clock size={20} className="text-teal-700 shrink-0" />
          <div>
            <strong className="block text-teal-950">
              Xưởng đã báo cáo hoàn tất thực hiện
            </strong>
            <span>
              Điều phối viên MADE IN VIETNAM LAB đang tiến hành kiểm tra chất lượng (QC) theo hồ sơ đã duyệt trước khi bàn giao cho bạn.
            </span>
          </div>
        </div>
      )}

      {/* ACTION BANNER WHEN WAITING FOR CUSTOMER HANDOVER CONFIRMATION (MỐC 3 - MỤC 1) */}
      {request.status === 'cho_khach_nghiem_thu' && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-emerald-600 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e8e8ed]">
            <div>
              <span className="text-xs font-mono font-semibold text-emerald-800 uppercase tracking-wider block">
                XÁC NHẬN BÀN GIAO & HOÀN TẤT DỊCH VỤ (MỐC 3)
              </span>
              <h3 className="font-heritage text-xl sm:text-2xl font-semibold text-[#1d1d1f]">
                {request.serviceType === 'workshop' 
                  ? 'Buổi Workshop Đã Tổ Chức & QC Đạt Chuẩn' 
                  : 'Sản Phẩm Đã Kiểm Định QC & Sẵn Sàng Bàn Giao'}
              </h3>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
              Chờ bạn xác nhận
            </span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs sm:text-sm space-y-1">
            <p className="text-emerald-950">
              <strong>Kết quả kiểm định chất lượng (QC):</strong> Đạt tiêu chuẩn hồ sơ đã duyệt.
            </p>
            <p className="text-emerald-900 text-xs">
              Kiểm tra bởi: <em>{request.qcRecord?.inspectorName}</em> ({request.qcRecord?.inspectedAt})
            </p>
            <p className="text-xs text-[#515154] ">
              "{request.qcRecord?.notes}"
            </p>
          </div>

          {request.serviceType === 'workshop' && request.artisanExecutionReport?.postFiringFollowup && (
            <div className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed] text-xs text-[#424245]">
              <strong>Theo dõi thành phẩm nung sau:</strong> {request.artisanExecutionReport.postFiringFollowup}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#424245] block">
              Ghi chú xác nhận nhận hàng / hoàn tất thực tế (tùy chọn):
            </label>
            <input
              type="text"
              value={clientReceivedNotes}
              onChange={(e) => setClientReceivedNotes(e.target.value)}
              placeholder="Ví dụ: Đã nhận đủ số lượng, kiểm tra thực tế nguyên vẹn..."
              className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] focus:outline-none focus:border-emerald-600 focus:bg-white"
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs text-[#6e6e73]">
              * Bằng việc xác nhận, bạn ghi nhận đã nhận bàn giao đầy đủ để hoàn tất đơn hàng.
            </span>

            <Button
              variant="forest"
              size="lg"
              icon={<PackageCheck size={18} />}
              onClick={handleClientConfirmHandover}
              className="text-sm font-semibold shadow-sm"
            >
              {request.serviceType === 'workshop' 
                ? 'Xác nhận hoàn tất buổi trải nghiệm' 
                : 'Xác nhận đã nhận hàng & Hoàn tất đơn'}
            </Button>
          </div>
        </div>
      )}

      {/* COMPLETED BANNER */}
      {request.status === 'hoan_thanh' && (
        <div className="p-4 bg-[#1d1d1f]/10 rounded-2xl border border-[#1d1d1f]/20 flex items-center justify-between gap-3 text-xs sm:text-sm text-[#1d1d1f]">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="text-[#1d1d1f] shrink-0" />
            <div>
              <strong className="block text-[#1d1d1f]">
                Đơn hàng đã hoàn thành và bàn giao trọn vẹn
              </strong>
              <span>
                Người xác nhận: <strong>{request.handoverRecord?.confirmedBy}</strong> vào ngày {request.handoverRecord?.confirmedAt}. Hồ sơ sáng tạo đã được lưu trữ hoàn tất.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: LIVE CREATIVE PASSPORT */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heritage text-xl font-semibold text-[#1d1d1f] flex items-center gap-2">
            <FileCheck size={20} className="text-[#0071e3]" />
            <span>Hồ Sơ Sáng Tạo (Creative Passport)</span>
          </h3>
          <span className="text-xs text-[#86868b]">
            Lưu vết tự động theo tiến trình hợp tác
          </span>
        </div>

        <CreativePassportCard passport={request.creativePassport} request={request} userRole="customer" />
      </div>

    </div>
  );
};
