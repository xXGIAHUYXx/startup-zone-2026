import React, { useState } from 'react';
import type { UserRole, ServiceType } from '../../types';
import { Button } from '../common/Button';
import { Menu, X, ArrowRight, Package } from 'lucide-react';

interface NavbarProps {
  currentRole: UserRole;
  onNavigateTab: (tab: string) => void;
  onOpenQuickRequest: (initialService?: ServiceType) => void;
  activeTab: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onNavigateTab,
  onOpenQuickRequest,
  activeTab
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: string) => {
    onNavigateTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="glass sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          {/* Ceramic Seal Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-serif text-lg font-semibold shadow-sm group-hover:bg-[#0077ed] transition-colors">
            <span>VN</span>
          </div>
          <div>
            <span className="font-heritage text-base sm:text-[17px] font-semibold tracking-tight text-[#1d1d1f] group-hover:text-[#0071e3] transition-colors block leading-none whitespace-nowrap">
              MADE IN VIETNAM LAB
            </span>
            <span className="hidden xl:block text-[11px] text-[#6e6e73] tracking-wide mt-1 whitespace-nowrap">
              Gốm thủ công Bát Tràng
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1.5 text-[13px] xl:text-sm font-medium text-[#424245] whitespace-nowrap">
          <button
            onClick={() => handleNavClick('home')}
            className={`px-2.5 xl:px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'home' && currentRole === 'guest'
                ? 'text-[#0071e3] font-semibold bg-[#0071e3]/8'
                : 'hover:text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            Trang chủ
          </button>

          <button
            onClick={() => handleNavClick('workshop')}
            className={`px-2.5 xl:px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'workshop'
                ? 'text-[#0071e3] font-semibold bg-[#0071e3]/8'
                : 'hover:text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            Trải nghiệm làm gốm
          </button>

          <button
            onClick={() => handleNavClick('gifts')}
            className={`px-2.5 xl:px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'gifts'
                ? 'text-[#0071e3] font-semibold bg-[#0071e3]/8'
                : 'hover:text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            Quà tặng thủ công
          </button>

          <button
            onClick={() => handleNavClick('model')}
            className={`px-2.5 xl:px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'model'
                ? 'text-[#0071e3] font-semibold bg-[#0071e3]/8'
                : 'hover:text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            Quy trình
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`px-2.5 xl:px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'about'
                ? 'text-[#0071e3] font-semibold bg-[#0071e3]/8'
                : 'hover:text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            Về chúng tôi
          </button>

          <button
            onClick={() => handleNavClick('my-orders')}
            className={`px-2.5 xl:px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'my-orders' || currentRole === 'customer'
                ? 'text-[#1d1d1f] font-semibold bg-[#1d1d1f]/8'
                : 'hover:text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            <Package size={15} className="text-[#0071e3]" />
            <span className="hidden xl:inline">Đơn hàng của tôi</span>
          </button>
        </nav>

        {/* Right Action CTA & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <Button
            variant="terracotta"
            size="md"
            icon={<ArrowRight size={15} />}
            iconPosition="right"
            onClick={() => onOpenQuickRequest()}
            className="hidden sm:inline-flex shrink-0 whitespace-nowrap text-[13px] font-semibold"
          >
            Gửi yêu cầu
          </Button>

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#1d1d1f] hover:bg-black/5 transition-colors cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-thick rounded-b-3xl px-4 pt-3 pb-6 space-y-2 animate-sheet-down">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'home' && currentRole === 'guest'
                ? 'bg-[#0071e3]/10 text-[#0071e3] font-semibold'
                : 'text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            Trang chủ
          </button>

          <button
            onClick={() => handleNavClick('workshop')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'workshop'
                ? 'bg-[#0071e3]/10 text-[#0071e3] font-semibold'
                : 'text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            Trải nghiệm làm gốm
          </button>

          <button
            onClick={() => handleNavClick('gifts')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'gifts'
                ? 'bg-[#0071e3]/10 text-[#0071e3] font-semibold'
                : 'text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            Quà tặng thủ công
          </button>

          <button
            onClick={() => handleNavClick('model')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'model'
                ? 'bg-[#0071e3]/10 text-[#0071e3] font-semibold'
                : 'text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            Quy trình
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium ${
              activeTab === 'about'
                ? 'bg-[#0071e3]/10 text-[#0071e3] font-semibold'
                : 'text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            Về chúng tôi
          </button>

          <button
            onClick={() => handleNavClick('my-orders')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${
              activeTab === 'my-orders' || currentRole === 'customer'
                ? 'bg-[#1d1d1f]/10 text-[#1d1d1f] font-semibold'
                : 'text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            <Package size={16} className="text-[#0071e3]" />
            <span>Đơn hàng của tôi</span>
          </button>

          <div className="pt-3 border-t border-[#e8e8ed]">
            <Button
              variant="terracotta"
              size="md"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQuickRequest();
              }}
              className="w-full justify-center text-sm font-semibold"
            >
              Gửi yêu cầu
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
