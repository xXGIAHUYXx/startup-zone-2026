import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { ServiceType } from '../../types';
import { 
  analyzeRequirementBrief, 
  PRESET_TEST_BRIEFS, 
  type ParsedRequirementDraft 
} from '../../utils/requirementParser';
import { 
  Compass, 
  Gift, 
  ArrowRight, 
  CheckCircle2, 
  ArrowLeft, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign, 
  Info,
  Check,
  AlertCircle
} from 'lucide-react';

interface RequestCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceType;
  onSubmit: (formData: any) => void;
}

export const RequestCreateModal: React.FC<RequestCreateModalProps> = ({
  isOpen,
  onClose,
  initialService = 'gifts',
  onSubmit
}) => {
  // 2 bước: 1. Nhập mô tả ngôn ngữ tự nhiên -> 2. Kiểm tra & chuẩn hóa thông số có cấu trúc
  const [step, setStep] = useState<'input' | 'structured_review'>('input');
  
  // Bước 1: Mô tả thô bằng ngôn ngữ tự nhiên
  const [rawBriefText, setRawBriefText] = useState('');
  const [activeDraft, setActiveDraft] = useState<ParsedRequirementDraft | null>(null);

  // Thông tin liên hệ
  const [contactName, setContactName] = useState('');
  const [organization, setOrganization] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Bước 2: Các trường có cấu trúc (cho phép chỉnh sửa trực tiếp)
  const [serviceType, setServiceType] = useState<ServiceType>(initialService);
  const [scaleOrQuantity, setScaleOrQuantity] = useState('');
  const [scaleUnit, setScaleUnit] = useState<'người' | 'bộ' | 'sản phẩm'>('bộ');
  const [productOrTopic, setProductOrTopic] = useState('');
  const [budget, setBudget] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [personalizationOrSpecialRequests, setPersonalizationOrSpecialRequests] = useState('');

  // Xác nhận bắt buộc của khách hàng trước khi gửi
  const [isClientConfirmed, setIsClientConfirmed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Chọn nhanh kịch bản kiểm thử mẫu cho Ban Giám Khảo & Người dùng
  const handleSelectPreset = (preset: typeof PRESET_TEST_BRIEFS[0]) => {
    setRawBriefText(preset.brief);
    setErrors({});
  };

  // Kích hoạt bộ phân tích quy tắc (Rule-based Structuring)
  const handleAnalyzeBrief = () => {
    const trimmed = rawBriefText.trim();
    if (!trimmed) {
      setErrors({ rawBrief: 'Vui lòng nhập mô tả nhu cầu của bạn để hệ thống hỗ trợ chuẩn hóa.' });
      return;
    }

    const draft = analyzeRequirementBrief(trimmed, initialService);
    setActiveDraft(draft);
    setServiceType(draft.detectedServiceType);
    setScaleOrQuantity(draft.scaleOrQuantity !== null ? String(draft.scaleOrQuantity) : '');
    setScaleUnit(draft.scaleUnit);
    setProductOrTopic(draft.productOrTopic);
    setBudget(draft.budgetEstimated);
    setTargetDate(draft.targetTimeline);
    setPersonalizationOrSpecialRequests(draft.personalizationOrSpecialRequests);
    
    if (draft.organization && !organization) setOrganization(draft.organization);
    if (draft.contactPhone && !contactPhone) setContactPhone(draft.contactPhone);
    if (draft.contactEmail && !contactEmail) setContactEmail(draft.contactEmail);

    setErrors({});
    setIsClientConfirmed(false);
    setStep('structured_review');
  };

  // Xác thực trước khi gửi chính thức
  const validateReview = () => {
    const errs: Record<string, string> = {};
    if (!contactName.trim()) errs.contactName = 'Vui lòng nhập họ tên người liên hệ';
    if (!contactPhone.trim()) errs.contactPhone = 'Vui lòng nhập số điện thoại';
    if (!contactEmail.trim()) errs.contactEmail = 'Vui lòng nhập địa chỉ email';
    if (!scaleOrQuantity || Number(scaleOrQuantity) <= 0) {
      errs.scaleOrQuantity = serviceType === 'workshop' 
        ? 'Vui lòng bổ sung số lượng người tham gia cụ thể' 
        : 'Vui lòng bổ sung số lượng sản phẩm/bộ quà tặng';
    }
    if (!targetDate.trim()) {
      errs.targetDate = serviceType === 'workshop' 
        ? 'Vui lòng bổ sung ngày tổ chức workshop dự kiến' 
        : 'Vui lòng bổ sung thời hạn cần nhận quà tặng';
    }
    if (!isClientConfirmed) {
      errs.clientConfirmed = 'Bạn cần tích chọn xác nhận các thông số đã chuẩn hóa trước khi gửi';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFinalSubmit = () => {
    if (!validateReview() || isSubmitting) return;
    setIsSubmitting(true);

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const num = Number(scaleOrQuantity) || 20;

    const data = {
      serviceType,
      contactName: contactName.trim(),
      organization: organization.trim(),
      contactPhone: contactPhone.trim(),
      contactEmail: contactEmail.trim(),
      title: serviceType === 'workshop' 
        ? `Workshop trải nghiệm làm gốm Bát Tràng (${num} người)` 
        : `${num} ${scaleUnit} ${productOrTopic}`,
      description: `${productOrTopic} — Quy mô: ${num} ${scaleUnit}. Yêu cầu: ${personalizationOrSpecialRequests}`,
      rawBrief: rawBriefText.trim(),
      structuredRequirement: {
        rawBrief: rawBriefText.trim(),
        analyzedAt: formattedDate,
        confirmedAt: formattedDate,
        confirmedBy: contactName.trim(),
        serviceType,
        scaleOrQuantity: num,
        scaleUnit,
        productOrTopic: productOrTopic.trim(),
        budgetEstimated: budget.trim() || 'Trao đổi cụ thể khi tư vấn',
        targetTimeline: targetDate.trim(),
        personalizationOrSpecialRequests: personalizationOrSpecialRequests.trim(),
        missingFieldsIdentified: activeDraft ? activeDraft.missingFields.map(m => m.label) : [],
        conflictsIdentified: activeDraft ? activeDraft.conflicts : [],
        clientConfirmed: true,
        workshopCommitmentNotice: activeDraft?.workshopCommitmentNotice || 'Đang chờ xưởng Bát Tràng thẩm định công suất thực tế.'
      },
      budget: budget.trim() || 'Trao đổi cụ thể khi tư vấn',
      targetDate: targetDate.trim(),
      workshopDetails: serviceType === 'workshop' ? {
        participantsCount: num,
        plannedDate: targetDate.trim(),
        specialRequests: personalizationOrSpecialRequests.trim()
      } : undefined,
      giftsDetails: serviceType === 'gifts' ? {
        quantity: num,
        productType: productOrTopic.trim(),
        personalizationNotes: personalizationOrSpecialRequests.trim(),
        deliveryDate: targetDate.trim()
      } : undefined
    };

    onSubmit(data);
    setTimeout(() => {
      setIsSubmitting(false);
      handleClose();
    }, 200);
  };

  const handleClose = () => {
    setStep('input');
    setRawBriefText('');
    setActiveDraft(null);
    setErrors({});
    setIsClientConfirmed(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 'input' ? 'Gửi Yêu Cầu Dịch Vụ Gốm Bát Tràng' : 'Kiểm Tra & Chuẩn Hóa Thông Số Yêu Cầu'}
      subtitle={
        step === 'input'
          ? 'Mô tả nhu cầu bằng ngôn ngữ tự nhiên. Hệ thống hỗ trợ chuẩn hóa thành thông số kỹ thuật có cấu trúc.'
          : 'Xem lại các trường thông tin đã nhận diện, bổ sung những mục còn thiếu và xác nhận trước khi gửi.'
      }
      maxWidth="2xl"
    >
      {/* ===================== BƯỚC 1: NHẬP MÔ TẢ NGÔN NGỮ TỰ NHIÊN ===================== */}
      {step === 'input' && (
        <div className="space-y-5">
          {/* Service hints */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setServiceType('gifts')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                serviceType === 'gifts'
                  ? 'border-[#0071e3] bg-[#f0f7ff] text-[#0071e3] shadow-xs'
                  : 'border-[#e8e8ed] hover:border-black/20 text-[#6e6e73] bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Gift size={18} />
                <div>
                  <strong className="text-xs font-semibold block text-[#1d1d1f]">Quà Tặng Thủ Công</strong>
                  <span className="text-[11px] text-[#6e6e73]">Lô sản phẩm gốm theo yêu cầu</span>
                </div>
              </div>
              {serviceType === 'gifts' && <CheckCircle2 size={16} className="text-[#0071e3]" />}
            </button>

            <button
              type="button"
              onClick={() => setServiceType('workshop')}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                serviceType === 'workshop'
                  ? 'border-[#1d1d1f] bg-[#f5f5f7] text-[#1d1d1f] shadow-xs'
                  : 'border-[#e8e8ed] hover:border-black/20 text-[#6e6e73] bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Compass size={18} />
                <div>
                  <strong className="text-xs font-semibold block text-[#1d1d1f]">Trải Nghiệm Làm Gốm</strong>
                  <span className="text-[11px] text-[#6e6e73]">Workshop bàn xoay tại xưởng</span>
                </div>
              </div>
              {serviceType === 'workshop' && <CheckCircle2 size={16} className="text-[#1d1d1f]" />}
            </button>
          </div>

          {/* Quick preset chips for Judge testing */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#6e6e73] font-semibold">
                Kịch bản mẫu kiểm thử nhanh (Đợt 2B.01):
              </span>
              <span className="text-[10px] text-[#86868b] ">Bấm để nạp nhanh</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_TEST_BRIEFS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p)}
                  className="p-2.5 rounded-xl border border-[#e8e8ed] bg-white hover:bg-[#f0f7ff] hover:border-[#0071e3]/60 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs font-semibold text-[#1d1d1f] group-hover:text-[#0071e3]">
                      {p.title}
                    </strong>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold border ${p.badgeClass}`}>
                      {p.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6e6e73] line-clamp-1 ">
                    "{p.brief}"
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Natural Language Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
                Mô tả nhu cầu bằng ngôn ngữ tự nhiên <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-[#6e6e73]">
                Hệ thống tự động nhận diện quy mô, thời gian, ngân sách
              </span>
            </div>
            <textarea
              rows={4}
              value={rawBriefText}
              onChange={(e) => setRawBriefText(e.target.value)}
              placeholder="Nhập tự nhiên mong muốn của bạn. Ví dụ: Chúng tôi là công ty Sao Mai, cần tổ chức workshop trải nghiệm làm gốm cho đoàn 20 người vào ngày 08/11/2026, ngân sách tầm 10 triệu đồng, yêu cầu có nghệ nhân kèm cặp và thưởng trà..."
              className={`w-full text-xs sm:text-sm p-3.5 rounded-xl border bg-white focus:outline-none transition-all ${
                errors.rawBrief ? 'border-red-500 ring-1 ring-red-300' : 'border-[#d2d2d7] focus:border-[#0071e3]'
              }`}
            />
            {errors.rawBrief && (
              <span className="text-xs text-red-600 font-medium block">
                {errors.rawBrief}
              </span>
            )}
          </div>

          {/* Contact Details (Preliminary) */}
          <div className="pt-2 border-t border-[#e8e8ed]">
            <span className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider block mb-2.5">
              Thông Tin Người Liên Hệ
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#424245] mb-1 font-medium">Họ và tên <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-[#86868b]" />
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#424245] mb-1 font-medium">Tên tổ chức / Doanh nghiệp</label>
                <div className="relative">
                  <Building2 size={14} className="absolute left-3 top-3 text-[#86868b]" />
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Ví dụ: Công ty Dược phẩm Sao Mai"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#424245] mb-1 font-medium">Số điện thoại <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-3 text-[#86868b]" />
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="Ví dụ: 0912 345 678"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#424245] mb-1 font-medium">Email liên hệ <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-[#86868b]" />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Ví dụ: contact@saomaipharma.vn"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0071e3]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-between gap-3">
            <span className="text-[11px] text-[#6e6e73] ">
              * Khách hàng được kiểm tra và chỉnh sửa từng thông số trước khi xác nhận gửi.
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" type="button" onClick={handleClose}>
                Hủy
              </Button>
              <Button
                variant="terracotta"
                size="md"
                type="button"
                icon={<Sparkles size={16} />}
                iconPosition="left"
                onClick={handleAnalyzeBrief}
                className="text-xs sm:text-sm font-semibold shadow-xs cursor-pointer"
              >
                Trích xuất & Chuẩn hóa thông số
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ===================== BƯỚC 2: MÀN HÌNH KIỂM TRA & CHUẨN HÓA YÊU CẦU ===================== */}
      {step === 'structured_review' && (
        <div className="space-y-4">
          
          {/* Original brief box */}
          <div className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed] text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[#1d1d1f] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <FileText size={13} className="text-[#0071e3]" />
                Mô tả nhu cầu gốc (Ngôn ngữ tự nhiên)
              </span>
              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-[11px] text-[#0071e3] hover:underline font-semibold cursor-pointer"
              >
                Sửa lại mô tả
              </button>
            </div>
            <p className="text-[#424245]  leading-relaxed bg-white p-2.5 rounded-lg border border-[#e8e8ed]">
              "{rawBriefText}"
            </p>
          </div>

          {/* Service Detection Badge & Confidence */}
          <div className="p-3 bg-white rounded-xl border border-[#e8e8ed] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
            <div>
              <span className="text-[#86868b] block text-[11px]">Dòng dịch vụ nhận diện:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <strong className="text-sm font-heritage font-semibold text-[#1d1d1f]">
                  {serviceType === 'workshop' ? 'Trải nghiệm làm gốm (Workshop)' : 'Quà tặng thủ công theo lô (Gifts)'}
                </strong>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                  activeDraft?.serviceConfidence === 'high'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : activeDraft?.serviceConfidence === 'medium'
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  Độ tin cậy: {activeDraft?.serviceConfidence === 'high' ? 'Cao' : activeDraft?.serviceConfidence === 'medium' ? 'Khá' : 'Cần xác nhận'}
                </span>
              </div>
              {activeDraft?.serviceReasoning && (
                <p className="text-[11px] text-[#6e6e73] mt-0.5">{activeDraft.serviceReasoning}</p>
              )}
            </div>

            {/* Quick Switch if customer wants */}
            <div className="flex gap-1.5 self-start sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => {
                  setServiceType('workshop');
                  setScaleUnit('người');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${
                  serviceType === 'workshop' ? 'bg-[#1d1d1f] text-white border-[#1d1d1f]' : 'bg-[#f5f5f7] text-[#515154] border-[#d2d2d7]'
                }`}
              >
                Workshop
              </button>
              <button
                type="button"
                onClick={() => {
                  setServiceType('gifts');
                  setScaleUnit('bộ');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer transition-colors ${
                  serviceType === 'gifts' ? 'bg-[#0071e3] text-white border-[#0071e3]' : 'bg-[#f5f5f7] text-[#515154] border-[#d2d2d7]'
                }`}
              >
                Quà tặng
              </button>
            </div>
          </div>

          {/* ALERT 1: CONFLICTS DETECTED (MÂU THUẪN) */}
          {activeDraft && activeDraft.conflicts.length > 0 && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-red-950">
                <AlertTriangle size={15} className="text-red-600 shrink-0" />
                <span>Phát hiện thông tin mâu thuẫn cần làm rõ:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] pl-1">
                {activeDraft.conflicts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ALERT 2: MISSING FIELDS IDENTIFIED (THIẾU THÔNG TIN) */}
          {activeDraft && activeDraft.missingFields.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-amber-900">
                <AlertCircle size={15} className="text-amber-700 shrink-0" />
                <span>Hệ thống nhận diện thông tin chưa đầy đủ (Vui lòng điền bổ sung bên dưới):</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeDraft.missingFields.map((m, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-amber-200/70 border border-amber-300 text-[11px] font-semibold text-amber-900">
                    ⚠️ {m.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ALERT 3: AMBIGUITY WARNINGS (DẠNG KHOẢNG 15-20) */}
          {activeDraft && activeDraft.ambiguities.length > 0 && (
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
              <Info size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="text-[11px] space-y-0.5">
                {activeDraft.ambiguities.map((a, i) => (
                  <p key={i}>{a}</p>
                ))}
              </div>
            </div>
          )}

          {/* ================= EDITABLE STRUCTURED FIELDS ================= */}
          <div className="p-4 bg-white rounded-xl border border-[#e8e8ed] space-y-3.5">
            <span className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider block border-b border-[#e8e8ed] pb-2">
              Bản Thông Số Yêu Cầu Đã Chuẩn Hóa (Có thể chỉnh sửa trực tiếp)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Field: Số lượng / Quy mô */}
              <div>
                <label className="block text-[#424245] mb-1 font-semibold flex items-center justify-between">
                  <span>
                    {serviceType === 'workshop' ? 'Số người tham gia' : 'Số lượng sản phẩm'} <span className="text-red-500">*</span>
                  </span>
                  {!scaleOrQuantity && (
                    <span className="text-[10px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                      Cần bổ sung
                    </span>
                  )}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={scaleOrQuantity}
                    onChange={(e) => setScaleOrQuantity(e.target.value)}
                    placeholder="Ví dụ: 20"
                    className={`flex-1 p-2.5 rounded-xl border font-semibold text-sm bg-white focus:outline-none ${
                      !scaleOrQuantity || errors.scaleOrQuantity ? 'border-red-500 ring-1 ring-red-300' : 'border-[#d2d2d7] focus:border-[#0071e3]'
                    }`}
                  />
                  <select
                    value={scaleUnit}
                    onChange={(e) => setScaleUnit(e.target.value as any)}
                    className="p-2.5 rounded-xl border border-[#d2d2d7] bg-[#f5f5f7] text-xs font-semibold focus:outline-none"
                  >
                    {serviceType === 'workshop' ? (
                      <>
                        <option value="người">người</option>
                        <option value="thành viên">thành viên</option>
                      </>
                    ) : (
                      <>
                        <option value="bộ">bộ</option>
                        <option value="sản phẩm">sản phẩm</option>
                        <option value="chiếc">chiếc</option>
                      </>
                    )}
                  </select>
                </div>
                {errors.scaleOrQuantity && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.scaleOrQuantity}</span>
                )}
              </div>

              {/* Field: Thời hạn / Ngày tổ chức */}
              <div>
                <label className="block text-[#424245] mb-1 font-semibold flex items-center justify-between">
                  <span>
                    {serviceType === 'workshop' ? 'Ngày tổ chức dự kiến' : 'Hạn bàn giao mong muốn'} <span className="text-red-500">*</span>
                  </span>
                  {!targetDate && (
                    <span className="text-[10px] text-red-600 font-semibold bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                      Cần bổ sung
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-3 text-[#86868b]" />
                  <input
                    type="text"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    placeholder="Ví dụ: 15/11/2026"
                    className={`w-full pl-8 pr-3 py-2.5 rounded-xl border bg-white focus:outline-none text-xs sm:text-sm ${
                      !targetDate || errors.targetDate ? 'border-red-500 ring-1 ring-red-300' : 'border-[#d2d2d7] focus:border-[#0071e3]'
                    }`}
                  />
                </div>
                {errors.targetDate && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.targetDate}</span>
                )}
              </div>

              {/* Field: Sản phẩm / Chủ đề */}
              <div className="sm:col-span-2">
                <label className="block text-[#424245] mb-1 font-semibold">
                  {serviceType === 'workshop' ? 'Chủ đề / Hoạt động trải nghiệm' : 'Dòng sản phẩm gốm sứ quan tâm'}
                </label>
                <input
                  type="text"
                  value={productOrTopic}
                  onChange={(e) => setProductOrTopic(e.target.value)}
                  placeholder="Ví dụ: Bộ ly sứ men hỏa biến sắc xanh biển hoặc Workshop vuốt gốm bàn xoay..."
                  className="w-full p-2.5 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0071e3] text-xs sm:text-sm font-medium"
                />
              </div>

              {/* Field: Ngân sách */}
              <div>
                <label className="block text-[#424245] mb-1 font-semibold">
                  Ngân sách dự kiến
                </label>
                <div className="relative">
                  <DollarSign size={14} className="absolute left-3 top-3 text-[#86868b]" />
                  <input
                    type="text"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Ví dụ: 8.000.000 VNĐ hoặc Trao đổi khi tư vấn"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0071e3] text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Field: Cá nhân hóa / Yêu cầu đặc thù */}
              <div>
                <label className="block text-[#424245] mb-1 font-semibold">
                  {serviceType === 'workshop' ? 'Yêu cầu tổ chức đặc thù' : 'Chi tiết cá nhân hóa'}
                </label>
                <input
                  type="text"
                  value={personalizationOrSpecialRequests}
                  onChange={(e) => setPersonalizationOrSpecialRequests(e.target.value)}
                  placeholder="Ví dụ: Khắc chìm logo, đóng hộp quà lụa, nghệ nhân kèm 1:5..."
                  className="w-full p-2.5 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0071e3] text-xs sm:text-sm"
                />
              </div>

              {/* Contact confirmation on review screen */}
              <div className="sm:col-span-2 pt-2 border-t border-[#e8e8ed] grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[#515154] mb-1 text-[11px]">Người liên hệ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Họ tên"
                    className={`w-full p-2 rounded-lg border bg-white text-xs ${
                      errors.contactName ? 'border-red-500' : 'border-[#d2d2d7]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[#515154] mb-1 text-[11px]">Số điện thoại <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="SĐT"
                    className={`w-full p-2 rounded-lg border bg-white text-xs ${
                      errors.contactPhone ? 'border-red-500' : 'border-[#d2d2d7]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[#515154] mb-1 text-[11px]">Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="Email"
                    className={`w-full p-2 rounded-lg border bg-white text-xs ${
                      errors.contactEmail ? 'border-red-500' : 'border-[#d2d2d7]'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* DISCLAIMER: KHÔNG TỰ ĐỘNG CAM KẾT GIÁ HAY LỊCH CỦA XƯỞNG (YÊU CẦU 7) */}
          <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
            <Info size={16} className="text-[#0071e3] shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>Nguyên tắc thẩm định độc lập:</strong> Bản yêu cầu chuẩn hóa sau khi bạn xác nhận sẽ được gửi tới xưởng Bát Tràng phù hợp để đối chiếu dung tích lò nung và thời gian thực hiện. <em>Nền tảng không tự động cam kết mức giá hay lịch hẹn trước khi có phản hồi chính thức từ đại diện xưởng.</em>
            </div>
          </div>

          {/* EXPLICIT CUSTOMER CONFIRMATION CHECKBOX (YÊU CẦU 6) */}
          <div className={`p-3.5 rounded-xl border transition-all ${
            isClientConfirmed ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-[#d2d2d7]'
          }`}>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isClientConfirmed}
                onChange={(e) => setIsClientConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#1d1d1f]"
              />
              <div>
                <span className="text-xs font-semibold text-[#1d1d1f] block">
                  Xác nhận bản yêu cầu có cấu trúc (Lần 1 — Confirm Need)
                </span>
                <span className="text-[11px] text-[#515154] leading-relaxed block mt-0.5">
                  Tôi đã kiểm tra kỹ các thông số trên và xác nhận nội dung này phản ánh chính xác nhu cầu của chúng tôi để chuyển sang bước điều phối xưởng.
                </span>
              </div>
            </label>
            {errors.clientConfirmed && (
              <span className="text-xs text-red-600 font-semibold block mt-1.5 pl-6">
                {errors.clientConfirmed}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="md"
              type="button"
              icon={<ArrowLeft size={14} />}
              onClick={() => setStep('input')}
              className="text-xs"
            >
              Quay lại chỉnh sửa mô tả
            </Button>

            <Button
              variant="terracotta"
              size="md"
              type="button"
              icon={<CheckCircle2 size={16} />}
              onClick={handleFinalSubmit}
              disabled={isSubmitting || !isClientConfirmed}
              className={`text-xs sm:text-sm font-semibold shadow-sm ${
                !isClientConfirmed ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {isSubmitting ? 'Đang gửi...' : 'Xác nhận & Gửi yêu cầu'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
