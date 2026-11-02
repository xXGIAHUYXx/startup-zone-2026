import React from 'react';
import { Button } from '../common/Button';
import type { ServiceType } from '../../types';
import { Compass, Gift, Users, Award, Clock, ArrowRight, Palette, CheckCircle2, ChevronRight } from 'lucide-react';

interface ServicePillarsSectionProps {
  onSelectService: (service: ServiceType) => void;
  onOpenQuickRequest: (service: ServiceType) => void;
}

export const ServicePillarsSection: React.FC<ServicePillarsSectionProps> = ({ onSelectService, onOpenQuickRequest }) => {
  const tiles = [
    {
      id: 'service-workshop', service: 'workshop' as ServiceType, dark: false, flip: false,
      TagIcon: Compass, tag: 'Dành cho nhóm & đoàn thể', meta: '10 – 20 người / buổi',
      title: 'Trải nghiệm làm gốm',
      desc: 'Các buổi workshop thực tế tại Bát Tràng giúp thành viên trực tiếp chạm vào đất sét, ngồi bên bàn xoay truyền thống, tự tay vuốt nặn và sáng tạo tác phẩm gốm của riêng mình.',
      image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1100&q=80',
      alt: 'Workshop trải nghiệm vuốt gốm Bát Tràng', caption: 'Không gian xưởng mộc Bát Tràng yên bình ven sông Hồng',
      points: [
        [Users, 'Thợ gốm Bát Tràng hướng dẫn tận tình theo nhóm nhỏ (tỷ lệ 1 thợ : 5 người).'],
        [Palette, 'Tùy chỉnh chủ đề buổi học theo thông điệp hoặc dịp kỷ niệm của đơn vị bạn.'],
        [Clock, 'Tác phẩm được xưởng tráng men, nung chín và gửi tận nơi sau 7–10 ngày.'],
      ] as [React.ElementType, string][],
      cta: 'Đặt lịch trải nghiệm', more: 'Xem chi tiết gói',
    },
    {
      id: 'service-gifts', service: 'gifts' as ServiceType, dark: true, flip: true,
      TagIcon: Gift, tag: 'Quà tặng theo lô', meta: 'Từ 20 sản phẩm trở lên',
      title: 'Quà tặng thủ công',
      desc: 'Các bộ quà tặng gốm sứ Bát Tràng thiết kế riêng theo lô nhỏ cho doanh nghiệp, hội nghị hoặc quà tri ân — thể hiện sự trân trọng và nét văn hóa Việt sâu sắc.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1100&q=80',
      alt: 'Bộ sản phẩm ly gốm quà tặng men hỏa biến Bát Tràng', caption: 'Men hoả biến độc bản, men rạn ngà cổ điển hoặc men lam truyền thống',
      points: [
        [Award, 'Khắc chìm logo, chữ kỷ niệm hoặc thông điệp tri ân dưới đáy hoặc thân sản phẩm.'],
        [CheckCircle2, 'Khách hàng được xem và duyệt mẫu thực tế trước khi xưởng tiến hành sản xuất mẻ chính.'],
        [Clock, 'Đóng gói hộp giấy bồi thủ công mộc mạc, trang nhã, sẵn sàng trao tặng.'],
      ] as [React.ElementType, string][],
      cta: 'Yêu cầu báo giá quà tặng', more: 'Xem mẫu gợi ý',
    },
  ];

  return (
    <section id="services" className="py-20 sm:py-28 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <p className="text-[15px] font-medium text-[#0071e3] mb-3">Dịch vụ của chúng tôi</p>
        <h2 className="font-heritage text-4xl sm:text-5xl lg:text-6xl font-semibold text-[#1d1d1f] tracking-[-0.03em] mb-5">Hai lựa chọn dành cho bạn.</h2>
        <p className="text-lg text-[#6e6e73] leading-relaxed">
          Tham gia trải nghiệm trực tiếp tại xưởng hoặc đặt chế tác quà tặng gốm sứ theo yêu cầu riêng của tổ chức và cá nhân.
        </p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {tiles.map(t => (
          <div key={t.id} id={t.id} className={`scroll-mt-20 rounded-[2rem] overflow-hidden grid lg:grid-cols-2 ${t.dark ? 'bg-[#1d1d1f] text-white' : 'bg-[#f5f5f7] text-[#1d1d1f]'}`}>
            <div className={`p-8 sm:p-12 lg:p-14 flex flex-col justify-between gap-10 ${t.flip ? 'lg:order-2' : ''}`}>
              <div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-6">
                  <span className={`text-[13px] font-medium px-3 py-1 rounded-full inline-flex items-center gap-1.5 ${t.dark ? 'bg-[#0071e3]/20 text-[#66a9f5]' : 'bg-[#0071e3]/10 text-[#0071e3]'}`}>
                    <t.TagIcon size={14} />{t.tag}
                  </span>
                  <span className={`text-[13px] ${t.dark ? 'text-[#a1a1a6]' : 'text-[#6e6e73]'}`}>{t.meta}</span>
                </div>
                <h3 className="font-heritage text-4xl sm:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] mb-5">{t.title}</h3>
                <p className={`text-lg leading-relaxed mb-8 ${t.dark ? 'text-white/70' : 'text-[#515154]'}`}>{t.desc}</p>
                <ul className="space-y-4">
                  {t.points.map(([Icon, text], i) => (
                    <li key={i} className={`flex items-start gap-3 text-[15px] leading-snug ${t.dark ? 'text-white/80' : 'text-[#424245]'}`}>
                      <Icon size={20} className={`shrink-0 ${t.dark ? 'text-[#66a9f5]' : 'text-[#0071e3]'}`} />
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <Button variant="terracotta" size="lg" icon={<ArrowRight size={16} />} iconPosition="right" onClick={() => onOpenQuickRequest(t.service)}>{t.cta}</Button>
                <button onClick={() => onSelectService(t.service)} className={`inline-flex items-center gap-1 text-[17px] hover:underline underline-offset-4 cursor-pointer ${t.dark ? 'text-[#66a9f5]' : 'text-[#0071e3]'}`}>
                  {t.more} <ChevronRight size={18} />
                </button>
              </div>
            </div>
            <div className={`relative min-h-[18rem] sm:min-h-[26rem] lg:min-h-[34rem] overflow-hidden group ${t.flip ? 'lg:order-1' : ''}`}>
              <img src={t.image} alt={t.alt} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-[15px] text-white font-medium max-w-sm">{t.caption}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
