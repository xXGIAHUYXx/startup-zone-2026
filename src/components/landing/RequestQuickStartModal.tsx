import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import type { ServiceType } from '../../types';
import { Sparkles, Compass, Gift, ArrowRight, CheckCircle2 } from 'lucide-react';

interface RequestQuickStartModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialService?: ServiceType;
  onSubmitMockRequest: (requestData: any) => void;
}

export const RequestQuickStartModal: React.FC<RequestQuickStartModalProps> = ({
  isOpen,
  onClose,
  initialService = 'gifts',
  onSubmitMockRequest
}) => {
  const [service, setService] = useState<ServiceType>(initialService);
  const [title, setTitle] = useState('');
  const [org, setOrg] = useState('');
  const [quantity, setQuantity] = useState(service === 'gifts' ? '20' : '15');
  const [targetDate, setTargetDate] = useState('20/11/2026');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<'input' | 'ai_normalizing' | 'success'>('input');

  const handleServiceChange = (newService: ServiceType) => {
    setService(newService);
    if (newService === 'gifts') {
      setTitle('[DEMO] 20 Bộ Ấm Chén Men Lam Quà Tặng Tri Ân');
      setOrg('[DEMO] Viện Nghiên Cứu Đổi Mới Sáng Tạo');
      setQuantity('20');
    } else {
      setTitle('[DEMO] Workshop Trải Nghiệm Bàn Xoay Gốm 15 Nhân Sự');
      setOrg('[DEMO] Công Ty Giải Pháp Công Nghệ Đông Đô');
      setQuantity('15');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('ai_normalizing');

    setTimeout(() => {
      setStep('success');
    }, 1200);
  };

  const handleFinish = () => {
    onSubmitMockRequest({
      serviceType: service,
      title: title || (service === 'gifts' ? '[DEMO] Lô 20 Món Quà Tặng Gốm Bát Tràng' : '[DEMO] Workshop Trải Nghiệm Gốm Nhóm 15 Khách'),
      clientOrg: org || '[DEMO] Tổ Chức Trải Nghiệm Thử Nghiệm',
      clientName: 'Đại diện Ban Giám Khảo',
      quantityOrParticipants: parseInt(quantity) || (service === 'gifts' ? 20 : 15),
      targetDate: targetDate || '25/11/2026',
      briefSummary: notes || 'Yêu cầu được chuẩn hóa tự động qua AI Assistant: Đối chiếu quy cách lò nung Bát Tràng cho quy mô 10-20.'
    });
    setStep('input');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo Yêu Cầu Điều Phối (Demo Trải Nghiệm)"
      subtitle="Mô phỏng Bước 1 (Confirm Need): Khách gửi brief sơ khởi để AI hỗ trợ chuẩn hóa thành thông số kỹ thuật"
      maxWidth="2xl"
    >
      {step === 'input' && (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service toggle */}
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] mb-2 uppercase tracking-wider">
              Chọn Dòng Dịch Vụ Cần Điều Phối
            </label>
            <div className="grid grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => handleServiceChange('gifts')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  service === 'gifts'
                    ? 'border-[#0071e3] bg-[#f0f7ff] text-[#0071e3] shadow-xs'
                    : 'border-[#e8e8ed] hover:border-black/20 text-[#6e6e73]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Gift size={20} />
                  {service === 'gifts' && <CheckCircle2 size={16} />}
                </div>
                <strong className="text-sm font-semibold block text-[#1d1d1f] font-heritage">
                  Cultural Gifts
                </strong>
                <span className="text-xs text-[#6e6e73]">
                  Quà tặng theo lô nhỏ (~20 sản phẩm)
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleServiceChange('workshop')}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  service === 'workshop'
                    ? 'border-[#1d1d1f] bg-[#f5f5f7] text-[#1d1d1f] shadow-xs'
                    : 'border-[#e8e8ed] hover:border-black/20 text-[#6e6e73]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Compass size={20} />
                  {service === 'workshop' && <CheckCircle2 size={16} />}
                </div>
                <strong className="text-sm font-semibold block text-[#1d1d1f] font-heritage">
                  Creation Experience
                </strong>
                <span className="text-xs text-[#6e6e73]">
                  Workshop trải nghiệm nhóm (10–20 người)
                </span>
              </button>
            </div>
          </div>

          {/* Title & Org */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#424245] mb-1.5">
                Tổ Chức / Đơn Vị Đặt Hàng (Hư cấu Demo)
              </label>
              <input
                type="text"
                required
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="VD: [DEMO] Công ty Công nghệ An Nam..."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#424245] mb-1.5">
                Tiêu Đề Dự Án / Sự Kiện
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={service === 'gifts' ? 'VD: 20 Bình gốm kỷ niệm' : 'VD: Workshop trải nghiệm nhóm 15 người'}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
          </div>

          {/* Quantity & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#424245] mb-1.5">
                {service === 'gifts' ? 'Số lượng sản phẩm dự kiến (10–20 món)' : 'Số lượng thành viên (10–20 người)'}
              </label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#424245] mb-1.5">
                Thời Hạn Mục Tiêu Bàn Giao / Tổ Chức
              </label>
              <input
                type="text"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                placeholder="VD: 20/11/2026"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0071e3]"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#424245] mb-1.5">
              Mô Tả Brief Ban Đầu (Chất liệu men, yêu cầu khắc logo, chủ đề)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Muốn men rạn cổ hoặc men hoả biến màu xanh chàm, cần in logo chìm ở đáy sản phẩm, có hộp quà mộc..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:border-[#0071e3]"
            />
          </div>

          {/* AI Helper Banner */}
          <div className="p-3.5 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed] flex items-start gap-3 text-xs sm:text-sm text-[#515154]">
            <Sparkles size={18} className="text-[#0071e3] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#1d1d1f]">Vai trò AI trong đề án:</strong>
              <p className="text-xs leading-relaxed mt-0.5">
                AI hỗ trợ bóc tách các thông số quy chuẩn (kích thước, loại men, quy cách bao bì). Sau đó chuyển sang cơ chế Rule-based Matching lọc xưởng Bát Tràng theo năng lực khai báo. <em>AI không tự xác nhận giá hay thời hạn thay cho xưởng.</em>
              </p>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3">
            <Button variant="ghost" size="md" type="button" onClick={onClose} className="text-xs sm:text-sm">
              Hủy Bỏ
            </Button>
            <Button
              variant={service === 'gifts' ? 'terracotta' : 'forest'}
              size="md"
              type="submit"
              icon={<ArrowRight size={15} />}
              iconPosition="right"
              className="text-xs sm:text-sm font-semibold"
            >
              Gửi Yêu Cầu Chuẩn Hóa
            </Button>
          </div>
        </form>
      )}

      {step === 'ai_normalizing' && (
        <div className="py-12 text-center space-y-4">
          <div className="w-12 h-12 border-3 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto" />
          <h4 className="font-heritage text-xl sm:text-2xl font-semibold text-[#1d1d1f]">
            AI Đang Cấu Trúc Lại Brief & Chuẩn Hóa Thông Số...
          </h4>
          <p className="text-xs sm:text-sm text-[#6e6e73] max-w-md mx-auto leading-relaxed">
            Bóc tách thông số kỹ thuật men gốm, kích thước, quy cách đóng gói và chuẩn bị hồ sơ cho Mốc 1 (Confirm Need).
          </p>
        </div>
      )}

      {step === 'success' && (
        <div className="py-8 text-center space-y-4">
          <div className="w-14 h-14 bg-[#1d1d1f]/10 text-[#1d1d1f] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h4 className="font-heritage text-2xl font-semibold text-[#1d1d1f]">
            Đã Khởi Tạo Hồ Sơ Yêu Cầu Thành Công!
          </h4>
          <p className="text-xs sm:text-sm text-[#515154] max-w-lg mx-auto leading-relaxed">
            Hồ sơ đã được chuyển vào quy trình <strong>"Một hồ sơ — Ba lần xác nhận"</strong>. Bạn sẽ được chuyển sang Cổng Khách Hàng (Customer Portal) để theo dõi tiến độ duyệt.
          </p>
          <div className="pt-3">
            <Button
              variant="terracotta"
              size="lg"
              onClick={handleFinish}
              icon={<ArrowRight size={16} />}
              iconPosition="right"
              className="text-xs sm:text-sm font-semibold"
            >
              Mở Cổng Khách Hàng Xem Tiến Độ
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
