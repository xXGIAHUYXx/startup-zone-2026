import React, { useEffect, useRef } from 'react';
import { Button } from '../common/Button';
import type { ServiceType } from '../../types';
import { Gift, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  onSelectService: (service: ServiceType) => void;
  onOpenQuickRequest: (service?: ServiceType) => void;
  onExploreModel?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onSelectService, onOpenQuickRequest }) => {
  const textRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  // Hiệu ứng cuộn: chữ mờ dần và nhích lên, ảnh lùi nhẹ ra sau (độ sâu)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / 700));
      if (textRef.current) { textRef.current.style.opacity = String(1 - p * 0.9); textRef.current.style.transform = `translate3d(0,${-p * 24}px,0)`; }
      if (imgRef.current) imgRef.current.style.transform = `translate3d(0,${p * 40}px,0) scale(${1 - p * 0.05})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="home" className="relative overflow-hidden pt-16 pb-16 lg:pt-28 lg:pb-24 bg-[#fbfbfd]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        <div ref={textRef} className="will-change-transform">
          <p data-reveal className="text-[15px] font-medium text-[#0071e3] mb-4">Gốm Bát Tràng · Trải nghiệm & Quà tặng</p>
          <h1 data-reveal data-delay="90" className="font-heritage text-[2.5rem] sm:text-6xl lg:text-[5.5rem] font-semibold text-[#1d1d1f] leading-[1.03] tracking-[-0.035em]">
            Chạm vào nghề Việt.<br />
            <span className="text-[#6e6e73]">Tạo nên dấu ấn riêng.</span>
          </h1>
          <p data-reveal data-delay="180" className="mt-6 text-lg sm:text-xl text-[#6e6e73] leading-relaxed max-w-2xl mx-auto">
            Trải nghiệm làm gốm và quà tặng thủ công thiết kế theo nhu cầu của bạn — từ workshop gắn kết đến bộ quà gốm sứ mộc mạc của làng nghề Bát Tràng.
          </p>
          <div data-reveal data-delay="270" className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <Button variant="terracotta" size="lg" icon={<Gift size={18} />} onClick={() => onOpenQuickRequest('gifts')} className="w-full sm:w-auto">
              Đặt quà theo yêu cầu
            </Button>
            <button onClick={() => onSelectService('workshop')} className="inline-flex items-center gap-1 text-[17px] text-[#0071e3] hover:underline underline-offset-4 cursor-pointer">
              Khám phá trải nghiệm <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-14 lg:mt-20">
        <div ref={imgRef} data-reveal data-delay="150" className="relative rounded-[2rem] overflow-hidden aspect-[4/3] sm:aspect-[16/9] shadow-2xl will-change-transform">
          <img
            src="https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=85"
            alt="Nghệ nhân gốm Bát Tràng tỉ mỉ tạo hình trên bàn xoay"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 bg-gradient-to-t from-black/60 to-transparent text-left text-white">
            <span className="text-[13px] font-medium text-white/80">Bát Tràng, Hà Nội</span>
            <p className="font-heritage text-xl sm:text-3xl font-semibold leading-tight max-w-xl mt-1">
              Bàn tay thợ gốm, đất sét phù sa và sắc men truyền đời
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
