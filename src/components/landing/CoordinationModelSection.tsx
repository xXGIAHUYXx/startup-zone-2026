import React, { useEffect, useRef, useState } from 'react';
import { Button } from '../common/Button';
import { Send, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface CustomerProcessSectionProps { onOpenQuickRequest?: () => void; }

const THRESHOLDS = [0.08, 0.4, 0.7];

export const CoordinationModelSection: React.FC<CustomerProcessSectionProps> = ({ onOpenQuickRequest }) => {
  const steps = [
    { title: 'Gửi yêu cầu của bạn', icon: Send,
      desc: 'Cho chúng tôi biết bạn cần tổ chức workshop hay làm quà tặng theo lô, quy mô bao nhiêu người/sản phẩm và thời gian mong muốn.' },
    { title: 'Xác nhận phương án & duyệt mẫu', icon: ShieldCheck,
      desc: 'Xưởng Bát Tràng gửi phản hồi về khả năng thực hiện, mức giá và thời gian. Bạn xem ảnh mẫu thực tế trước khi xưởng bắt đầu làm hàng.' },
    { title: 'Theo dõi thực hiện & nhận bàn giao', icon: Clock,
      desc: 'Theo dõi tiến độ mẻ nung của xưởng, kiểm tra chất lượng thành phẩm và nhận bàn giao tận nơi kèm hồ sơ ghi nhận câu chuyện sản phẩm.' },
  ];
  const highlights = [
    { title: 'Đúng kỹ thuật truyền thống', icon: '🏺', desc: 'Mỗi sản phẩm đều do thợ gốm lành nghề tại Bát Tràng trực tiếp vuốt nặn, tráng men và nung lò đạt chuẩn.' },
    { title: 'Xem mẫu trước khi làm mẻ lớn', icon: '🔍', desc: 'Bạn luôn được duyệt mẫu thử thực tế trước khi xưởng tiến hành sản xuất cả lô, tránh hoàn toàn rủi ro sai lệch.' },
    { title: 'Chi phí minh bạch, không qua trung gian', icon: '🌿', desc: 'Báo giá rõ ràng, tôn trọng mức thù lao xứng đáng của thợ gốm và không phát sinh phụ phí vô lý.' },
  ];

  // Tiến độ cuộn điều khiển đường kẻ và từng bước sáng lên theo thứ tự
  const rail = useRef<HTMLDivElement>(null);
  const [lit, setLit] = useState(0);
  useEffect(() => {
    const el = rail.current!;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0, last = -1;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = reduce ? 1 : Math.min(1, Math.max(0, (window.innerHeight * 0.75 - r.top) / (r.height * 0.9)));
      el.style.setProperty('--p', String(p));
      const n = THRESHOLDS.filter(t => p >= t).length;
      if (n !== last) { last = n; setLit(n); }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="coordination-model" className="scroll-mt-14 py-20 sm:py-28 bg-[#f5f5f7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[15px] font-medium text-[#0071e3] mb-3">Quy trình đặt dịch vụ</p>
          <h2 className="font-heritage text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#1d1d1f] tracking-[-0.03em] mb-5">Đơn giản, minh bạch và an tâm.</h2>
          <p className="text-lg text-[#6e6e73] leading-relaxed">Chúng tôi đồng hành cùng bạn từ ý tưởng ban đầu cho đến khi tác phẩm gốm hoàn thiện đến tay bạn.</p>
        </div>

        <div ref={rail} className="relative mb-24">
          <div className="hidden md:block absolute left-5 right-5 top-5 h-0.5 bg-[#d2d2d7]">
            <div className="h-full bg-[#0071e3] origin-left" style={{ transform: 'scaleX(var(--p, 0))' }} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
            {steps.map((st, i) => {
              const on = lit > i, Icon = st.icon;
              return (
                <div key={i} className={`transition-opacity duration-500 ${on ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-10 h-10 rounded-full grid place-items-center font-semibold text-sm mb-6 transition-[transform,background-color,color] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${on ? 'bg-[#0071e3] text-white scale-100' : 'bg-[#e8e8ed] text-[#6e6e73] scale-90'}`}>
                    {i + 1}
                  </div>
                  <Icon size={26} className="text-[#0071e3] mb-4" />
                  <h3 className="font-heritage text-2xl font-semibold text-[#1d1d1f] mb-3 leading-snug">{st.title}</h3>
                  <p className="text-[15px] text-[#515154] leading-relaxed">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="font-heritage text-3xl sm:text-4xl font-semibold text-[#1d1d1f] tracking-[-0.025em] mb-3">Tại sao bạn có thể hoàn toàn yên tâm?</h3>
          <p className="text-[17px] text-[#6e6e73]">Những cam kết thiết thực dành cho người đặt trải nghiệm và quà tặng thủ công.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {highlights.map((h, i) => (
            <div key={i} className="bg-white rounded-[1.75rem] p-8 ring-1 ring-black/[0.06]">
              <span className="text-4xl block mb-5">{h.icon}</span>
              <h4 className="font-heritage text-xl font-semibold text-[#1d1d1f] mb-2 leading-snug">{h.title}</h4>
              <p className="text-[15px] text-[#515154] leading-relaxed">{h.desc}</p>
            </div>
          ))}
        </div>
        {onOpenQuickRequest && (
          <div className="mt-12 text-center">
            <Button variant="terracotta" size="lg" onClick={onOpenQuickRequest} icon={<ArrowRight size={16} />} iconPosition="right">Bắt đầu gửi yêu cầu ngay</Button>
          </div>
        )}
      </div>
    </section>
  );
};
