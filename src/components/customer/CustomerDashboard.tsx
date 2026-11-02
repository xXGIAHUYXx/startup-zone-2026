import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { RequestDetailView } from './RequestDetailView';
import { ConsultationChatModal } from '../common/ConsultationChatModal';
import { 
  Package, 
  Plus, 
  ChevronRight, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  Store,
  Compass,
  Gift
} from 'lucide-react';

interface CustomerDashboardProps {
  onOpenCreateModal: () => void;
  selectedRequestId?: string;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onOpenCreateModal,
  selectedRequestId: initialSelectedId
}) => {
  const { requests } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(initialSelectedId || null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const currentReq = requests.find(r => r.id === (selectedId || initialSelectedId));

  // If a request is selected, show detail view
  if (currentReq) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <RequestDetailView
          request={currentReq}
          onBack={() => setSelectedId(null)}
          onOpenChat={() => setIsChatOpen(true)}
        />
        <ConsultationChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          relatedRequestId={currentReq.id}
          conversationId={`conv_${currentReq.id}`}
          customerId={currentReq.contactEmail || currentReq.contactPhone || currentReq.id}
          customerName={currentReq.contactName}
        />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'cho_tiep_nhan':
        return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300">Chờ tiếp nhận</span>;
      case 'dang_tu_van':
        return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-sky-100 text-sky-900 border border-sky-300">Đang tư vấn</span>;
      case 'da_chuyen_xuong':
        return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-blue-100 text-blue-900 border border-blue-300">Đã chuyển xưởng</span>;
      case 'cho_owner_kiem_tra':
        return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-purple-100 text-purple-900 border border-purple-300">Xưởng đã phản hồi • Đang kiểm tra</span>;
      case 'cho_khach_duyet':
        return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-[#0071e3]/15 text-[#0071e3] border border-[#0071e3]/40 font-semibold">Chờ bạn duyệt phương án</span>;
      case 'dang_thuc_hien':
        return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-indigo-100 text-indigo-900 border border-indigo-300">Đang thực hiện</span>;
      case 'cho_owner_qc':
        return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-teal-100 text-teal-900 border border-teal-300">Đang kiểm tra chất lượng (QC)</span>;
      case 'cho_khach_nghiem_thu':
        return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold animate-pulse">Chờ bạn xác nhận bàn giao</span>;
      case 'can_xu_ly_qc':
        return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-red-100 text-red-900 border border-red-300">Đang hiệu chỉnh chất lượng</span>;
      case 'hoan_thanh':
        return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-[#1d1d1f] text-white">Đã hoàn thành</span>;
      case 'xuong_tu_choi':
        return <span className="text-xs px-3 py-1 rounded-full font-semibold bg-red-100 text-red-900 border border-red-300">Đang điều phối lại xưởng khác</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1d1d1f] to-[#000000] rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-mono tracking-widest uppercase text-amber-200 block font-semibold">
              KHÔNG GIAN KHÁCH HÀNG
            </span>
            <h1 className="font-heritage text-3xl sm:text-4xl font-semibold leading-tight">
              Đơn hàng & Yêu cầu của bạn
            </h1>
            <p className="text-sm text-white/80 max-w-xl leading-relaxed">
              Theo dõi trực tiếp quá trình điều phối, xem báo giá từ các xưởng gốm Bát Tràng và duyệt mẫu thực tế trước khi xưởng tiến hành mẻ chính.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              <MessageSquare size={16} />
              <span>Nhắn tin tư vấn</span>
            </button>

            <Button
              variant="terracotta"
              size="lg"
              icon={<Plus size={18} />}
              onClick={onOpenCreateModal}
              className="text-xs sm:text-sm font-semibold shadow-md"
            >
              Gửi yêu cầu mới
            </Button>
          </div>
        </div>

        {/* Decorative ambient */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#0071e3]/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Requests List Area */}
      <div className="space-y-4">
        
        {/* Section title */}
        <div className="flex items-center justify-between border-b border-[#e8e8ed] pb-3">
          <h2 className="font-heritage text-xl font-semibold text-[#1d1d1f]">
            Danh sách yêu cầu đã gửi ({requests.length})
          </h2>
          <span className="text-xs text-[#86868b]">
            Bấm vào từng yêu cầu để xem phản hồi và tiến độ
          </span>
        </div>

        {/* Empty State theo đúng Mục IV: Khi mở lần đầu, không có đơn hàng */}
        {requests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#e8e8ed] space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#f5f5f7] border border-[#e8e8ed] flex items-center justify-center text-[#86868b] mx-auto">
              <Package size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="font-heritage text-xl sm:text-2xl font-semibold text-[#1d1d1f]">
                Bạn chưa có yêu cầu nào
              </h3>
              <p className="text-xs sm:text-sm text-[#6e6e73] max-w-md mx-auto leading-relaxed">
                Hãy bắt đầu bằng cách gửi một yêu cầu đặt quà tặng hoặc đăng ký workshop làm gốm. Chúng tôi sẽ nhanh chóng kết nối với xưởng Bát Tràng phù hợp nhất.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="terracotta"
                size="md"
                icon={<Plus size={16} />}
                onClick={onOpenCreateModal}
                className="text-xs sm:text-sm font-semibold"
              >
                Gửi yêu cầu ngay
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map(req => (
              <Card
                key={req.id}
                hoverable
                onClick={() => setSelectedId(req.id)}
                className="p-5 sm:p-6 bg-white border border-[#e8e8ed] hover:border-[#0071e3]/50 transition-all rounded-2xl cursor-pointer"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#0071e3]">{req.id}</span>
                      <span className="text-xs text-[#86868b] font-mono">| {req.createdAt}</span>
                      {getStatusBadge(req.status)}
                    </div>

                    <h3 className="font-heritage text-xl font-semibold text-[#1d1d1f]">
                      {req.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#6e6e73] line-clamp-2 leading-relaxed max-w-3xl">
                      {req.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#515154] pt-1">
                      <span>Người gửi: <strong>{req.contactName}</strong></span>
                      {req.organization && <span>• Tổ chức: <strong>{req.organization}</strong></span>}
                      <span>• Hạn mong muốn: <strong>{req.targetDate}</strong></span>
                      {req.assignedWorkshopName && (
                        <span>• Xưởng phụ trách: <strong className="text-[#1d1d1f]">{req.assignedWorkshopName}</strong></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-[#0071e3] shrink-0 self-start lg:self-auto">
                    <span>Xem chi tiết & tiến độ</span>
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </div>

      {/* Consultation Chat Modal */}
      <ConsultationChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        conversationId="conv_general"
        customerId="guest_client"
        customerName="Khách hàng"
      />

    </div>
  );
};
