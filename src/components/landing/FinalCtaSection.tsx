import React from 'react';
import { Button } from '../common/Button';
import type { ServiceType } from '../../types';
import { Compass, Gift } from 'lucide-react';

interface FinalCtaSectionProps { onOpenQuickRequest: (service?: ServiceType) => void; }

export const FinalCtaSection: React.FC<FinalCtaSectionProps> = ({ onOpenQuickRequest }) => (
  <section className="py-24 sm:py-32 bg-[#1d1d1f] text-white relative overflow-hidden">
    <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[60rem] h-80 bg-[#0071e3]/20 rounded-full blur-[120px] pointer-events-none" />
    <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
      <p className="text-[15px] font-medium text-[#66a9f5] mb-4">Bắt đầu cùng Made in Vietnam Lab</p>
      <h2 className="font-heritage text-4xl sm:text-6xl font-semibold tracking-[-0.03em] leading-[1.05]">
        Chạm vào đất sét,<br />kể câu chuyện của riêng bạn.
      </h2>
      <p className="mt-6 text-lg text-white/70 max-w-xl mx-auto">
        Một buổi workshop gắn kết đội ngũ hay một món quà gốm độc bản — chúng tôi luôn sẵn sàng hỗ trợ.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button variant="terracotta" size="lg" icon={<Gift size={18} />} onClick={() => onOpenQuickRequest('gifts')} className="w-full sm:w-auto">
          Yêu cầu báo giá quà tặng
        </Button>
        <Button variant="outline" size="lg" icon={<Compass size={18} />} onClick={() => onOpenQuickRequest('workshop')} className="w-full sm:w-auto !text-white !border-white/30 hover:!bg-white/10">
          Đặt lịch trải nghiệm làm gốm
        </Button>
      </div>
    </div>
  </section>
);
