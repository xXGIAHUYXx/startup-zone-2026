import React from 'react';
import { CheckCircle2, ShieldCheck, Award, FileCheck } from 'lucide-react';
import type { ConfirmationStep } from '../../types';

interface StepTimelineProps {
  currentStep: ConfirmationStep;
  className?: string;
  showAiNotice?: boolean;
}

export const StepTimeline: React.FC<StepTimelineProps> = ({
  currentStep,
  className = '',
  showAiNotice = false
}) => {
  const steps = [
    {
      step: 1,
      code: 'XÁC NHẬN NHU CẦU',
      title: 'Lần 1: Xác Nhận Yêu Cầu',
      desc: 'Khách hàng đối chiếu và xác nhận thông số đặt dịch vụ (quy mô, thời hạn, ngân sách). Nền tảng ghi nhận hồ sơ và tiếp nhận để điều phối.',
      actor: 'Khách hàng & Nền tảng',
      icon: FileCheck,
      status: currentStep > 1 ? 'completed' : currentStep === 1 ? 'current' : 'upcoming'
    },
    {
      step: 2,
      code: 'XÁC NHẬN KHẢ THI & DUYỆT',
      title: 'Lần 2: Thẩm Định & Phê Duyệt',
      desc: 'Xưởng Bát Tràng xác nhận năng lực và báo giá xưởng; Owner kiểm tra bóc tách phương án; Khách hàng xem xét và phê duyệt điều kiện hợp tác.',
      actor: 'Xưởng → Owner → Khách duyệt',
      icon: ShieldCheck,
      status: currentStep > 2 ? 'completed' : currentStep === 2 ? 'current' : 'upcoming'
    },
    {
      step: 3,
      code: 'XÁC NHẬN HOÀN TẤT',
      title: 'Lần 3: Kiểm Tra QC & Bàn Giao',
      desc: 'Xưởng cập nhật kết quả thực hiện; Owner kiểm tra chất lượng (QC) theo hồ sơ; ghi nhận bàn giao sản phẩm hoặc hoàn tất buổi trải nghiệm.',
      actor: 'Owner kiểm tra & Khách nhận bàn giao',
      icon: Award,
      status: currentStep === 3 ? 'current' : 'upcoming'
    }
  ];

  return (
    <div className={`bg-white rounded-xl p-6 border border-[#e8e8ed] shadow-xs ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e8e8ed]/70 mb-5 gap-3">
        <div>
          <span className="text-xs font-mono font-semibold tracking-widest uppercase text-[#0071e3] block mb-1">
            QUY TRÌNH ĐIỀU PHỐI CHUẨN
          </span>
          <h4 className="text-xl sm:text-2xl font-semibold font-heritage text-[#1d1d1f]">
            Một Hồ Sơ — Ba Lần Xác Nhận
          </h4>
        </div>
        <span className="text-xs bg-[#e8e8ed]/50 text-[#1d1d1f] px-3.5 py-1.5 rounded-full font-semibold self-start sm:self-auto border border-[#d2d2d7]/60">
          Mốc {currentStep} / 3: {steps[currentStep - 1].code}
        </span>
      </div>

      {/* Steps visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((item) => {
          const isDone = item.status === 'completed';
          const isCurrent = item.status === 'current';

          return (
            <div
              key={item.step}
              className={`relative rounded-xl p-5 border transition-all ${
                isCurrent
                  ? 'border-[#0071e3] bg-[#f0f7ff] shadow-xs ring-1 ring-[#0071e3]/30'
                  : isDone
                  ? 'border-[#1d1d1f]/30 bg-[#f5f5f7]'
                  : 'border-[#e8e8ed] bg-[#f5f5f7] opacity-75'
              }`}
            >
              {/* Badge indicator */}
              <div className="flex items-center justify-between mb-3.5">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    isDone
                      ? 'bg-[#1d1d1f] text-white'
                      : isCurrent
                      ? 'bg-[#0071e3] text-white ring-4 ring-[#0071e3]/20'
                      : 'bg-[#e8e8ed] text-[#6e6e73]'
                  }`}
                >
                  {isDone ? <CheckCircle2 size={18} /> : item.step}
                </span>

                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                    isDone
                      ? 'bg-[#1d1d1f]/10 text-[#1d1d1f]'
                      : isCurrent
                      ? 'bg-[#0071e3]/10 text-[#0071e3]'
                      : 'text-[#86868b] bg-black/5'
                  }`}
                >
                  {item.code}
                </span>
              </div>

              {/* Step info */}
              <h5 className="text-base font-semibold text-[#1d1d1f] mb-1.5 leading-snug font-heritage">
                {item.title}
              </h5>
              <p className="text-xs sm:text-sm text-[#515154] leading-relaxed mb-4">
                {item.desc}
              </p>

              <div className="pt-2.5 border-t border-black/5 flex items-center justify-between text-xs text-[#515154]">
                <span className="font-medium">Chủ thể:</span>
                <span className="font-semibold text-[#1d1d1f]">{item.actor}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
