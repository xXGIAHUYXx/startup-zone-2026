import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { CreativePassportCard } from '../customer/CreativePassportCard';
import type { ArtisanExecutionReport } from '../../types';
import { 
  Store, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Flame, 
  DollarSign, 
  ArrowLeft, 
  Clock, 
  Check, 
  X, 
  Inbox,
  AlertCircle,
  FileCheck,
  Award
} from 'lucide-react';

export const ArtisanDashboard: React.FC<{ onBackToClientSite?: () => void }> = ({ onBackToClientSite }) => {
  const { requests, workshops, artisanRespond, artisanReportExecution } = useApp();
  
  // Cho phép chuyển đổi giữa các xưởng Bát Tràng để kiểm thử tính cách ly dữ liệu
  const [currentWorkshopId, setCurrentWorkshopId] = useState('ws-an-nhien');
  const currentWorkshop = workshops.find(w => w.id === currentWorkshopId) || workshops[0];

  // Tab view
  const [activeTab, setActiveTab] = useState<'orders' | 'passport'>('orders');
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  // Modal 1: Xác nhận năng lực & báo giá xưởng
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmReqId, setConfirmReqId] = useState<string | null>(null);
  const [proposedPrice, setProposedPrice] = useState('');
  const [proposedSchedule, setProposedSchedule] = useState('');
  const [technicalNotes, setTechnicalNotes] = useState('');

  // Modal 2: Từ chối thực hiện (Exception status)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReqId, setRejectReqId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Modal 3: Báo cáo hoàn tất thực hiện (Workshop / Quà tặng)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReqId, setReportReqId] = useState<string | null>(null);
  const [reportNotes, setReportNotes] = useState('');
  const [actualParticipants, setActualParticipants] = useState('20');
  const [postFiringFollowup, setPostFiringFollowup] = useState('Thành phẩm của khách đã được đánh số mã và đưa vào lò nung sấy, dự kiến giao sau 5 ngày theo thỏa thuận.');
  const [completedItemsCount, setCompletedItemsCount] = useState('20');

  // LỌC CHẶT CHẼ: Xưởng CHỈ xem những yêu cầu được Owner phân công tới xưởng này (Mục 3.3 & VII)
  const workshopOrders = requests.filter(r => r.assignedWorkshopId === currentWorkshop.id);

  // Đơn mới cần xưởng phản hồi
  const pendingOrders = workshopOrders.filter(r => r.status === 'da_chuyen_xuong');

  // Đơn đang thực hiện hoặc đã hoàn thành
  const activeOrders = workshopOrders.filter(r => r.status !== 'da_chuyen_xuong' && r.status !== 'xuong_tu_choi');

  const selectedOrder = workshopOrders.find(r => r.id === selectedReqId) || workshopOrders[0];

  // Mở modal xác nhận
  const handleOpenConfirm = (order: any) => {
    setConfirmReqId(order.id);
    setProposedPrice('');
    setProposedSchedule('');
    setTechnicalNotes('');
    setIsConfirmModalOpen(true);
  };

  const handleSubmitConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmReqId) {
      const res = artisanRespond(confirmReqId, 'confirmed', {
        proposedPrice: proposedPrice.trim() || 'Thỏa thuận theo điều kiện thực tế',
        proposedSchedule: proposedSchedule.trim() || 'Theo tiến độ xưởng',
        technicalNotes: technicalNotes.trim() || 'Xưởng đảm bảo quy chuẩn kỹ thuật'
      });
      if (!res.success && res.message) {
        alert(res.message);
        return;
      }
      setIsConfirmModalOpen(false);
    }
  };

  // Mở modal từ chối
  const handleOpenReject = (order: any) => {
    setRejectReqId(order.id);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleSubmitReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectReqId) {
      const res = artisanRespond(rejectReqId, 'rejected', {
        rejectionReason: rejectionReason.trim() || 'Xưởng hiện kín lịch lò nung'
      });
      if (!res.success && res.message) {
        alert(res.message);
        return;
      }
      setIsRejectModalOpen(false);
    }
  };

  // Mở modal báo cáo hoàn tất (Mốc 3)
  const handleOpenReportModal = (order: any) => {
    setReportReqId(order.id);
    setActualParticipants(String(order.workshopDetails?.participantsCount || 20));
    setCompletedItemsCount(String(order.giftsDetails?.quantity || 20));
    setReportNotes('');
    setPostFiringFollowup('');
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportReqId) {
      const targetReq = workshopOrders.find(r => r.id === reportReqId);
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

      const report: ArtisanExecutionReport = {
        reportedAt: formattedDate,
        reportNotes: reportNotes.trim() || 'Xưởng đã hoàn thành công việc theo hồ sơ',
        workshopActualParticipants: targetReq?.serviceType === 'workshop' ? Number(actualParticipants) : undefined,
        postFiringFollowup: targetReq?.serviceType === 'workshop' ? postFiringFollowup : undefined,
        completedItemsCount: targetReq?.serviceType === 'gifts' ? Number(completedItemsCount) : undefined
      };

      const res = artisanReportExecution(reportReqId, report);
      if (!res.success && res.message) {
        alert(res.message);
        return;
      }
      setIsReportModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      
      {/* 1. Header Cổng Quản Lý Xưởng */}
      <header className="bg-[#000000]/75 backdrop-blur-xl backdrop-saturate-150 text-white border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-semibold">
              <Store size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heritage text-lg sm:text-xl font-semibold tracking-tight text-white">
                  Cổng Quản Lý Xưởng Bát Tràng (Artisan Portal)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-amber-200 uppercase font-semibold">
                  Đối Tác Làng Nghề
                </span>
              </div>
              <p className="text-xs text-white/70">
                Không gian thẩm định năng lực chế tác, báo giá xưởng và cập nhật tiến độ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Bộ chuyển đổi xưởng để kiểm tra cách ly dữ liệu (Section VII criteria 5) */}
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
              <span className="text-[11px] text-white/70 hidden sm:inline">Đang xem vai trò:</span>
              <select
                value={currentWorkshopId}
                onChange={(e) => setCurrentWorkshopId(e.target.value)}
                className="bg-transparent text-xs text-amber-200 font-semibold focus:outline-none cursor-pointer"
              >
                {workshops.map((w) => (
                  <option key={w.id} value={w.id} className="text-[#1d1d1f] bg-white">
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            {onBackToClientSite && (
              <button
                onClick={onBackToClientSite}
                className="px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-xs font-medium text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span className="hidden sm:inline">Về trang chính</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* Banner Xưởng hiện tại */}
        <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentWorkshop.avatar}
              alt={currentWorkshop.name}
              className="w-16 h-16 rounded-2xl object-cover border border-[#e8e8ed] shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#1d1d1f]/10 text-[#1d1d1f] font-semibold">
                  {currentWorkshop.generation}
                </span>
                <span className="text-xs text-[#86868b]">• {currentWorkshop.villageArea}</span>
              </div>
              <h2 className="font-heritage text-2xl font-semibold text-[#1d1d1f]">
                {currentWorkshop.name}
              </h2>
              <p className="text-xs text-[#515154] mt-0.5">
                Nghệ nhân phụ trách: <strong>{currentWorkshop.artisanLeader}</strong> • Quy mô: {currentWorkshop.capacityMonth}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto text-xs">
            <div className="p-3 rounded-xl bg-[#f5f5f7] border border-[#e8e8ed] text-center">
              <span className="text-[#86868b] block text-[11px]">Đơn chờ xưởng duyệt</span>
              <strong className="text-lg font-semibold text-[#0071e3]">{pendingOrders.length}</strong>
            </div>
            <div className="p-3 rounded-xl bg-[#f5f5f7] border border-[#e8e8ed] text-center">
              <span className="text-[#86868b] block text-[11px]">Đơn đang chế tác</span>
              <strong className="text-lg font-semibold text-[#1d1d1f]">{activeOrders.length}</strong>
            </div>
          </div>
        </div>

        {/* Isolation Notice (Mục 3.3 & VII) */}
        <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between text-xs text-blue-900">
          <span>
            <strong>Phân quyền hiển thị:</strong> Xưởng chỉ nhìn thấy các yêu cầu được Điều phối viên phân công trực tiếp tới <em>{currentWorkshop.name}</em>.
          </span>
          <span className="font-mono text-[11px] text-blue-700">
            Tổng cộng: {workshopOrders.length} đơn
          </span>
        </div>

        {/* Tab switcher: Danh sách đơn vs Hồ sơ sáng tạo */}
        <div className="flex items-center gap-3 border-b border-[#d2d2d7]/80 pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#000000] text-white font-semibold'
                : 'text-[#515154] hover:text-[#000000] hover:bg-black/5'
            }`}
          >
            <Store size={16} />
            <span>Yêu cầu tại xưởng ({workshopOrders.length})</span>
          </button>

          {selectedOrder && (
            <button
              onClick={() => setActiveTab('passport')}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'passport'
                  ? 'bg-[#0071e3] text-white font-semibold'
                  : 'text-[#515154] hover:text-[#0071e3] hover:bg-black/5'
              }`}
            >
              <FileCheck size={16} />
              <span>Hồ sơ sáng tạo ({selectedOrder.id})</span>
            </button>
          )}
        </div>

        {/* TAB 1: DANH SÁCH ĐƠN TẠI XƯỞNG */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* 1. YÊU CẦU MỚI CHUYỂN TỚI (CẦN XƯỞNG PHẢN HỒI) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-heritage text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                  <Flame size={18} className="text-[#0071e3]" />
                  <span>Yêu Cầu Mới Cần Thẩm Định Năng Lực & Báo Giá ({pendingOrders.length})</span>
                </h3>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#d2d2d7] text-xs text-[#86868b]">
                  Hiện không có yêu cầu mới nào đang chờ xưởng phản hồi.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl p-5 border-2 border-[#0071e3]/40 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e8e8ed]">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-semibold text-[#0071e3]">{order.id}</span>
                            <span className="text-xs text-[#86868b]">| Chuyển lúc: {order.dispatchedAt}</span>
                          </div>
                          <h4 className="font-heritage text-lg font-semibold text-[#1d1d1f]">
                            {order.title}
                          </h4>
                        </div>
                        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300 self-start sm:self-auto">
                          Chờ xưởng phản hồi
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                        <div className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed]">
                          <span className="text-[#86868b] block text-[11px]">Khách hàng & Quy mô:</span>
                          <strong>{order.contactName} {order.organization ? `(${order.organization})` : ''}</strong>
                          <span className="block text-xs text-[#515154] mt-0.5">
                            {order.serviceType === 'workshop' 
                              ? `${order.workshopDetails?.participantsCount} người tham gia` 
                              : `${order.giftsDetails?.quantity} sản phẩm (${order.giftsDetails?.productType})`}
                          </span>
                        </div>

                        <div className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed]">
                          <span className="text-[#86868b] block text-[11px]">Thời hạn mong muốn:</span>
                          <strong className="text-[#1d1d1f]">{order.targetDate}</strong>
                        </div>

                        <div className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed]">
                          <span className="text-[#86868b] block text-[11px]">Ghi chú từ Điều phối viên:</span>
                          <p className="text-xs text-[#424245] ">
                            "{order.ownerDispatchNote || 'Nhờ xưởng kiểm tra năng lực và gửi báo giá xưởng.'}"
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed] text-xs space-y-1">
                        {order.rawBrief && (
                          <div className="mb-2 pb-2 border-b border-[#e8e8ed]">
                            <span className="text-[#86868b] block text-[11px] font-semibold">Mô tả gốc từ khách hàng:</span>
                            <p className="text-[#424245] ">"{order.rawBrief}"</p>
                          </div>
                        )}
                        <span className="text-[#86868b] block text-[11px] font-semibold">Thông số kỹ thuật & quy cách:</span>
                        <p className="text-[#1d1d1f] leading-relaxed">{order.description}</p>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex items-center justify-end gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<XCircle size={15} />}
                          onClick={() => handleOpenReject(order)}
                          className="text-xs text-red-700 hover:bg-red-50 hover:border-red-300"
                        >
                          Từ chối nhận
                        </Button>

                        <Button
                          variant="terracotta"
                          size="sm"
                          icon={<CheckCircle2 size={16} />}
                          onClick={() => handleOpenConfirm(order)}
                          className="text-xs font-semibold"
                        >
                          Xác nhận khả năng & Báo giá xưởng
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. CÁC ĐƠN ĐANG THỰC HIỆN HOẶC ĐÃ DUYỆT TẠI XƯỞNG */}
            <div className="space-y-3 pt-4">
              <h3 className="font-heritage text-lg font-semibold text-[#1d1d1f] flex items-center gap-2">
                <Store size={18} className="text-[#1d1d1f]" />
                <span>Tiến Độ Chế Tác & Thực Hiện Tại Xưởng ({activeOrders.length})</span>
              </h3>

              {activeOrders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#d2d2d7] text-xs text-[#86868b]">
                  Chưa có đơn hàng nào đang trong quá trình thực hiện tại xưởng này.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {activeOrders.map((order) => {
                    const isExecuting = order.status === 'dang_thuc_hien' || order.status === 'can_xu_ly_qc';
                    const isWaitingQc = order.status === 'cho_owner_qc';
                    const isWaitingClient = order.status === 'cho_khach_nghiem_thu';
                    const isDone = order.status === 'hoan_thanh';

                    return (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl p-5 border border-[#e8e8ed] shadow-xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e8e8ed]">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono text-xs font-semibold text-[#0071e3]">{order.id}</span>
                              <span className="text-xs text-[#86868b]">| {order.title}</span>
                            </div>
                            <span className="text-xs text-[#515154]">
                              Khách hàng: <strong>{order.contactName}</strong>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              isDone
                                ? 'bg-[#1d1d1f] text-white'
                                : isWaitingClient
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : isWaitingQc
                                ? 'bg-teal-100 text-teal-900 border border-teal-300'
                                : order.status === 'can_xu_ly_qc'
                                ? 'bg-red-100 text-red-900 border border-red-300'
                                : isExecuting
                                ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                                : 'bg-purple-100 text-purple-900 border border-purple-300'
                            }`}>
                              {isDone 
                                ? 'Đã hoàn thành' 
                                : isWaitingClient
                                ? 'QC Đạt • Chờ khách nhận'
                                : isWaitingQc 
                                ? 'Chờ Owner kiểm tra QC' 
                                : order.status === 'can_xu_ly_qc'
                                ? 'QC chưa đạt • Cần xử lý'
                                : isExecuting 
                                ? (order.serviceType === 'workshop' ? 'Đang chuẩn bị workshop' : 'Đang chế tác tại xưởng')
                                : 'Đã gửi báo giá xưởng'}
                            </span>

                            <button
                              onClick={() => {
                                setSelectedReqId(order.id);
                                setActiveTab('passport');
                              }}
                              className="text-xs text-[#0071e3] hover:underline font-medium"
                            >
                              Xem passport
                            </button>
                          </div>
                        </div>

                        {/* Order Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[#86868b] block text-[11px]">Báo giá xưởng:</span>
                            <strong className="text-[#1d1d1f]">{order.artisanResponse?.proposedPrice}</strong>
                          </div>
                          <div>
                            <span className="text-[#86868b] block text-[11px]">Lịch cam kết:</span>
                            <span className="text-[#424245] font-medium">{order.artisanResponse?.proposedSchedule}</span>
                          </div>
                          <div>
                            <span className="text-[#86868b] block text-[11px]">Phiên bản thiết kế:</span>
                            <span className="font-mono text-[#0071e3] font-semibold">
                              {order.clientApproval?.approvedDesignVersion || order.ownerProposal?.designOrProgramVersion || 'Đang cập nhật'}
                            </span>
                          </div>
                        </div>

                        {/* Alert when QC failed */}
                        {order.status === 'can_xu_ly_qc' && (
                          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900">
                            <strong>Yêu cầu xử lý từ QC ({order.qcRecord?.inspectorName}):</strong> {order.qcRecord?.notes}
                          </div>
                        )}

                        {/* Execution Action Button when dang_thuc_hien or can_xu_ly_qc */}
                        {isExecuting && (
                          <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-between gap-3">
                            <span className="text-xs text-indigo-900 font-medium">
                              {order.serviceType === 'workshop'
                                ? 'Khách đã chốt phương án. Xưởng tiến hành đón tiếp và tổ chức workshop.'
                                : 'Khách đã duyệt mẫu. Xưởng tiến hành tạo hình, nung men và đóng gói.'}
                            </span>

                            <Button
                              variant="forest"
                              size="sm"
                              icon={<Award size={15} />}
                              onClick={() => handleOpenReportModal(order)}
                              className="text-xs font-semibold"
                            >
                              {order.serviceType === 'workshop'
                                ? 'Báo cáo hoàn tất buổi workshop'
                                : 'Báo cáo hoàn tất chế tác & nung lò'}
                            </Button>
                          </div>
                        )}

                        {isWaitingQc && (
                          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900">
                            Xưởng đã gửi báo cáo hoàn tất thực hiện. Đang chờ Điều phối viên kiểm tra chất lượng (QC) theo hồ sơ đã duyệt.
                          </div>
                        )}

                        {isWaitingClient && (
                          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900">
                            Kiểm tra chất lượng (QC) đã đạt chuẩn. Đang chờ khách hàng xác nhận nhận hàng hoặc hoàn tất dịch vụ.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: HỒ SƠ SÁNG TẠO (CREATIVE PASSPORT) */}
        {activeTab === 'passport' && selectedOrder && (
          <div className="space-y-4">
            <CreativePassportCard passport={selectedOrder.creativePassport} request={selectedOrder} userRole="artisan" />
          </div>
        )}

      </div>

      {/* MODAL 1: XÁC NHẬN KHẢ NĂNG & BÁO GIÁ XƯỞNG */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Xác Nhận Năng Lực & Đề Xuất Báo Giá Xưởng"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitConfirm} className="space-y-4">
          <p className="text-xs text-[#6e6e73] leading-relaxed">
            Xưởng đối chiếu công suất lò nung hoặc lịch tiếp đón để gửi báo giá xưởng và cam kết kỹ thuật cho Điều phối viên:
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Giá xưởng đề xuất (VNĐ)
            </label>
            <input
              type="text"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              placeholder="Ví dụ: 6.000.000 VNĐ (hoặc mức giá xưởng tính toán)"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] bg-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Kế hoạch thời gian xưởng có thể đáp ứng
            </label>
            <input
              type="text"
              value={proposedSchedule}
              onChange={(e) => setProposedSchedule(e.target.value)}
              placeholder="Ví dụ: Sẵn sàng mẻ nung ngày 10/11/2026, bàn giao 12/11/2026..."
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Lưu ý kỹ thuật, công suất & điều kiện chế tác
            </label>
            <textarea
              rows={3}
              value={technicalNotes}
              onChange={(e) => setTechnicalNotes(e.target.value)}
              placeholder="Ghi chú về công suất lò, nhiệt độ nung men, độ co ngót men gốm..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#d2d2d7] bg-white"
            />
          </div>

          <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsConfirmModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="terracotta" size="sm" type="submit">
              Xác nhận và gửi phản hồi
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: TỪ CHỐI THỰC HIỆN */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Từ Chối Tiếp Nhận Yêu Cầu"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitReject} className="space-y-4">
          <p className="text-xs text-[#6e6e73]">
            Vui lòng nêu rõ lý do để Điều phối viên chuyển yêu cầu sang xưởng Bát Tràng khác phù hợp:
          </p>

          <div>
            <label className="block text-xs font-semibold text-red-900 uppercase mb-1">
              Lý do từ chối
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Ví dụ: Lò nung gas hiện đã kín công suất trong khoảng thời gian yêu cầu..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-red-300 bg-red-50/50"
            />
          </div>

          <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsRejectModalOpen(false)}>
              Quay lại
            </Button>
            <Button variant="terracotta" size="sm" type="submit">
              Xác nhận từ chối
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: BÁO CÁO HOÀN TẤT THỰC HIỆN */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Báo Cáo Hoàn Tất Thực Hiện Tại Xưởng"
        maxWidth="md"
      >
        <form onSubmit={handleSubmitReport} className="space-y-4">
          <p className="text-xs text-[#6e6e73] leading-relaxed">
            Cập nhật kết quả buổi workshop hoặc mẻ nung thành phẩm để chuyển sang bước kiểm tra chất lượng (QC) và bàn giao:
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Ghi chú kết quả thực hiện
            </label>
            <textarea
              rows={3}
              value={reportNotes}
              onChange={(e) => setReportNotes(e.target.value)}
              placeholder="Ghi chú về buổi workshop hoặc mẻ nung thành phẩm..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#d2d2d7] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Theo dõi thành phẩm / nung giao sau (nếu có)
            </label>
            <input
              type="text"
              value={postFiringFollowup}
              onChange={(e) => setPostFiringFollowup(e.target.value)}
              placeholder="Ví dụ: Lưu nung 20 sản phẩm tại xưởng, bàn giao sau 5 ngày..."
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] bg-white"
            />
          </div>

          <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsReportModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="forest" size="sm" type="submit">
              Gửi báo cáo hoàn tất
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
