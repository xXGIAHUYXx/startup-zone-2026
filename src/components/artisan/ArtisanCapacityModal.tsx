import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Flame, CheckCircle2, Calendar, AlertCircle } from 'lucide-react';

interface ArtisanCapacityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (capacityInfo: any) => void;
}

export const ArtisanCapacityModal: React.FC<ArtisanCapacityModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [kilnStatus, setKilnStatus] = useState('active');
  const [nextFiringDate, setNextFiringDate] = useState('28/10/2026');
  const [availableSlots, setAvailableSlots] = useState('1,200 sản phẩm');
  const [glazeType, setGlazeType] = useState('Men Hỏa Biến & Men Rạn Cổ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      kilnStatus,
      nextFiringDate,
      availableSlots,
      glazeType
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập Nhật Lịch Lò & Năng Lực Nung Mẻ Mới"
      subtitle="Thông tin giúp hệ thống AI đề xuất đơn hàng chính xác, không gây quá tải cho xưởng"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#424245] mb-1">
            Trạng Thái Lò Nung Gas Hiện Tại
          </label>
          <select
            value={kilnStatus}
            onChange={(e) => setKilnStatus(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-[#d2d2d7] bg-white"
          >
            <option value="active">Đang sẵn sàng nhận mẻ nung mới (1260°C - 1280°C)</option>
            <option value="firing">Đang trong chu kỳ nung và làm nguội (3-4 ngày tới bận)</option>
            <option value="maintenance">Đang bảo trì buồng gạch chịu lửa</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#424245] mb-1">
              Ngày Đốt Lò Tiếp Theo
            </label>
            <input
              type="text"
              value={nextFiringDate}
              onChange={(e) => setNextFiringDate(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#d2d2d7] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#424245] mb-1">
              Dung Tích Lò Trống Còn Lại
            </label>
            <input
              type="text"
              value={availableSlots}
              onChange={(e) => setAvailableSlots(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-[#d2d2d7] bg-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#424245] mb-1">
            Loại Men Ưu Tiên Nung Cùng Mẻ
          </label>
          <input
            type="text"
            value={glazeType}
            onChange={(e) => setGlazeType(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-[#d2d2d7] bg-white"
          />
        </div>

        <div className="p-3 bg-[#f5f5f7] rounded-lg border border-[#e8e8ed] text-[11px] text-[#6e6e73]">
          <span className="font-semibold text-[#1d1d1f]">Quy tắc cốt lõi:</span> Xưởng chủ động cập nhật công suất. Lab và AI không tự ý cam kết lịch nung của xưởng với khách hàng.
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="ghost" size="sm" type="button" onClick={onClose}>
            Đóng
          </Button>
          <Button variant="forest" size="sm" type="submit" icon={<CheckCircle2 size={14} />}>
            Lưu Thông Tin Lò
          </Button>
        </div>
      </form>
    </Modal>
  );
};
