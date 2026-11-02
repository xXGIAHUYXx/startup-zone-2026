import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { CreativePassportCard } from '../customer/CreativePassportCard';
import { SmartMatchingModal } from './SmartMatchingModal';
import type { OrderRequest, OwnerProposal, QcRecord, HandoverRecord } from '../../types';
import { 
  Inbox, 
  Send, 
  Store, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft, 
  Gift, 
  User, 
  Calendar, 
  Filter,
  ShieldCheck,
  Award,
  Sparkles,
  FileCheck,
  FileText
} from 'lucide-react';

// Currency & number parsing helpers for dynamic pricing
const parseMoneyNumber = (str: string): number => {
  if (!str) return 0;
  const firstSegment = str.split('(')[0] || str;
  const cleaned = firstSegment.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
};

const formatMoneyVND = (num: number): string => {
  if (isNaN(num) || num <= 0) return '0 VNĐ';
  return num.toLocaleString('vi-VN') + ' VNĐ';
};

export const OwnerDashboard: React.FC<{ onBackToClientSite?: () => void }> = ({ onBackToClientSite }) => {
  const { 
    requests, 
    workshops, 
    dispatchToWorkshop, 
    ownerReviewAndSendProposal, 
    ownerSubmitQc,
    confirmHandover, 
    messages, 
    sendMessage,
    getConversationThreads,
    getMessagesForConversation
  } = useApp();
  
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'messages' | 'passport'>('orders');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Modal 1: Chuyển yêu cầu sang xưởng (hoặc điều phối lại xưởng khác)
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState(workshops[0]?.id || '');
  const [dispatchNote, setDispatchNote] = useState('');

  // Đợt 2B.02: Smart Matching Modal State
  const [isSmartMatchingOpen, setIsSmartMatchingOpen] = useState(false);

  // Modal 2: Kiểm tra phương án & Bóc tách chi phí gửi khách duyệt (Mục V - Dynamic Calculation)
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [proposalWorkshopPrice, setProposalWorkshopPrice] = useState('');
  const [proposalCoordinationFee, setProposalCoordinationFee] = useState('');
  const [proposalClientTotal, setProposalClientTotal] = useState('');
  const [proposalSchedule, setProposalSchedule] = useState('');
  const [proposalDesignVersion, setProposalDesignVersion] = useState('');
  const [proposalTerms, setProposalTerms] = useState('');

  // Modal 3: Kiểm tra chất lượng (QC) kiểm soát Đạt / Cần xử lý (Mục 3)
  const [isQcModalOpen, setIsQcModalOpen] = useState(false);
  const [qcInspectorName, setQcInspectorName] = useState('Điều phối viên MADE IN VIETNAM LAB');
  const [qcResult, setQcResult] = useState<'dat' | 'can_xu_ly'>('dat');
  const [qcNotes, setQcNotes] = useState('');

  // Modal 4: Ghi nhận bàn giao theo chứng từ bên ngoài (Mục 1)
  const [isExternalHandoverModalOpen, setIsExternalHandoverModalOpen] = useState(false);
  const [handoverSignerName, setHandoverSignerName] = useState('');
  const [handoverDocumentBasis, setHandoverDocumentBasis] = useState('');
  const [handoverNotesText, setHandoverNotesText] = useState('');
  const [workshopPostFiringStatus, setWorkshopPostFiringStatus] = useState('');

  // Isolated Chat state
  const [selectedConversationId, setSelectedConversationId] = useState<string>('');
  const [replyText, setReplyText] = useState('');

  // Selected request
  const currentReq = requests.find(r => r.id === selectedRequestId);

  // Status mapping badge
  const getStatusBadge = (status: OrderRequest['status']) => {
    switch (status) {
      case 'cho_tiep_nhan':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300">Chờ tiếp nhận</span>;
      case 'dang_tu_van':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-sky-100 text-sky-900 border border-sky-300">Đang tư vấn</span>;
      case 'da_chuyen_xuong':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-100 text-blue-900 border border-blue-300">Đã chuyển xưởng</span>;
      case 'cho_owner_kiem_tra':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-purple-100 text-purple-900 border border-purple-300">Xưởng phản hồi • Cần duyệt</span>;
      case 'cho_khach_duyet':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-100 text-amber-900 border border-amber-300">Chờ khách duyệt</span>;
      case 'dang_thuc_hien':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-indigo-100 text-indigo-900 border border-indigo-300">Đang thực hiện</span>;
      case 'cho_owner_qc':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-teal-100 text-teal-900 border border-teal-300 animate-pulse">Xưởng báo xong • Chờ QC</span>;
      case 'cho_khach_nghiem_thu':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">QC Đạt • Chờ bàn giao</span>;
      case 'can_xu_ly_qc':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-100 text-red-900 border border-red-300">QC chưa đạt • Cần xử lý</span>;
      case 'hoan_thanh':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-[#1d1d1f] text-white">Đã hoàn thành</span>;
      case 'xuong_tu_choi':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-red-100 text-red-900 border border-red-300">Xưởng từ chối • Cần chuyển lại</span>;
      case 'can_bo_sung':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-200">Cần bổ sung thông tin</span>;
      case 'yeu_cau_chinh_sua':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-orange-100 text-orange-900 border border-orange-300">Yêu cầu chỉnh sửa</span>;
      case 'da_huy':
        return <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-gray-200 text-gray-700">Đã hủy</span>;
      default:
        return null;
    }
  };

  // Dispatch Handlers
  const handleOpenDispatch = () => {
    setDispatchNote('');
    setIsDispatchModalOpen(true);
  };

  const handleOpenSmartMatching = () => {
    setIsSmartMatchingOpen(true);
  };

  const handleSelectWorkshopFromMatching = (workshopId: string, suggestedNote: string) => {
    setSelectedWorkshopId(workshopId);
    setDispatchNote(suggestedNote);
    setIsSmartMatchingOpen(false);
    setIsDispatchModalOpen(true);
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRequestId && selectedWorkshopId) {
      const res = dispatchToWorkshop(selectedRequestId, selectedWorkshopId, dispatchNote);
      if (!res.success && res.message) {
        alert(res.message);
        return;
      }
      setIsDispatchModalOpen(false);
    }
  };

  // Dynamic Quote Calculation handlers (Audited P0 Requirement)
  const handleWorkshopPriceChange = (val: string) => {
    setProposalWorkshopPrice(val);
    const ws = parseMoneyNumber(val);
    const coord = parseMoneyNumber(proposalCoordinationFee);
    if (ws > 0 || coord > 0) {
      setProposalClientTotal(formatMoneyVND(ws + coord));
    }
  };

  const handleCoordinationFeeChange = (val: string) => {
    setProposalCoordinationFee(val);
    const ws = parseMoneyNumber(proposalWorkshopPrice);
    const coord = parseMoneyNumber(val);
    if (ws > 0 || coord > 0) {
      setProposalClientTotal(formatMoneyVND(ws + coord));
    }
  };

  // Proposal Handlers (Owner bóc tách chi phí linh hoạt dựa trên giá xưởng thực tế)
  const handleOpenProposalModal = () => {
    if (!currentReq) return;
    
    // Parse dynamic workshop price from artisan response
    const wsPriceNum = parseMoneyNumber(currentReq.artisanResponse?.proposedPrice || '');
    // Dynamically calculate default coordination fee: 25-30% of workshop price rounded to 100k
    const defaultCoordNum = wsPriceNum > 0 ? Math.round((wsPriceNum * 0.3) / 100000) * 100000 : 2000000;
    const defaultTotalNum = wsPriceNum + defaultCoordNum;

    setProposalWorkshopPrice(wsPriceNum > 0 ? formatMoneyVND(wsPriceNum) : (currentReq.artisanResponse?.proposedPrice || ''));
    setProposalCoordinationFee(defaultCoordNum > 0 ? formatMoneyVND(defaultCoordNum) : '');
    setProposalClientTotal(defaultTotalNum > 0 ? formatMoneyVND(defaultTotalNum) : '');
    
    if (currentReq.serviceType === 'workshop') {
      setProposalDesignVersion(`VER-WS-${currentReq.id}-v1`);
      setProposalSchedule(currentReq.artisanResponse?.proposedSchedule || 'Theo thỏa thuận thời gian với xưởng');
      setProposalTerms('Bao gồm toàn bộ đất sét, bàn xoay cá nhân, men màu, hướng dẫn viên 1:5, trà Bát Tràng và chi phí đóng gói nung sản phẩm kỷ niệm.');
    } else {
      setProposalDesignVersion(`VER-GIFT-${currentReq.id}-v1`);
      setProposalSchedule(currentReq.artisanResponse?.proposedSchedule || 'Theo thỏa thuận thời gian với xưởng');
      setProposalTerms('Bảo hành 1 đổi 1 lỗi nung nứt men gốm; bao bì hộp giấy bồi lót lụa thủ công; khắc chìm dấu ấn cá nhân hóa.');
    }

    setIsProposalModalOpen(true);
  };

  const handleConfirmSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReq) return;

    const wsNum = parseMoneyNumber(proposalWorkshopPrice);
    const clientTotalNum = parseMoneyNumber(proposalClientTotal);

    if (wsNum <= 0) {
      alert('Vui lòng nhập giá xưởng thực tế hợp lệ (lớn hơn 0).');
      return;
    }

    if (clientTotalNum <= wsNum) {
      alert('Tổng giá thanh toán gửi khách hàng phải lớn hơn giá xưởng thực tế (phải bao gồm phí điều phối).');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const proposal: OwnerProposal = {
      workshopPrice: proposalWorkshopPrice.trim(),
      coordinationFee: proposalCoordinationFee.trim(),
      clientTotalPrice: proposalClientTotal.trim(),
      proposedSchedule: proposalSchedule.trim(),
      designOrProgramVersion: proposalDesignVersion.trim(),
      termsAndConditions: proposalTerms.trim(),
      reviewedAt: formattedDate
    };

    const res = ownerReviewAndSendProposal(currentReq.id, proposal);
    if (!res.success && res.message) {
      alert(res.message);
      return;
    }
    setIsProposalModalOpen(false);
  };

  // QC Handlers (Mục 3) - Không gán sẵn chữ mang tính khẳng định
  const handleOpenQcModal = () => {
    setQcResult('dat');
    setQcNotes('');
    setIsQcModalOpen(true);
  };

  const handleConfirmSubmitQc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReq) return;

    if (!qcNotes.trim()) {
      alert('Vui lòng nhập căn cứ hoặc ghi chú kiểm tra chất lượng thực tế.');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const qc: QcRecord = {
      inspectorName: qcInspectorName.trim(),
      inspectedAt: formattedDate,
      result: qcResult,
      notes: qcNotes.trim()
    };

    const res = ownerSubmitQc(currentReq.id, qc);
    if (!res.success && res.message) {
      alert(res.message);
      return;
    }
    setIsQcModalOpen(false);
  };

  // External Handover Handlers (Mục 1) - Không gán sẵn chữ mang tính khẳng định
  const handleOpenExternalHandoverModal = () => {
    if (!currentReq) return;
    setHandoverSignerName(currentReq.contactName || '');
    setHandoverDocumentBasis('');
    setHandoverNotesText('');
    setWorkshopPostFiringStatus('');
    setIsExternalHandoverModalOpen(true);
  };

  const handleConfirmExternalHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentReq) return;

    if (!handoverSignerName.trim()) {
      alert('Vui lòng nhập họ tên người ký nhận hoặc xác nhận bàn giao.');
      return;
    }

    if (!handoverDocumentBasis.trim()) {
      alert('Vui lòng nhập căn cứ chứng từ hoặc biên bản bàn giao bên ngoài.');
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const handover: HandoverRecord = {
      confirmedBy: handoverSignerName.trim(),
      confirmedAt: formattedDate,
      method: 'external_document',
      documentBasis: handoverDocumentBasis.trim(),
      notes: handoverNotesText.trim() || 'Đã ghi nhận bàn giao hoàn tất theo chứng từ',
      postFiringFollowupStatus: currentReq.serviceType === 'workshop' ? workshopPostFiringStatus.trim() : undefined
    };

    const res = confirmHandover(currentReq.id, handover);
    if (!res.success && res.message) {
      alert(res.message);
      return;
    }
    setIsExternalHandoverModalOpen(false);
  };

  // Grouped Chat Threads & reply handler
  const conversationThreads = getConversationThreads();
  const activeConversationId = selectedConversationId || (conversationThreads[0]?.conversationId || 'conv_default');
  const activeThread = conversationThreads.find(t => t.conversationId === activeConversationId);
  const activeConversationMessages = getMessagesForConversation(activeConversationId);

  const handleSendOwnerReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeConversationId) return;

    const targetReq = requests.find(r => r.id === activeThread?.relatedRequestId);

    sendMessage({
      conversationId: activeConversationId,
      customerId: activeThread?.customerId || (targetReq ? targetReq.contactEmail : 'guest'),
      customerName: activeThread?.customerName || (targetReq ? targetReq.contactName : 'Khách hàng'),
      senderRole: 'owner',
      senderName: 'Điều phối viên MADE IN VIETNAM LAB',
      content: replyText.trim(),
      relatedRequestId: activeThread?.relatedRequestId
    });
    setReplyText('');
  };

  const filteredRequests = requests.filter(r => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      
      {/* 1. Header Bảng Điều Phối */}
      <header className="bg-[#1d1d1f]/80 backdrop-blur-xl backdrop-saturate-150 text-white border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0071e3] text-white flex items-center justify-center font-semibold">
              <Inbox size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heritage text-lg sm:text-xl font-semibold tracking-tight text-white">
                  Bảng Điều Phối Nền Tảng (Owner Portal)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-amber-200 uppercase font-semibold">
                  Điều Phối Viên
                </span>
              </div>
              <p className="text-xs text-white/70">
                MADE IN VIETNAM LAB • Nền tảng điều phối Bát Tràng
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onBackToClientSite && (
              <button
                onClick={onBackToClientSite}
                className="px-3.5 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-xs font-medium text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Về trang khách hàng</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* KPI Metrics Summary (Khởi tạo = 0 theo Mục 5) */}
        <div data-drag-scroll className="flex overflow-x-auto no-scrollbar py-2 -my-2 lg:grid lg:grid-cols-4 gap-4 [&>*]:shrink-0 [&>*]:min-w-[15rem] lg:[&>*]:min-w-0">
          <div className="bg-white p-5 rounded-2xl border border-[#e8e8ed] shadow-xs">
            <span className="text-xs text-[#86868b] font-medium block mb-1">Chờ tiếp nhận</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-semibold font-mono text-amber-700">
                {requests.filter(r => r.status === 'cho_tiep_nhan').length}
              </span>
              <span className="text-xs text-[#86868b]">yêu cầu mới</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e8e8ed] shadow-xs">
            <span className="text-xs text-[#86868b] font-medium block mb-1">Cần Owner kiểm tra</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-semibold font-mono text-purple-700">
                {requests.filter(r => r.status === 'cho_owner_kiem_tra').length}
              </span>
              <span className="text-xs text-[#86868b]">xưởng đã phản hồi</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e8e8ed] shadow-xs">
            <span className="text-xs text-[#86868b] font-medium block mb-1">Cần kiểm tra QC / Bàn giao</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-semibold font-mono text-teal-700">
                {requests.filter(r => r.status === 'cho_owner_qc' || r.status === 'cho_khach_nghiem_thu').length}
              </span>
              <span className="text-xs text-[#86868b]">chờ nghiệm thu</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e8e8ed] shadow-xs">
            <span className="text-xs text-[#86868b] font-medium block mb-1">Đã hoàn tất</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-semibold font-mono text-[#1d1d1f]">
                {requests.filter(r => r.status === 'hoan_thanh').length}
              </span>
              <span className="text-xs text-[#86868b]">đơn thành công</span>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-3 border-b border-[#d2d2d7]/80 pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#1d1d1f] text-white font-semibold'
                : 'text-[#515154] hover:text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            <Inbox size={16} />
            <span>Danh sách yêu cầu điều phối ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'messages'
                ? 'bg-[#1d1d1f] text-white font-semibold'
                : 'text-[#515154] hover:text-[#1d1d1f] hover:bg-black/5'
            }`}
          >
            <MessageSquare size={16} />
            <span>Hộp thư tư vấn khách hàng ({messages.length})</span>
          </button>

          {currentReq && (
            <button
              onClick={() => setActiveTab('passport')}
              className={`px-4 py-2 font-medium text-sm rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
                activeTab === 'passport'
                  ? 'bg-[#0071e3] text-white font-semibold'
                  : 'text-[#515154] hover:text-[#0071e3] hover:bg-black/5'
              }`}
            >
              <FileCheck size={16} />
              <span>Hồ sơ sáng tạo ({currentReq.id})</span>
            </button>
          )}
        </div>

        {/* TAB 1: DANH SÁCH YÊU CẦU & BẢNG ĐIỀU PHỐI CHI TIẾT */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left list: 5 cols */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-4 border border-[#e8e8ed] shadow-xs space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider">
                    Bộ Lọc Trạng Thái
                  </span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs bg-[#f5f5f7] border border-[#e8e8ed] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
                  >
                    <option value="all">Tất cả ({requests.length})</option>
                    <option value="cho_tiep_nhan">Chờ tiếp nhận</option>
                    <option value="da_chuyen_xuong">Đã chuyển xưởng</option>
                    <option value="cho_owner_kiem_tra">Cần Owner kiểm tra</option>
                    <option value="cho_khach_duyet">Chờ khách duyệt</option>
                    <option value="dang_thuc_hien">Đang thực hiện</option>
                    <option value="cho_owner_qc">Chờ Owner QC</option>
                    <option value="cho_khach_nghiem_thu">Chờ bàn giao</option>
                    <option value="hoan_thanh">Đã hoàn thành</option>
                    <option value="xuong_tu_choi">Xưởng từ chối</option>
                  </select>
                </div>

                {filteredRequests.length === 0 ? (
                  <div className="py-12 px-4 text-center rounded-xl bg-[#f5f5f7] border border-dashed border-[#d2d2d7]">
                    <Inbox size={32} className="mx-auto text-[#86868b] mb-2 opacity-60" />
                    <p className="text-sm font-semibold text-[#515154]">
                      Không có yêu cầu nào trong danh sách
                    </p>
                    <p className="text-xs text-[#86868b] mt-1 max-w-xs mx-auto">
                      Yêu cầu mới sẽ xuất hiện ở đây ngay khi khách hàng gửi từ giao diện chính.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {filteredRequests.map((req) => {
                      const isSelected = req.id === selectedRequestId;
                      return (
                        <div
                          key={req.id}
                          onClick={() => setSelectedRequestId(req.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#1d1d1f] bg-[#1d1d1f]/5 ring-1 ring-[#1d1d1f]'
                              : 'border-[#e8e8ed] bg-white hover:border-[#1d1d1f]/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <span className="font-mono text-xs font-semibold text-[#0071e3]">
                              {req.id}
                            </span>
                            {getStatusBadge(req.status)}
                          </div>
                          <h4 className="text-sm font-semibold text-[#1d1d1f] line-clamp-1 mb-1">
                            {req.title}
                          </h4>
                          <div className="text-xs text-[#6e6e73] flex items-center justify-between">
                            <span>{req.contactName} {req.organization ? `• ${req.organization}` : ''}</span>
                            <span className="font-mono text-[11px] text-[#86868b]">{req.createdAt}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Inspector: 7 cols */}
            <div className="lg:col-span-7">
              {currentReq ? (
                <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-xs space-y-6">
                  
                  {/* Top Bar of Selected Request */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e8e8ed] gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-semibold text-[#0071e3]">{currentReq.id}</span>
                        <span className="text-xs text-[#86868b]">| Gửi lúc: {currentReq.createdAt}</span>
                      </div>
                      <h3 className="font-heritage text-xl sm:text-2xl font-semibold text-[#1d1d1f]">
                        {currentReq.title}
                      </h3>
                    </div>
                    <div>{getStatusBadge(currentReq.status)}</div>
                  </div>

                  {/* Customer Brief Details */}
                  <div className="p-4 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed] space-y-3 text-xs sm:text-sm">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider border-b border-[#e8e8ed] pb-2">
                      <span>Thông Tin Khách Hàng (Lần 1 Đã Xác Nhận)</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1d1d1f]/10 text-[#1d1d1f]">
                        {currentReq.serviceType === 'workshop' ? 'Dịch vụ Workshop' : 'Dịch vụ Quà Tặng'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[#86868b] block text-[11px]">Người liên hệ:</span>
                        <strong className="text-[#1d1d1f]">{currentReq.contactName}</strong>
                      </div>
                      <div>
                        <span className="text-[#86868b] block text-[11px]">Đơn vị / Tổ chức:</span>
                        <span className="text-[#424245]">{currentReq.organization || 'Khách hàng cá nhân'}</span>
                      </div>
                      <div>
                        <span className="text-[#86868b] block text-[11px]">Điện thoại:</span>
                        <span className="text-[#424245] font-mono">{currentReq.contactPhone}</span>
                      </div>
                      <div>
                        <span className="text-[#86868b] block text-[11px]">Email:</span>
                        <span className="text-[#424245] font-mono">{currentReq.contactEmail}</span>
                      </div>
                      <div>
                        <span className="text-[#86868b] block text-[11px]">Thời hạn mong muốn:</span>
                        <span className="text-[#424245] font-semibold">{currentReq.targetDate}</span>
                      </div>
                      <div>
                        <span className="text-[#86868b] block text-[11px]">Dự toán ngân sách:</span>
                        <span className="text-[#0071e3] font-semibold">{currentReq.budget}</span>
                      </div>
                    </div>

                    {/* Specific Details */}
                    {currentReq.serviceType === 'workshop' && currentReq.workshopDetails && (
                      <div className="pt-2 border-t border-[#e8e8ed]">
                        <span className="text-[#86868b] block text-[11px]">Quy mô workshop:</span>
                        <div className="flex justify-between mt-0.5">
                          <strong>{currentReq.workshopDetails.participantsCount} người tham gia</strong>
                          <span>Ngày tổ chức: {currentReq.workshopDetails.plannedDate}</span>
                        </div>
                        {currentReq.workshopDetails.specialRequests && (
                          <p className="mt-1 text-xs text-[#515154]">
                            <em>Ghi chú: {currentReq.workshopDetails.specialRequests}</em>
                          </p>
                        )}
                      </div>
                    )}

                    {currentReq.serviceType === 'gifts' && currentReq.giftsDetails && (
                      <div className="pt-2 border-t border-[#e8e8ed]">
                        <span className="text-[#86868b] block text-[11px]">Chi tiết quà tặng theo lô:</span>
                        <div className="flex justify-between mt-0.5">
                          <strong>{currentReq.giftsDetails.quantity} sản phẩm ({currentReq.giftsDetails.productType})</strong>
                          <span>Hạn giao: {currentReq.giftsDetails.deliveryDate}</span>
                        </div>
                        {currentReq.giftsDetails.personalizationNotes && (
                          <p className="mt-1 text-xs text-[#515154]">
                            <em>Cá nhân hóa: {currentReq.giftsDetails.personalizationNotes}</em>
                          </p>
                        )}
                      </div>
                    )}

                    {currentReq.rawBrief && (
                      <div className="pt-2 border-t border-[#e8e8ed] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[#86868b] block text-[11px] font-semibold">Mô tả gốc từ khách hàng (Ngôn ngữ tự nhiên):</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                            Khách đã xác nhận
                          </span>
                        </div>
                        <p className="text-[#1d1d1f] leading-relaxed text-xs  bg-white p-2.5 rounded-lg border border-[#e8e8ed]">
                          "{currentReq.rawBrief}"
                        </p>
                      </div>
                    )}

                    <div className="pt-2 border-t border-[#e8e8ed]">
                      <span className="text-[#86868b] block text-[11px] mb-1 font-semibold">Thông số hồ sơ đã chuẩn hóa (Rule-based):</span>
                      <p className="text-[#1d1d1f] leading-relaxed text-xs">
                        {currentReq.description}
                      </p>
                      {currentReq.structuredRequirement?.personalizationOrSpecialRequests && (
                        <p className="mt-1 text-xs text-[#515154]">
                          <em>Cá nhân hóa / Chủ đề:</em> {currentReq.structuredRequirement.personalizationOrSpecialRequests}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Alert: Xưởng từ chối */}
                  {currentReq.status === 'xuong_tu_choi' && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-xs sm:text-sm text-red-900 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-red-800">
                        <AlertCircle size={16} />
                        <span>Xưởng ({currentReq.assignedWorkshopName}) từ chối thực hiện yêu cầu</span>
                      </div>
                      <p>
                        <strong>Lý do từ chối:</strong> {currentReq.artisanResponse?.rejectionReason}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                          variant="terracotta"
                          size="sm"
                          icon={<Sparkles size={14} />}
                          onClick={handleOpenSmartMatching}
                          className="text-xs font-semibold shadow-xs"
                        >
                          Smart Matching xưởng thay thế
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleOpenDispatch}
                          className="text-xs font-semibold bg-white"
                        >
                          Tự chọn xưởng khác
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Section: Phản hồi từ xưởng */}
                  {currentReq.artisanResponse && currentReq.artisanResponse.decision === 'confirmed' && (
                    <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-purple-200">
                        <div className="flex items-center gap-2 font-semibold text-purple-900">
                          <Store size={16} />
                          <span>Phản Hồi Từ Xưởng: {currentReq.assignedWorkshopName}</span>
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-200 text-purple-900 font-semibold">
                          Đã gửi lúc {currentReq.artisanResponse.respondedAt}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[#6e6e73] block text-[11px]">Giá xưởng đề xuất:</span>
                          <strong className="text-purple-900">{currentReq.artisanResponse.proposedPrice}</strong>
                        </div>
                        <div>
                          <span className="text-[#6e6e73] block text-[11px]">Lịch xưởng đáp ứng:</span>
                          <strong className="text-purple-900">{currentReq.artisanResponse.proposedSchedule}</strong>
                        </div>
                      </div>

                      {currentReq.artisanResponse.technicalNotes && (
                        <div>
                          <span className="text-[#6e6e73] block text-[11px] mb-0.5">Lưu ý kỹ thuật & công suất xưởng:</span>
                          <p className="p-2.5 bg-white rounded-lg border border-purple-150 text-xs text-[#1d1d1f]">
                            {currentReq.artisanResponse.technicalNotes}
                          </p>
                        </div>
                      )}

                      {/* Prominent Action Button for Owner to formulate final client proposal */}
                      {currentReq.status === 'cho_owner_kiem_tra' && (
                        <div className="pt-2">
                          <Button
                            variant="forest"
                            size="md"
                            icon={<FileCheck size={16} />}
                            onClick={handleOpenProposalModal}
                            className="w-full justify-center text-xs sm:text-sm font-semibold rounded-xl shadow-xs"
                          >
                            Kiểm tra phương án & Bóc tách chi phí gửi khách duyệt
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section: Phương án Owner đã gửi cho khách duyệt */}
                  {currentReq.ownerProposal && (
                    <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                        <div className="flex items-center gap-2 font-semibold text-emerald-900">
                          <ShieldCheck size={16} />
                          <span>Phương Án & Báo Giá Đã Chuyển Cho Khách</span>
                        </div>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 font-semibold">
                          Phiên bản: {currentReq.ownerProposal.designOrProgramVersion}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <span className="text-[#6e6e73] block text-[11px]">Giá xưởng:</span>
                          <strong className="text-[#1d1d1f]">{currentReq.ownerProposal.workshopPrice}</strong>
                        </div>
                        <div>
                          <span className="text-[#6e6e73] block text-[11px]">Phí điều phối Lab:</span>
                          <strong className="text-[#0071e3]">{currentReq.ownerProposal.coordinationFee}</strong>
                        </div>
                        <div>
                          <span className="text-[#6e6e73] block text-[11px]">Tổng giá gửi khách:</span>
                          <strong className="text-emerald-900 font-semibold">{currentReq.ownerProposal.clientTotalPrice}</strong>
                        </div>
                      </div>

                      <div className="text-xs text-[#515154] pt-1">
                        <span className="font-semibold text-[#1d1d1f]">Cam kết & Điều kiện: </span>
                        {currentReq.ownerProposal.termsAndConditions}
                      </div>

                      {currentReq.clientApproval && (
                        <div className="pt-2 border-t border-emerald-200/60 text-xs text-emerald-950 flex items-center justify-between">
                          <span>
                            Khách hàng ({currentReq.clientApproval.approvedBy}) đã duyệt lúc {currentReq.clientApproval.approvedAt}
                          </span>
                          <span className="font-mono text-emerald-800 font-semibold">
                            Mẫu: {currentReq.clientApproval.approvedDesignVersion}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section: Xưởng báo cáo hoàn thành -> Chờ Owner kiểm tra QC (Mục 3) */}
                  {currentReq.status === 'cho_owner_qc' && (
                    <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-teal-200">
                        <div className="flex items-center gap-2 font-semibold text-teal-900">
                          <Award size={16} />
                          <span>Xưởng Báo Cáo Hoàn Tất Thực Hiện • Cần Owner Kiểm Tra QC</span>
                        </div>
                        <span className="text-[11px] font-mono text-teal-800">
                          {currentReq.artisanExecutionReport?.reportedAt}
                        </span>
                      </div>

                      <p className="text-xs text-[#1d1d1f]">
                        <strong>Ghi chú từ xưởng:</strong> {currentReq.artisanExecutionReport?.reportNotes}
                      </p>

                      <Button
                        variant="forest"
                        size="md"
                        icon={<Award size={16} />}
                        onClick={handleOpenQcModal}
                        className="w-full justify-center text-xs sm:text-sm font-semibold rounded-xl"
                      >
                        Tiến hành kiểm tra chất lượng (QC)
                      </Button>
                    </div>
                  )}

                  {/* Section: QC Đạt chuẩn -> Chờ xác nhận bàn giao (Mục 1) */}
                  {currentReq.status === 'cho_khach_nghiem_thu' && (
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                        <div className="flex items-center gap-2 font-semibold text-emerald-900">
                          <CheckCircle2 size={16} />
                          <span>Kiểm Định QC Đạt Chuẩn • Chờ Xác Nhận Bàn Giao</span>
                        </div>
                        <span className="text-xs text-emerald-800 font-medium">
                          Kiểm tra bởi: {currentReq.qcRecord?.inspectorName} ({currentReq.qcRecord?.inspectedAt})
                        </span>
                      </div>

                      <p className="text-xs text-[#515154]">
                        <strong>Căn cứ QC:</strong> {currentReq.qcRecord?.notes}
                      </p>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-emerald-150">
                        <span className="text-xs text-[#424245]">
                          Khách hàng có thể xác nhận trực tuyến trong Customer Portal, hoặc Owner ghi nhận theo chứng từ bên ngoài:
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<FileText size={15} />}
                          onClick={handleOpenExternalHandoverModal}
                          className="text-xs font-semibold shrink-0"
                        >
                          Ghi nhận theo chứng từ bên ngoài
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Section: QC Chưa đạt */}
                  {currentReq.status === 'can_xu_ly_qc' && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-xs sm:text-sm text-red-900 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-red-800">
                        <AlertCircle size={16} />
                        <span>Kết quả QC: Cần xưởng xử lý bổ sung (Chưa được bàn giao)</span>
                      </div>
                      <p>
                        <strong>Lý do chưa đạt:</strong> {currentReq.qcRecord?.notes}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenQcModal}
                        className="text-xs"
                      >
                        Kiểm tra lại chất lượng (QC Re-check)
                      </Button>
                    </div>
                  )}

                  {/* Section: Hoàn tất */}
                  {currentReq.status === 'hoan_thanh' && (
                    <div className="p-4 bg-[#1d1d1f]/10 rounded-xl border border-[#1d1d1f]/20 text-xs sm:text-sm text-[#1d1d1f] space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-[#1d1d1f]">
                        <CheckCircle2 size={16} />
                        <span>Đơn hàng đã nghiệm thu và hoàn tất bàn giao thành công</span>
                      </div>
                      <div className="text-xs text-[#515154] space-y-1">
                        <p>QC kiểm định: <strong>Đạt chuẩn</strong> ({currentReq.qcRecord?.inspectorName} — {currentReq.qcRecord?.inspectedAt})</p>
                        <p>Người xác nhận nhận bàn giao: <strong>{currentReq.handoverRecord?.confirmedBy}</strong> ({currentReq.handoverRecord?.confirmedAt})</p>
                        <p>Căn cứ: <em>{currentReq.handoverRecord?.documentBasis || 'Khách hàng xác nhận trực tuyến'}</em></p>
                        {currentReq.handoverRecord?.postFiringFollowupStatus && (
                          <p>Tình trạng thành phẩm sau nung: <em>{currentReq.handoverRecord.postFiringFollowupStatus}</em></p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Bar for Statuses */}
                  {(currentReq.status === 'cho_tiep_nhan' || currentReq.status === 'dang_tu_van') && (
                    <div className="pt-4 border-t border-[#e8e8ed] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <Button
                          variant="terracotta"
                          size="md"
                          icon={<Sparkles size={16} />}
                          onClick={handleOpenSmartMatching}
                          className="text-xs sm:text-sm font-semibold rounded-xl shadow-xs"
                        >
                          Gợi ý xưởng phù hợp (Smart Matching)
                        </Button>
                        <Button
                          variant="outline"
                          size="md"
                          icon={<Store size={16} />}
                          onClick={handleOpenDispatch}
                          className="text-xs sm:text-sm font-semibold rounded-xl bg-white"
                        >
                          Chọn xưởng thủ công
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="md"
                        icon={<MessageSquare size={16} />}
                        onClick={() => setActiveTab('messages')}
                        className="text-xs"
                      >
                        Nhắn tin tư vấn khách
                      </Button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 border border-[#e8e8ed] text-center shadow-xs">
                  <Inbox size={40} className="mx-auto text-[#86868b] mb-3 opacity-60" />
                  <h4 className="font-heritage text-lg font-semibold text-[#1d1d1f] mb-1">
                    Chọn một yêu cầu để xem chi tiết & điều phối
                  </h4>
                  <p className="text-xs sm:text-sm text-[#6e6e73] max-w-sm mx-auto">
                    Bạn có thể chọn xưởng thủ công phù hợp, bóc tách phương án chi phí và kiểm soát chất lượng mẻ hàng.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: HỘP THƯ TƯ VẤN KHÁCH HÀNG (PHÂN LẬP THEO CUỘC TRÒ CHUYỆN) */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-2xl p-6 border border-[#e8e8ed] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#e8e8ed]">
              <div>
                <h3 className="font-heritage text-xl font-semibold text-[#1d1d1f]">
                  Hộp Thư Tư Vấn Khách Hàng (Đa Luồng Cách Ly)
                </h3>
                <p className="text-xs text-[#6e6e73]">
                  Tin nhắn được phân lập riêng biệt theo từng khách hàng và mã yêu cầu
                </p>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded bg-[#1d1d1f]/10 text-[#1d1d1f] font-semibold">
                {conversationThreads.length} cuộc hội thoại
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[460px]">
              {/* Left Column: Conversation Threads */}
              <div className="lg:col-span-4 border border-[#e8e8ed] rounded-xl overflow-hidden flex flex-col bg-[#f5f5f7]">
                <div className="p-3 bg-[#1d1d1f] text-white text-xs font-semibold uppercase tracking-wider flex items-center justify-between">
                  <span>Khách hàng & Đơn</span>
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{conversationThreads.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto divide-y divide-[#e8e8ed]">
                  {conversationThreads.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#86868b]">
                      Chưa có hội thoại nào được khởi tạo.
                    </div>
                  ) : (
                    conversationThreads.map((thread) => {
                      const isSelected = thread.conversationId === activeConversationId;
                      return (
                        <button
                          key={thread.conversationId}
                          type="button"
                          onClick={() => setSelectedConversationId(thread.conversationId)}
                          className={`w-full p-3 text-left transition-colors cursor-pointer block ${
                            isSelected
                              ? 'bg-white border-l-4 border-l-[#0071e3] shadow-xs'
                              : 'hover:bg-white/70'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <strong className="text-xs font-semibold text-[#1d1d1f] truncate">
                              {thread.customerName}
                            </strong>
                            <span className="text-[10px] text-[#86868b] shrink-0 font-mono">
                              {thread.lastMessageAt}
                            </span>
                          </div>
                          {thread.customerOrg && (
                            <p className="text-[11px] text-[#515154] truncate mb-1">
                              {thread.customerOrg}
                            </p>
                          )}
                          <div className="flex items-center justify-between gap-2 text-[11px] text-[#6e6e73]">
                            <span className="truncate ">
                              "{thread.lastMessageText}"
                            </span>
                            {thread.relatedRequestId && (
                              <span className="text-[9px] px-1.5 py-0.5 bg-[#e8e8ed] rounded text-[#424245] font-mono shrink-0">
                                {thread.relatedRequestId}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Active Conversation Stream */}
              <div className="lg:col-span-8 flex flex-col border border-[#e8e8ed] rounded-xl overflow-hidden bg-white">
                {/* Active Thread Header */}
                <div className="p-3.5 bg-[#f5f5f7] border-b border-[#e8e8ed] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#1d1d1f] text-white flex items-center justify-center text-xs font-semibold">
                      {activeThread?.customerName?.charAt(0) || 'K'}
                    </div>
                    <div>
                      <strong className="text-xs sm:text-sm font-semibold text-[#1d1d1f] block leading-tight">
                        {activeThread?.customerName || 'Khách hàng'}
                      </strong>
                      <span className="text-[11px] text-[#6e6e73]">
                        {activeThread?.customerOrg ? `${activeThread.customerOrg} • ` : ''}
                        Mã hội thoại: <code className="font-mono text-[#0071e3]">{activeConversationId}</code>
                      </span>
                    </div>
                  </div>
                  {activeThread?.relatedRequestId && (
                    <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20">
                      Đơn {activeThread.relatedRequestId}
                    </span>
                  )}
                </div>

                {/* Messages Body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#f5f5f7]/50 min-h-[300px] max-h-[420px]">
                  {activeConversationMessages.length === 0 ? (
                    <div className="py-16 text-center text-xs text-[#86868b] space-y-1">
                      <MessageSquare size={28} className="mx-auto mb-2 opacity-40 text-[#1d1d1f]" />
                      <strong>Chưa có tin nhắn trong luồng trao đổi này</strong>
                      <p className="text-[11px] text-[#6e6e73]">
                        Gửi tin nhắn đầu tiên để trao đổi tư vấn trực tiếp với khách hàng.
                      </p>
                    </div>
                  ) : (
                    activeConversationMessages.map((msg) => {
                      const isOwner = msg.senderRole === 'owner';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-2 mb-1 px-1">
                            <span className="text-[10px] font-semibold text-[#424245]">
                              {msg.senderName} ({isOwner ? 'Điều phối viên' : 'Khách hàng'})
                            </span>
                            <span className="text-[9px] text-[#86868b] font-mono">{msg.createdAt}</span>
                          </div>
                          <div
                            className={`max-w-[80%] p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                              isOwner
                                ? 'bg-[#1d1d1f] text-white rounded-tr-none'
                                : 'bg-white text-[#1d1d1f] border border-[#e8e8ed] rounded-tl-none shadow-xs'
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendOwnerReply} className="p-3 bg-white border-t border-[#e8e8ed] flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Nhập phản hồi tư vấn gửi tới ${activeThread?.customerName || 'khách hàng'}...`}
                    className="flex-1 px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
                  />
                  <Button
                    variant="forest"
                    size="sm"
                    type="submit"
                    icon={<Send size={14} />}
                    disabled={!replyText.trim()}
                    className="text-xs font-semibold rounded-xl shrink-0"
                  >
                    Gửi
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HỒ SƠ SÁNG TẠO (CREATIVE PASSPORT) CHO ĐƠN ĐANG CHỌN */}
        {activeTab === 'passport' && currentReq && (
          <div className="space-y-4">
            <CreativePassportCard passport={currentReq.creativePassport} request={currentReq} userRole="owner" />
          </div>
        )}

      </div>

      {/* MODAL 1: CHUYỂN YÊU CẦU SANG XƯỞNG */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title="Chuyển Yêu Cầu Cho Xưởng Bát Tràng"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmDispatch} className="space-y-4">
          <p className="text-xs text-[#6e6e73] leading-relaxed">
            Chọn xưởng thủ công phù hợp trong mạng lưới đối tác để thẩm định năng lực chế tác và đề xuất báo giá:
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1.5">
              Xưởng thủ công tiếp nhận
            </label>
            <select
              value={selectedWorkshopId}
              onChange={(e) => setSelectedWorkshopId(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
            >
              {workshops.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.artisanLeader} — {w.kilnType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1.5">
              Ghi chú điều phối gửi xưởng
            </label>
            <textarea
              rows={3}
              value={dispatchNote}
              onChange={(e) => setDispatchNote(e.target.value)}
              placeholder="Ví dụ: Xưởng kiểm tra dung tích lò cho lô 20 bộ ly men hỏa biến hoặc sắp xếp nghệ nhân hướng dẫn đoàn..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#d2d2d7] bg-white focus:outline-none focus:ring-1 focus:ring-[#1d1d1f]"
            />
          </div>

          <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsDispatchModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="forest" size="sm" type="submit">
              Xác nhận chuyển xưởng
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: BÓC TÁCH CHI PHÍ & GỬI PHƯƠNG ÁN CHO KHÁCH (MỤC V) */}
      <Modal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        title="Bóc Tách Chi Phí & Chuẩn Bị Phương Án Gửi Khách"
        maxWidth="lg"
      >
        <form onSubmit={handleConfirmSendProposal} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>Nguyên tắc đề án (Mục V):</strong> Owner không tự nhận tỷ lệ cố định. Hãy bóc tách rõ ràng giữa <em>Giá xưởng</em> và <em>Phí điều phối MADE IN VIETNAM LAB</em> trước khi chuyển cho khách phê duyệt.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
                Giá xưởng thực tế (1)
              </label>
              <input
                type="text"
                value={proposalWorkshopPrice}
                onChange={(e) => handleWorkshopPriceChange(e.target.value)}
                placeholder="Ví dụ: 6.000.000 VNĐ"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#d2d2d7] bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0071e3] uppercase mb-1">
                Phí điều phối Lab (2)
              </label>
              <input
                type="text"
                value={proposalCoordinationFee}
                onChange={(e) => handleCoordinationFeeChange(e.target.value)}
                placeholder="Ví dụ: 2.000.000 VNĐ"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#d2d2d7] bg-white font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-800 uppercase mb-1">
                Tổng giá gửi khách (1 + 2)
              </label>
              <input
                type="text"
                value={proposalClientTotal}
                onChange={(e) => setProposalClientTotal(e.target.value)}
                placeholder="Tự động tính = (1) + (2)"
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
                Mã phiên bản thiết kế / chương trình
              </label>
              <input
                type="text"
                value={proposalDesignVersion}
                onChange={(e) => setProposalDesignVersion(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#d2d2d7] bg-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
                Lịch trình bàn giao / tổ chức
              </label>
              <input
                type="text"
                value={proposalSchedule}
                onChange={(e) => setProposalSchedule(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-[#d2d2d7] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Điều kiện bảo hành & cam kết chất lượng
            </label>
            <textarea
              rows={2}
              value={proposalTerms}
              onChange={(e) => setProposalTerms(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#d2d2d7] bg-white"
            />
          </div>

          <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsProposalModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="forest" size="sm" type="submit">
              Gửi phương án cho khách duyệt
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: KIỂM SOÁT KẾT QUẢ QC (MỤC 3) */}
      <Modal
        isOpen={isQcModalOpen}
        onClose={() => setIsQcModalOpen(false)}
        title="Kiểm Tra Chất Lượng (QC Inspection)"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmSubmitQc} className="space-y-4">
          <p className="text-xs text-[#6e6e73] leading-relaxed">
            Kiểm tra chất lượng thành phẩm hoặc điều kiện tổ chức workshop theo đúng hồ sơ đã phê duyệt. Bắt buộc ghi nhận căn cứ và người xác nhận:
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1.5">
              Kết quả kiểm tra chất lượng
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                qcResult === 'dat' ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-semibold' : 'bg-white border-[#d2d2d7]'
              }`}>
                <input
                  type="radio"
                  name="qcResult"
                  value="dat"
                  checked={qcResult === 'dat'}
                  onChange={() => setQcResult('dat')}
                  className="accent-emerald-700"
                />
                <span className="text-xs">Đạt chuẩn (Đủ điều kiện bàn giao)</span>
              </label>

              <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                qcResult === 'can_xu_ly' ? 'bg-red-50 border-red-500 text-red-950 font-semibold' : 'bg-white border-[#d2d2d7]'
              }`}>
                <input
                  type="radio"
                  name="qcResult"
                  value="can_xu_ly"
                  checked={qcResult === 'can_xu_ly'}
                  onChange={() => setQcResult('can_xu_ly')}
                  className="accent-red-700"
                />
                <span className="text-xs">Chưa đạt (Cần xưởng xử lý lại)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Người xác nhận kiểm tra
            </label>
            <input
              type="text"
              required
              value={qcInspectorName}
              onChange={(e) => setQcInspectorName(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#d2d2d7] bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Ghi chú hoặc căn cứ kiểm tra (Bắt buộc)
            </label>
            <textarea
              rows={3}
              required
              value={qcNotes}
              onChange={(e) => setQcNotes(e.target.value)}
              placeholder="Ví dụ: Đã đối chiếu kích thước, độ sâu men gốm và hoa văn theo mẫu VER-v1..."
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#d2d2d7] bg-white"
            />
          </div>

          <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsQcModalOpen(false)}>
              Hủy
            </Button>
            <Button 
              variant={qcResult === 'dat' ? 'forest' : 'terracotta'} 
              size="sm" 
              type="submit"
            >
              {qcResult === 'dat' ? 'Xác nhận QC Đạt chuẩn' : 'Ghi nhận QC Chưa đạt'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: GHI NHẬN BÀN GIAO THEO CHỨNG TỪ BÊN NGOÀI (MỤC 1) */}
      <Modal
        isOpen={isExternalHandoverModalOpen}
        onClose={() => setIsExternalHandoverModalOpen(false)}
        title="Ghi Nhận Bàn Giao Theo Chứng Từ Bên Ngoài"
        maxWidth="md"
      >
        <form onSubmit={handleConfirmExternalHandover} className="space-y-4">
          <p className="text-xs text-[#6e6e73] leading-relaxed">
            Trường hợp khách hàng ký nhận bằng văn bản/biên bản ngoài hệ thống, Owner ghi rõ người xác nhận, thời điểm và căn cứ chứng từ:
          </p>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Người ký nhận / xác nhận bàn giao
            </label>
            <input
              type="text"
              required
              value={handoverSignerName}
              onChange={(e) => setHandoverSignerName(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#d2d2d7] bg-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Căn cứ chứng từ bàn giao
            </label>
            <input
              type="text"
              required
              value={handoverDocumentBasis}
              onChange={(e) => setHandoverDocumentBasis(e.target.value)}
              placeholder="Ví dụ: Biên bản giao nhận số BB-2601 có chữ ký thủ kho..."
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#d2d2d7] bg-white font-medium"
            />
          </div>

          {currentReq?.serviceType === 'workshop' && (
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
                Theo dõi thành phẩm sau workshop (nếu có thỏa thuận)
              </label>
              <input
                type="text"
                value={workshopPostFiringStatus}
                onChange={(e) => setWorkshopPostFiringStatus(e.target.value)}
                placeholder="Ví dụ: Đã hoàn tất buổi trải nghiệm, thành phẩm nung lưu kho sẽ giao sau theo thỏa thuận..."
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#d2d2d7] bg-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase mb-1">
              Ghi chú hoàn tất
            </label>
            <input
              type="text"
              value={handoverNotesText}
              onChange={(e) => setHandoverNotesText(e.target.value)}
              placeholder="Ví dụ: Đã kiểm tra đầy đủ số lượng và chất lượng theo biên bản giao nhận..."
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#d2d2d7] bg-white"
            />
          </div>

          <div className="pt-3 border-t border-[#e8e8ed] flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsExternalHandoverModalOpen(false)}>
              Hủy
            </Button>
            <Button variant="forest" size="sm" type="submit">
              Xác nhận hoàn tất đơn hàng
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: SMART MATCHING XƯỞNG BÁT TRÀNG (ĐỢT 2B.02) */}
      {currentReq && (
        <SmartMatchingModal
          isOpen={isSmartMatchingOpen}
          onClose={() => setIsSmartMatchingOpen(false)}
          request={currentReq}
          workshops={workshops}
          onSelectWorkshop={handleSelectWorkshopFromMatching}
          onOpenManualDispatch={handleOpenDispatch}
        />
      )}

    </div>
  );
};
