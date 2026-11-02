import React from 'react';
import { Button } from '../common/Button';
import type { ServiceType } from '../../types';
import { ArrowRight } from 'lucide-react';
import { DragCarousel } from '../common/DragCarousel';

interface ProductShowcaseSectionProps {
  onOpenQuickRequest: (service?: ServiceType) => void;
}

export const ProductShowcaseSection: React.FC<ProductShowcaseSectionProps> = ({
  onOpenQuickRequest
}) => {
  const showcaseItems = [
    {
      title: 'Ly gốm men hoả biến sắc xanh biển',
      category: 'Quà tặng thủ công',
      desc: 'Nung nhiệt độ cao 1280°C, màu men chuyển biến tự nhiên theo ngọn lửa trong lò.',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
      tag: 'Mẫu sản phẩm gợi ý'
    },
    {
      title: 'Workshop vuốt gốm trên bàn xoay',
      category: 'Trải nghiệm làm gốm',
      desc: 'Cảm nhận đất sét xoay tròn dưới lòng bàn tay, tự tạo hình chiếc cốc hoặc bát của riêng mình.',
      image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=600&q=80',
      tag: 'Hoạt động thực tế'
    },
    {
      title: 'Bình hoa men rạn ngà cổ điển',
      category: 'Quà tặng thủ công',
      desc: 'Đường rạn tam thái chỉ đen tự nhiên, mang dấu ấn di sản Bát Tràng hàng trăm năm.',
      image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80',
      tag: 'Mẫu sản phẩm gợi ý'
    }
  ];

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <span className="text-[15px] font-medium text-[#0071e3] block mb-2">Hình ảnh thực tế</span>
          <h2 className="font-heritage text-3xl sm:text-4xl font-semibold text-[#1d1d1f]">
            Cảm hứng từ đất sét và màu men
          </h2>
          <p className="text-sm sm:text-base text-[#6e6e73] mt-2 max-w-xl">
            Một vài hình ảnh về các tác phẩm và hoạt động làm gốm thực tế mà chúng tôi thực hiện cùng các xưởng Bát Tràng.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          icon={<ArrowRight size={15} />}
          iconPosition="right"
          onClick={() => onOpenQuickRequest('gifts')}
          className="self-start md:self-auto text-xs sm:text-sm font-semibold"
        >
          Đặt làm mẫu tương tự
        </Button>
      </div>

      {/* Grid items */}
      <DragCarousel itemClassName="w-[19rem] sm:w-[24rem]">
        {showcaseItems.map((item, idx) => (
          <div
            key={idx}
            className="group bg-white rounded-[1.5rem] overflow-hidden ring-1 ring-black/[0.06] transition-shadow duration-300 shadow-sm hover:shadow-lg h-full flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e8ed]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#000000]/85 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full">
                  {item.category}
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-2">
                <span className="text-[11px] font-mono text-[#0071e3] uppercase tracking-wider block font-semibold">
                  {item.tag}
                </span>
                <h3 className="font-heritage text-xl font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6e6e73] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                onClick={() => onOpenQuickRequest(item.category.includes('Trải nghiệm') ? 'workshop' : 'gifts')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#f5f5f7] group-hover:bg-[#f0f7ff] text-xs font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] border border-[#e8e8ed] group-hover:border-[#0071e3]/30 transition-all text-center cursor-pointer"
              >
                Tư vấn cho nhu cầu của tôi →
              </button>
            </div>
          </div>
        ))}
      </DragCarousel>

    </section>
  );
};
