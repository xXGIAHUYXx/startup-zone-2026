import React, { useState } from 'react';
import type { UserRole } from '../../types';
import { SlidersHorizontal, Users, Store, Globe, X, RotateCcw, Check, Sparkles, Inbox } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSelectScenario?: (scenarioId: string) => void;
  onResetDemo?: () => void;
}

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({
  currentRole,
  onRoleChange,
  onSelectScenario,
  onResetDemo
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [confirmingScenario, setConfirmingScenario] = useState<{ id: string; title: string; desc: string; targetRole: UserRole } | null>(null);

  const roles: { role: UserRole; title: string; subtitle: string; icon: any }[] = [
    {
      role: 'guest',
      title: 'Khách hàng (Trang chủ)',
      subtitle: 'Khám phá dịch vụ & gửi yêu cầu mới',
      icon: Globe
    },
    {
      role: 'customer',
      title: 'Khách hàng (Đơn hàng của tôi)',
      subtitle: 'Xem tiến độ, phản hồi giá & duyệt mẫu',
      icon: Users
    },
    {
      role: 'owner',
      title: 'Chủ nền tảng (Điều phối viên)',
      subtitle: 'Tiếp nhận đơn, chat tư vấn, chuyển xưởng',
      icon: Inbox
    },
    {
      role: 'artisan',
      title: 'Xưởng thủ công Bát Tràng',
      subtitle: 'Nhận đơn được chuyển, báo giá & làm mẻ',
      icon: Store
    }
  ];

  const scenarios = [
    {
      id: 'scen-an-nam',
      title: 'Kịch bản B: Quà tặng 20 bộ ly sứ men hỏa biến',
      desc: 'Lô 20 bộ ly: Khách 8tr, Xưởng 6tr, Phí Lab 2tr. Đang ở bước khách duyệt phương án.',
      targetRole: 'customer' as UserRole
    },
    {
      id: 'scen-sao-mai',
      title: 'Kịch bản A: Workshop làm gốm đoàn 20 người',
      desc: 'Đoàn 20 người: Khách 10tr, Xưởng 7tr, Phí Lab 3tr. Yêu cầu mới chờ Owner tiếp nhận.',
      targetRole: 'owner' as UserRole
    },
    {
      id: 'scen-artisan',
      title: 'Góc nhìn Xưởng: Tiếp nhận đơn được phân công',
      desc: 'Xem góc nhìn xưởng Bát Tràng thẩm định năng lực và đề xuất báo giá xưởng.',
      targetRole: 'artisan' as UserRole
    }
  ];

  const handleReset = () => {
    if (onResetDemo) {
      onResetDemo();
      setShowConfirmReset(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Floating Compact Toggle Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-[#000000]/95 hover:bg-[#000000] text-white backdrop-blur-md px-3.5 py-2.5 rounded-full shadow-xl hover:shadow-2xl border border-white/20 text-xs font-medium transition-all duration-200 hover:scale-105 cursor-pointer group"
          title="Chuyển đổi vai trò trải nghiệm"
        >
          <SlidersHorizontal size={14} className="text-[#0071e3] group-hover:rotate-45 transition-transform" />
          <span>Chế độ trải nghiệm (3 vai trò)</span>
          <span className="w-2 h-2 rounded-full bg-[#0071e3] animate-pulse" />
        </button>
      )}

      {/* Pop-up Panel when opened */}
      {isOpen && (
        <div className="w-88 sm:w-96 bg-[#f5f5f7] rounded-2xl shadow-2xl border border-[#d2d2d7] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-4 bg-[#000000] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-[#0071e3]" />
              <div>
                <h4 className="font-heritage text-base font-semibold leading-tight">
                  Chuyển Đổi 3 Vai Trò
                </h4>
                <p className="text-[11px] text-white/70">
                  Khách hàng • Điều phối viên • Xưởng Bát Tràng
                </p>
              </div>
            </div>
            <button
              onClick={() => { setIsOpen(false); setShowConfirmReset(false); }}
              className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Role Switching */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#6e6e73] font-semibold block mb-2">
                Chọn vai trò để thao tác:
              </span>
              <div className="space-y-1.5">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const isActive = currentRole === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        onRoleChange(r.role);
                      }}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#1d1d1f] text-white border-[#1d1d1f] shadow-xs'
                          : 'bg-white text-[#1d1d1f] border-[#e8e8ed] hover:border-[#0071e3]/50 hover:bg-[#fbfbfd]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/10 text-white' : 'bg-black/5 text-[#515154]'}`}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <strong className="text-xs font-semibold block leading-tight">
                            {r.title}
                          </strong>
                          <span className={`text-[11px] ${isActive ? 'text-white/70' : 'text-[#6e6e73]'}`}>
                            {r.subtitle}
                          </span>
                        </div>
                      </div>
                      {isActive && <Check size={16} className="text-[#0071e3] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Scenario Launcher */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#6e6e73] font-semibold block mb-2">
                Nạp kịch bản mẫu nhanh:
              </span>
              {confirmingScenario ? (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
                  <p className="text-amber-950 font-semibold leading-snug">
                    Xác nhận nạp "{confirmingScenario.title}"?
                  </p>
                  <p className="text-[11px] text-amber-850 leading-relaxed text-[#7c5e10]">
                    Đơn hàng mẫu này được gắn cờ kịch bản thử nghiệm (Demo Scenario) để kiểm tra quy trình Một hồ sơ — Ba lần xác nhận mà không ảnh hưởng đơn tự tạo của bạn.
                  </p>
                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setConfirmingScenario(null)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#d2d2d7] text-[#515154] text-xs cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectScenario) onSelectScenario(confirmingScenario.id);
                        setConfirmingScenario(null);
                        setIsOpen(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-[#0071e3] text-white text-xs font-semibold cursor-pointer hover:bg-[#0062c4]"
                    >
                      Xác nhận nạp
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {scenarios.map((scen) => (
                    <button
                      key={scen.id}
                      type="button"
                      onClick={() => setConfirmingScenario(scen)}
                      className="w-full p-2.5 rounded-xl bg-white hover:bg-[#f0f7ff] border border-[#e8e8ed] hover:border-[#0071e3]/40 text-left transition-all cursor-pointer group"
                    >
                      <strong className="text-xs font-semibold text-[#1d1d1f] group-hover:text-[#0071e3] block leading-tight mb-0.5">
                        {scen.title}
                      </strong>
                      <p className="text-[11px] text-[#6e6e73] leading-snug">
                        {scen.desc}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Data Confirmation */}
            <div className="pt-2 border-t border-[#e8e8ed]">
              {!showConfirmReset ? (
                <button
                  onClick={() => setShowConfirmReset(true)}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-[#d2d2d7] hover:border-red-400 text-[#6e6e73] hover:text-red-600 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Đặt lại toàn bộ dữ liệu (Về trạng thái trống)</span>
                </button>
              ) : (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs space-y-2">
                  <p className="text-red-900 font-semibold leading-snug">
                    Xác nhận xóa toàn bộ đơn hàng và tin nhắn chat trong bộ nhớ trình duyệt?
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setShowConfirmReset(false)}
                      className="px-2.5 py-1 rounded-lg bg-white border border-[#d2d2d7] text-[#515154] text-xs cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-semibold cursor-pointer hover:bg-red-700"
                    >
                      Xóa dữ liệu
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-[#f5f5f7] border-t border-[#e8e8ed] text-center">
            <button
              onClick={() => { setIsOpen(false); setShowConfirmReset(false); }}
              className="text-xs font-semibold text-[#1d1d1f] hover:text-[#0071e3] cursor-pointer"
            >
              Đóng bảng điều khiển
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
