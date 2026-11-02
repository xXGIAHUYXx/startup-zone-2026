import React from 'react';
import { MapPin, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onNavigateTab?: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  return (
    <footer className="bg-[#000000] text-white border-t border-[#1d1d1f] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-serif text-base font-semibold shadow-sm">
                VN
              </div>
              <span className="font-heritage text-2xl font-semibold tracking-tight text-white">
                MADE IN VIETNAM LAB
              </span>
            </div>
            <p className="text-sm text-white/75 leading-relaxed max-w-sm">
              Nền tảng kết nối trực tiếp khách hàng với các xưởng gốm thủ công tại Bát Tràng, Hà Nội. Đồng hành tạo nên những trải nghiệm văn hóa và quà tặng mang đậm dấu ấn riêng.
            </p>
            <div className="pt-2 text-xs text-white/60 space-y-1.5">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#66a9f5] shrink-0" />
                <span>Làng gốm Bát Tràng, Gia Lâm, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#66a9f5] shrink-0" />
                <span>lienhe@madeinvietnamlab.vn</span>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-3">
            <h5 className="font-heritage text-base font-semibold text-white tracking-wide">
              Dịch vụ
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
              <li>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('workshop')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Trải nghiệm làm gốm
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('gifts')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Quà tặng thủ công theo lô
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('artisans')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Xưởng gốm Bát Tràng
                </button>
              </li>
            </ul>
          </div>

          {/* Customer support */}
          <div className="md:col-span-4 space-y-3">
            <h5 className="font-heritage text-base font-semibold text-white tracking-wide">
              Đơn hàng & Hỗ trợ
            </h5>
            <ul className="space-y-2.5 text-xs sm:text-sm text-white/70">
              <li>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('my-orders')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Đơn hàng của tôi
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab && onNavigateTab('model')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Quy trình đặt & duyệt mẫu
                </button>
              </li>
              <li>
                <span className="text-white/60">
                  Thời gian làm việc: 8:00 - 18:00 (Hàng ngày)
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <p>© 2026 MADE IN VIETNAM LAB. Tinh hoa gốm thủ công Bát Tràng.</p>
          <p className="text-[11px] font-mono">
            Phiên bản thử nghiệm (Interactive Prototype V1)
          </p>
        </div>
      </div>
    </footer>
  );
};
