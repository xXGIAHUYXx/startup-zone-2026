import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { 
  UserRole, 
  OrderRequest, 
  ChatMessage, 
  WorkshopPartner, 
  OwnerProposal, 
  ArtisanExecutionReport, 
  QcRecord,
  HandoverRecord,
  ClientApproval,
  ConversationThread,
  CreativePassportVersion,
  CreativePassportRecord
} from '../types';
import { BAT_TRANG_WORKSHOPS, PRELOADED_SCENARIO_ORDERS } from '../data/mockData';

export interface TransitionResult {
  success: boolean;
  message?: string;
}

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  requests: OrderRequest[];
  messages: ChatMessage[];
  workshops: WorkshopPartner[];
  
  // Transition-guarded Actions
  createRequest: (formData: any) => OrderRequest;
  dispatchToWorkshop: (requestId: string, workshopId: string, note: string) => TransitionResult;
  artisanRespond: (requestId: string, decision: 'confirmed' | 'rejected', details: any) => TransitionResult;
  ownerReviewAndSendProposal: (requestId: string, proposal: OwnerProposal) => TransitionResult;
  customerApprove: (requestId: string, approvalData: { approvedBy: string; confirmedSampleOrSpecs: string; notes?: string }) => TransitionResult;
  artisanReportExecution: (requestId: string, report: ArtisanExecutionReport) => TransitionResult;
  ownerSubmitQc: (requestId: string, qc: QcRecord) => TransitionResult;
  confirmHandover: (requestId: string, handover: HandoverRecord) => TransitionResult;

  // Đợt 2B.03: Quản lý phiên bản Creative Passport (V1 - V2 - V3)
  proposePassportVersion: (
    requestId: string,
    data: {
      proposedBy: string;
      changeSummary: string;
      newScale?: number;
      newDate?: string;
      newBudget?: string;
      newProductOrTopic?: string;
      newSpecialRequests?: string;
    }
  ) => TransitionResult;
  reviewPassportVersion: (
    requestId: string,
    versionId: string,
    decision: 'approved' | 'rejected',
    reviewerName: string,
    reviewNotes?: string
  ) => TransitionResult;
  
  // Isolated Chat Actions
  sendMessage: (
    contentOrParams: string | {
      conversationId: string;
      customerId: string;
      customerName: string;
      senderRole: 'customer' | 'owner';
      senderName: string;
      content: string;
      relatedRequestId?: string;
    },
    senderRole?: 'customer' | 'owner',
    senderName?: string,
    relatedRequestId?: string,
    customerId?: string,
    customerName?: string,
    conversationId?: string
  ) => void;
  getConversationThreads: () => ConversationThread[];
  getMessagesForConversation: (conversationId: string) => ChatMessage[];

  // Utilities
  resetAllData: () => void;
  preloadScenario: (scenarioId: string) => void;
}

const STORAGE_KEY_REQUESTS = 'mivl_requests_v2a';
const STORAGE_KEY_MESSAGES = 'mivl_messages_v2a';
const STORAGE_KEY_ROLE = 'mivl_role_v2a';
const STORAGE_KEY_COUNTER = 'mivl_order_counter_v2a';

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper for atomic-like monotonic ID generation with uniqueness guarantee
const generateOrderIds = (existingRequests: OrderRequest[]): { id: string; internalId: string } => {
  let counter = 2600;
  try {
    const saved = localStorage.getItem(STORAGE_KEY_COUNTER);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 2600) {
        counter = parsed;
      }
    }
  } catch (e) {
    console.warn('Cannot read order counter from localStorage', e);
  }

  // Monotonic increment
  counter += 1;

  // Verify against existing in-memory orders to guarantee zero collision
  const existingIds = new Set(existingRequests.map(r => r.id));
  while (existingIds.has(`YC-${counter}`)) {
    counter += 1;
  }

  // Save back counter
  try {
    localStorage.setItem(STORAGE_KEY_COUNTER, counter.toString());
  } catch (e) {
    console.warn('Cannot write order counter to localStorage', e);
  }

  const internalId = `mivl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  return { id: `YC-${counter}`, internalId };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Role state
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLE);
      return (saved as UserRole) || 'guest';
    } catch (e) {
      return 'guest';
    }
  });

  const setCurrentRole = (role: UserRole) => {
    setCurrentRoleState(role);
    try {
      localStorage.setItem(STORAGE_KEY_ROLE, role);
    } catch (e) {
      console.warn('Cannot save role to localStorage', e);
    }
  };

  // 2. Requests state (Khởi tạo hoàn toàn RỖNG ban đầu)
  const [requests, setRequests] = useState<OrderRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Cannot read requests from localStorage', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.warn('Cannot save requests to localStorage', e);
    }
  }, [requests]);

  // 3. Messages state (Chat đa luồng cách ly)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESSAGES);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Cannot read messages from localStorage', e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.warn('Cannot save messages to localStorage', e);
    }
  }, [messages]);

  const workshops = BAT_TRANG_WORKSHOPS;

  // Lần 1: Khách tạo yêu cầu -> Tự động sinh Creative Passport ngay với Monotonic Counter & internalId
  const createRequest = (formData: any): OrderRequest => {
    const { id: newId, internalId } = generateOrderIds(requests);
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newReq: OrderRequest = {
      id: newId,
      internalId,
      isDemoScenario: false,
      serviceType: formData.serviceType,
      title: formData.title || (formData.serviceType === 'gifts' ? 'Đặt quà tặng gốm sứ Bát Tràng' : 'Tổ chức workshop trải nghiệm làm gốm'),
      rawBrief: formData.rawBrief || formData.description,
      structuredRequirement: formData.structuredRequirement,
      contactName: formData.contactName,
      organization: formData.organization || '',
      contactPhone: formData.contactPhone,
      contactEmail: formData.contactEmail,
      description: formData.description,
      budget: formData.budget || 'Trao đổi cụ thể khi tư vấn',
      targetDate: formData.targetDate,
      workshopDetails: formData.serviceType === 'workshop' ? {
        participantsCount: Number(formData.participantsCount) || 20,
        plannedDate: formData.plannedDate || formData.targetDate,
        specialRequests: formData.specialRequests || ''
      } : undefined,
      giftsDetails: formData.serviceType === 'gifts' ? {
        quantity: Number(formData.quantity) || 20,
        productType: formData.productType || 'Bộ ly sứ cao cấp',
        personalizationNotes: formData.personalizationNotes || '',
        deliveryDate: formData.deliveryDate || formData.targetDate
      } : undefined,
      createdAt: formattedDate,
      status: 'cho_tiep_nhan',
      currentStep: 1,

      // Hồ sơ sáng tạo khởi tạo tức thì (Đợt 2B.03: Kèm phiên bản V1)
      creativePassport: {
        passportId: `PASSPORT-${newId}`,
        orderId: newId,
        createdAt: formattedDate,
        serviceType: formData.serviceType,
        title: formData.title || (formData.serviceType === 'gifts' ? 'Quà tặng gốm thủ công' : 'Workshop trải nghiệm làm gốm'),
        rawBrief: formData.rawBrief || formData.description,
        structuredRequirement: formData.structuredRequirement,
        clientName: formData.contactName,
        clientOrg: formData.organization || '',
        requirementSummary: formData.description,
        targetDate: formData.targetDate,
        workshopName: 'Đang kết nối xưởng Bát Tràng phù hợp',
        approvedDesignVersion: 'Chưa có dữ liệu (Đang chờ phương án)',
        executionStatus: 'Yêu cầu đã được xác nhận (Lần 1), đang chuẩn bị tư vấn',
        qcStatus: 'chua_co_du_lieu',
        handoverStatus: 'Đang ở giai đoạn xác nhận nhu cầu',
        versions: [
          {
            versionId: 'V1',
            createdAt: formattedDate,
            proposedBy: 'Khách hàng',
            changeSummary: 'Khởi tạo thông số ban đầu từ Smart Brief (Mốc 1)',
            details: {
              scaleOrQuantity: formData.structuredRequirement?.scaleOrQuantity || (formData.serviceType === 'workshop' ? (Number(formData.participantsCount) || 15) : (Number(formData.quantity) || 20)),
              targetTimeline: formData.structuredRequirement?.targetTimeline || formData.targetDate,
              budgetEstimated: formData.structuredRequirement?.budgetEstimated || formData.budget,
              productOrTopic: formData.structuredRequirement?.productOrTopic || formData.title,
              specialRequests: formData.structuredRequirement?.personalizationOrSpecialRequests
            },
            status: 'approved',
            approvedBy: formData.contactName,
            approvedAt: formattedDate,
            reviewNotes: 'Bản thông số kỹ thuật gốc đã được khách hàng xác nhận gửi lên hệ thống'
          }
        ],
        activeVersionId: 'V1'
      }
    };

    setRequests(prev => [newReq, ...prev]);
    return newReq;
  };

  // Transition Guard 1: Owner điều phối yêu cầu sang xưởng Bát Tràng
  // Cho phép chuyển khi: status là 'cho_tiep_nhan', 'xuong_tu_choi', hoặc 'dang_tu_van'
  // Chặn tuyệt đối nếu đơn đã 'hoan_thanh' hoặc 'da_huy'
  const dispatchToWorkshop = (requestId: string, workshopId: string, note: string): TransitionResult => {
    const target = requests.find(r => r.id === requestId);
    if (!target) {
      return { success: false, message: `Không tìm thấy yêu cầu ${requestId}` };
    }

    if (target.status === 'hoan_thanh' || target.status === 'da_huy') {
      const msg = `Không thể điều phối yêu cầu đã kết thúc (${target.status === 'hoan_thanh' ? 'Đã hoàn thành' : 'Đã hủy'})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    const allowedStatuses: OrderRequest['status'][] = ['cho_tiep_nhan', 'dang_tu_van', 'xuong_tu_choi'];
    if (!allowedStatuses.includes(target.status)) {
      const msg = `Yêu cầu đang ở trạng thái "${target.status}", không được phép điều phối lại lúc này.`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    const ws = workshops.find(w => w.id === workshopId);
    if (!ws) {
      return { success: false, message: `Không tìm thấy xưởng có mã ${workshopId}` };
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          assignedWorkshopId: workshopId,
          assignedWorkshopName: ws.name,
          ownerDispatchNote: note,
          dispatchedAt: formattedDate,
          status: 'da_chuyen_xuong',
          artisanResponse: undefined,
          creativePassport: {
            ...req.creativePassport,
            workshopName: ws.name,
            artisanLeader: ws.artisanLeader,
            executionStatus: `Đã chuyển yêu cầu tới ${ws.name}, chờ thẩm định năng lực & báo giá`
          }
        };
      }
      return req;
    }));

    return { success: true };
  };

  // Transition Guard 2: Xưởng phản hồi (Đồng ý hoặc Từ chối có lý do)
  // Chỉ nhận phản hồi khi yêu cầu đã được phân công và ở trạng thái 'da_chuyen_xuong'
  const artisanRespond = (requestId: string, decision: 'confirmed' | 'rejected', details: any): TransitionResult => {
    const target = requests.find(r => r.id === requestId);
    if (!target) {
      return { success: false, message: `Không tìm thấy yêu cầu ${requestId}` };
    }

    if (target.status === 'hoan_thanh' || target.status === 'da_huy') {
      const msg = `Không thể phản hồi yêu cầu đã đóng (${target.status})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    if (target.status !== 'da_chuyen_xuong') {
      const msg = `Yêu cầu không ở trạng thái chờ xưởng thẩm định (Hiện tại: ${target.status})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        if (decision === 'confirmed') {
          return {
            ...req,
            status: 'cho_owner_kiem_tra',
            artisanResponse: {
              decision: 'confirmed',
              proposedPrice: details.proposedPrice,
              proposedSchedule: details.proposedSchedule,
              technicalNotes: details.technicalNotes,
              respondedAt: formattedDate
            },
            creativePassport: {
              ...req.creativePassport,
              executionStatus: 'Xưởng đã phản hồi khả năng đáp ứng, Owner đang thẩm định phương án'
            }
          };
        } else {
          return {
            ...req,
            status: 'xuong_tu_choi',
            artisanResponse: {
              decision: 'rejected',
              rejectionReason: details.rejectionReason || 'Xưởng hiện kín lò nung trong thời gian yêu cầu',
              respondedAt: formattedDate
            },
            creativePassport: {
              ...req.creativePassport,
              executionStatus: `Xưởng từ chối: ${details.rejectionReason || 'Kín lịch'}. Chờ Owner điều phối lại.`
            }
          };
        }
      }
      return req;
    }));

    return { success: true };
  };

  // Transition Guard 3: Owner kiểm tra, bóc tách giá xưởng vs phí Lab & gửi khách duyệt
  // Điều kiện: status phải là 'cho_owner_kiem_tra' và artisanResponse?.decision === 'confirmed'
  const ownerReviewAndSendProposal = (requestId: string, proposal: OwnerProposal): TransitionResult => {
    const target = requests.find(r => r.id === requestId);
    if (!target) {
      return { success: false, message: `Không tìm thấy yêu cầu ${requestId}` };
    }

    if (target.status === 'hoan_thanh' || target.status === 'da_huy') {
      const msg = `Không thể gửi báo giá cho yêu cầu đã đóng (${target.status})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    if (target.status !== 'cho_owner_kiem_tra') {
      const msg = `Yêu cầu chưa sẵn sàng gửi báo giá cho khách (Trạng thái hiện tại: ${target.status})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    if (target.artisanResponse?.decision !== 'confirmed') {
      const msg = 'Chưa có xác nhận đồng ý và đề xuất giá hợp lệ từ xưởng thủ công.';
      console.warn(msg);
      return { success: false, message: msg };
    }

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'cho_khach_duyet',
          ownerProposal: proposal,
          creativePassport: {
            ...req.creativePassport,
            approvedDesignVersion: `${proposal.designOrProgramVersion} (Chờ khách duyệt)`,
            approvedScope: proposal.termsAndConditions,
            executionStatus: 'Phương án & báo giá đã chuẩn bị hoàn tất, đang chờ khách hàng phê duyệt'
          }
        };
      }
      return req;
    }));

    return { success: true };
  };

  // Transition Guard 4: Khách hàng phê duyệt báo giá và mẫu/chương trình thiết kế
  // Điều kiện: status phải là 'cho_khach_duyet', có ownerProposal đầy đủ, và có approverName
  const customerApprove = (
    requestId: string, 
    approvalData: { approvedBy: string; confirmedSampleOrSpecs: string; notes?: string }
  ): TransitionResult => {
    const target = requests.find(r => r.id === requestId);
    if (!target) {
      return { success: false, message: `Không tìm thấy yêu cầu ${requestId}` };
    }

    if (target.status === 'hoan_thanh' || target.status === 'da_huy') {
      const msg = `Không thể phê duyệt yêu cầu đã đóng (${target.status})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    if (target.status !== 'cho_khach_duyet') {
      const msg = `Yêu cầu không ở trạng thái chờ khách duyệt (Trạng thái hiện tại: ${target.status})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    if (!target.ownerProposal) {
      const msg = 'Yêu cầu chưa có phương án và báo giá chi tiết từ điều phối viên.';
      console.warn(msg);
      return { success: false, message: msg };
    }

    if (!approvalData.approvedBy?.trim()) {
      return { success: false, message: 'Vui lòng cung cấp họ tên người phê duyệt phương án.' };
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const designVersion = req.ownerProposal?.designOrProgramVersion || `VER-${req.id}-v1`;
        const approval: ClientApproval = {
          approved: true,
          approvedAt: formattedDate,
          approvedBy: approvalData.approvedBy.trim(),
          approvedDesignVersion: designVersion,
          confirmedSampleOrSpecs: approvalData.confirmedSampleOrSpecs.trim() || 'Khách hàng xác nhận đúng mẫu thiết kế/thông số kỹ thuật',
          notes: approvalData.notes || 'Khách hàng đã xác nhận điều kiện, báo giá và mẫu thiết kế'
        };

        return {
          ...req,
          status: 'dang_thuc_hien',
          currentStep: 2,
          clientApproval: approval,
          creativePassport: {
            ...req.creativePassport,
            approvedDesignVersion: designVersion,
            approvedScope: approval.confirmedSampleOrSpecs,
            approvedDate: formattedDate,
            approverName: approval.approvedBy,
            executionStatus: req.serviceType === 'workshop' 
              ? 'Khách đã phê duyệt chương trình, xưởng đang chuẩn bị công tác tổ chức workshop' 
              : 'Khách đã phê duyệt mẫu thiết kế & báo giá, xưởng đang tiến hành tạo hình và chế tác'
          }
        };
      }
      return req;
    }));

    return { success: true };
  };

  // Transition Guard 5: Xưởng báo cáo hoàn thành buổi workshop hoặc mẻ nung
  // Điều kiện: status phải là 'dang_thuc_hien'
  const artisanReportExecution = (requestId: string, report: ArtisanExecutionReport): TransitionResult => {
    const target = requests.find(r => r.id === requestId);
    if (!target) {
      return { success: false, message: `Không tìm thấy yêu cầu ${requestId}` };
    }

    if (target.status === 'hoan_thanh' || target.status === 'da_huy') {
      const msg = `Không thể báo cáo thực hiện cho yêu cầu đã đóng (${target.status})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    if (target.status !== 'dang_thuc_hien') {
      const msg = `Yêu cầu không ở trạng thái đang thực hiện (Trạng thái hiện tại: ${target.status})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'cho_owner_qc',
          artisanExecutionReport: report,
          creativePassport: {
            ...req.creativePassport,
            executionStatus: req.serviceType === 'workshop'
              ? 'Buổi workshop đã được tổ chức xong, chờ Owner kiểm tra chất lượng (QC)'
              : 'Mẻ gốm đã hoàn thành chế tác, chờ Owner kiểm tra chất lượng (QC)',
            qcStatus: 'dang_kiem_tra'
          }
        };
      }
      return req;
    }));

    return { success: true };
  };

  // Transition Guard 6: Owner kiểm tra chất lượng (QC) và ghi nhận kết quả Đạt / Cần xử lý
  // Điều kiện: status phải là 'cho_owner_qc' hoặc 'can_xu_ly_qc', và phải có artisanExecutionReport
  const ownerSubmitQc = (requestId: string, qc: QcRecord): TransitionResult => {
    const target = requests.find(r => r.id === requestId);
    if (!target) {
      return { success: false, message: `Không tìm thấy yêu cầu ${requestId}` };
    }

    if (target.status === 'hoan_thanh' || target.status === 'da_huy') {
      const msg = `Không thể thực hiện QC cho đơn đã đóng (${target.status})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    if (target.status !== 'cho_owner_qc' && target.status !== 'can_xu_ly_qc') {
      const msg = `Yêu cầu chưa có báo cáo hoàn thành từ xưởng để thực hiện QC (Trạng thái: ${target.status})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    if (!target.artisanExecutionReport) {
      const msg = 'Chưa có báo cáo thực hiện công việc từ xưởng đối tác.';
      console.warn(msg);
      return { success: false, message: msg };
    }

    const isPassed = qc.result === 'dat';

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: isPassed ? 'cho_khach_nghiem_thu' : 'can_xu_ly_qc',
          qcRecord: qc,
          creativePassport: {
            ...req.creativePassport,
            qcStatus: isPassed ? 'dat_chuan' : 'can_xu_ly',
            qcCheckedBy: qc.inspectorName,
            qcCheckedAt: qc.inspectedAt,
            qcNotes: qc.notes,
            executionStatus: isPassed
              ? 'QC kiểm tra đạt chuẩn. Chờ khách xác nhận nhận hàng hoặc hoàn tất dịch vụ.'
              : `QC chưa đạt yêu cầu (${qc.notes || 'Cần xử lý bổ sung'}). Xưởng cần hoàn thiện thêm.`
          }
        };
      }
      return req;
    }));

    return { success: true };
  };

  // Transition Guard 7: Khách xác nhận nhận hàng / hoàn tất dịch vụ (hoặc chứng từ bên ngoài)
  // ĐIỀU KIỆN TIÊN QUYẾT: qcRecord?.result BẮT BUỘC PHẢI LÀ 'dat'
  // Status phải là 'cho_khach_nghiem_thu'
  const confirmHandover = (requestId: string, handover: HandoverRecord): TransitionResult => {
    const target = requests.find(r => r.id === requestId);
    if (!target) {
      return { success: false, message: `Không tìm thấy yêu cầu ${requestId}` };
    }

    if (target.status === 'hoan_thanh' || target.status === 'da_huy') {
      const msg = `Yêu cầu đã kết thúc (${target.status})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    if (target.status !== 'cho_khach_nghiem_thu') {
      const msg = `Yêu cầu chưa sẵn sàng bàn giao (Trạng thái hiện tại: ${target.status})`;
      console.warn(msg);
      return { success: false, message: msg };
    }

    // NGHIÊM NGẶT: Kiểm tra kết quả QC phải là 'dat'
    if (target.qcRecord?.result !== 'dat') {
      const msg = 'LỖI NGHIỆP VỤ: Không thể bàn giao và hoàn tất đơn khi chưa có kết quả QC "Đạt chuẩn".';
      console.error(msg);
      return { success: false, message: msg };
    }

    if (!handover.confirmedBy?.trim()) {
      return { success: false, message: 'Vui lòng cung cấp họ tên người xác nhận bàn giao.' };
    }

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          status: 'hoan_thanh',
          currentStep: 3,
          handoverRecord: handover,
          creativePassport: {
            ...req.creativePassport,
            handoverConfirmedBy: handover.confirmedBy,
            handoverBasis: handover.documentBasis || 'Khách hàng xác nhận trực tuyến',
            handoverStatus: handover.notes || 'Đã bàn giao đầy đủ',
            completedDate: handover.confirmedAt,
            executionStatus: 'Đã hoàn tất toàn bộ chu trình Một hồ sơ — Ba lần xác nhận'
          }
        };
      }
      return req;
    }));

    return { success: true };
  };

  // Đợt 2B.03: Quản lý phiên bản Creative Passport (V1 - V2 - V3)
  // Cho phép đề xuất phiên bản thay đổi (Lưu lịch sử, không ghi đè, đánh dấu chờ duyệt)
  const proposePassportVersion: AppContextType['proposePassportVersion'] = (
    requestId,
    data
  ) => {
    const target = requests.find(r => r.id === requestId);
    if (!target) {
      return { success: false, message: `Không tìm thấy yêu cầu ${requestId}` };
    }

    if (target.status === 'hoan_thanh' || target.status === 'da_huy') {
      const msg = `Không thể điều chỉnh đơn đã kết thúc (${target.status === 'hoan_thanh' ? 'Đã hoàn thành' : 'Đã hủy'})`;
      return { success: false, message: msg };
    }

    const currentVersions = target.creativePassport.versions || [];
    const nextVerIndex = currentVersions.length + 1;
    const nextVerId = `V${nextVerIndex}`;

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newVersion: CreativePassportVersion = {
      versionId: nextVerId,
      createdAt: formattedDate,
      proposedBy: data.proposedBy || 'Khách hàng',
      changeSummary: data.changeSummary || `Đề xuất điều chỉnh thông số cho phiên bản ${nextVerId}`,
      details: {
        scaleOrQuantity: data.newScale,
        targetTimeline: data.newDate,
        budgetEstimated: data.newBudget,
        productOrTopic: data.newProductOrTopic,
        specialRequests: data.newSpecialRequests
      },
      status: 'pending_review',
      reviewNotes: 'Bản thay đổi được ghi nhận trong lịch sử, đang chờ các bên phê duyệt trước khi áp dụng'
    };

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return {
          ...req,
          creativePassport: {
            ...req.creativePassport,
            versions: [...(req.creativePassport.versions || []), newVersion]
          }
        };
      }
      return req;
    }));

    return { success: true, message: `Đã khởi tạo đề xuất phiên bản ${nextVerId} (Chờ xem xét)` };
  };

  // Phê duyệt hoặc từ chối phiên bản thay đổi (Khi duyệt, phiên bản cũ chuyển sang superseded)
  const reviewPassportVersion: AppContextType['reviewPassportVersion'] = (
    requestId,
    versionId,
    decision,
    reviewerName,
    reviewNotes
  ) => {
    const target = requests.find(r => r.id === requestId);
    if (!target) {
      return { success: false, message: `Không tìm thấy yêu cầu ${requestId}` };
    }

    const versions = target.creativePassport.versions || [];
    const targetVer = versions.find(v => v.versionId === versionId);
    if (!targetVer) {
      return { success: false, message: `Không tìm thấy phiên bản ${versionId}` };
    }

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const updatedVersions = (req.creativePassport.versions || []).map(v => {
          if (decision === 'approved') {
            if (v.versionId === versionId) {
              return {
                ...v,
                status: 'approved' as const,
                approvedBy: reviewerName,
                approvedAt: formattedDate,
                reviewNotes: reviewNotes || 'Đã được các bên phê duyệt chính thức'
              };
            }
            if (v.status === 'approved') {
              return {
                ...v,
                status: 'superseded' as const
              };
            }
          } else if (v.versionId === versionId) {
            return {
              ...v,
              status: 'draft' as const,
              reviewNotes: reviewNotes || 'Phiên bản không được phê duyệt'
            };
          }
          return v;
        });

        // Khi duyệt: Cập nhật các thông số đang thực hiện theo đúng phiên bản mới
        if (decision === 'approved') {
          const newScale = targetVer.details.scaleOrQuantity;
          const newDate = targetVer.details.targetTimeline;
          const newBudget = targetVer.details.budgetEstimated;
          const newRequests = targetVer.details.specialRequests;

          return {
            ...req,
            budget: newBudget || req.budget,
            targetDate: newDate || req.targetDate,
            workshopDetails: req.workshopDetails ? {
              ...req.workshopDetails,
              participantsCount: newScale ?? req.workshopDetails.participantsCount,
              plannedDate: newDate ?? req.workshopDetails.plannedDate,
              specialRequests: newRequests ?? req.workshopDetails.specialRequests
            } : undefined,
            giftsDetails: req.giftsDetails ? {
              ...req.giftsDetails,
              quantity: newScale ?? req.giftsDetails.quantity,
              deliveryDate: newDate ?? req.giftsDetails.deliveryDate,
              personalizationNotes: newRequests ?? req.giftsDetails.personalizationNotes
            } : undefined,
            structuredRequirement: req.structuredRequirement ? {
              ...req.structuredRequirement,
              scaleOrQuantity: newScale ?? req.structuredRequirement.scaleOrQuantity,
              targetTimeline: newDate ?? req.structuredRequirement.targetTimeline,
              budgetEstimated: newBudget ?? req.structuredRequirement.budgetEstimated,
              personalizationOrSpecialRequests: newRequests ?? req.structuredRequirement.personalizationOrSpecialRequests
            } : undefined,
            creativePassport: {
              ...req.creativePassport,
              versions: updatedVersions,
              activeVersionId: versionId,
              requirementSummary: `${req.serviceType === 'workshop' ? 'Workshop' : 'Quà tặng'} (Phiên bản ${versionId} đã duyệt)`
            }
          };
        }

        return {
          ...req,
          creativePassport: {
            ...req.creativePassport,
            versions: updatedVersions
          }
        };
      }
      return req;
    }));

    return { success: true };
  };

  // Gửi tin nhắn tư vấn 2 chiều với phân lập cuộc trò chuyện (Chat Isolation)
  const sendMessage: AppContextType['sendMessage'] = (
    contentOrParams,
    senderRole,
    senderName,
    relatedRequestId,
    customerId,
    customerName,
    conversationId
  ) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    let resolvedContent = '';
    let resolvedRole: 'customer' | 'owner' = 'customer';
    let resolvedName = 'Khách hàng';
    let resolvedReqId: string | undefined = undefined;
    let resolvedCustId = 'guest';
    let resolvedCustName = 'Khách trải nghiệm';
    let resolvedConvId = 'conv_default';

    if (typeof contentOrParams === 'object') {
      resolvedContent = contentOrParams.content;
      resolvedRole = contentOrParams.senderRole;
      resolvedName = contentOrParams.senderName;
      resolvedReqId = contentOrParams.relatedRequestId;
      resolvedCustId = contentOrParams.customerId;
      resolvedCustName = contentOrParams.customerName;
      resolvedConvId = contentOrParams.conversationId;
    } else {
      resolvedContent = contentOrParams;
      resolvedRole = senderRole || 'customer';
      resolvedName = senderName || 'Khách hàng';
      resolvedReqId = relatedRequestId;
      resolvedCustId = customerId || (relatedRequestId ? `client_${relatedRequestId}` : 'guest');
      resolvedCustName = customerName || (relatedRequestId ? `Khách hàng (${relatedRequestId})` : 'Khách trải nghiệm');
      resolvedConvId = conversationId || (relatedRequestId ? `conv_${relatedRequestId}` : 'conv_default');
    }

    if (!resolvedContent.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId: resolvedConvId,
      senderRole: resolvedRole,
      senderName: resolvedName,
      customerId: resolvedCustId,
      customerName: resolvedCustName,
      content: resolvedContent.trim(),
      createdAt: timeStr,
      relatedRequestId: resolvedReqId
    };

    setMessages(prev => [...prev, newMsg]);
  };

  // Helper: Lấy danh sách cuộc hội thoại nhóm theo conversationId (cho Owner Dashboard)
  const getConversationThreads = (): ConversationThread[] => {
    const threadMap = new Map<string, ConversationThread>();

    // Duyệt qua tất cả tin nhắn để tổng hợp hội thoại
    for (const msg of messages) {
      const convId = msg.conversationId || 'conv_default';
      const existing = threadMap.get(convId);

      // Tìm thông tin khách hàng từ request nếu có
      const matchedReq = requests.find(r => r.id === msg.relatedRequestId);

      if (!existing) {
        threadMap.set(convId, {
          conversationId: convId,
          customerId: msg.customerId,
          customerName: matchedReq?.contactName || msg.customerName || 'Khách hàng',
          customerOrg: matchedReq?.organization,
          relatedRequestId: msg.relatedRequestId,
          lastMessageText: msg.content,
          lastMessageAt: msg.createdAt,
          messagesCount: 1
        });
      } else {
        existing.messagesCount += 1;
        existing.lastMessageText = msg.content;
        existing.lastMessageAt = msg.createdAt;
        if (matchedReq?.contactName) existing.customerName = matchedReq.contactName;
        if (matchedReq?.organization) existing.customerOrg = matchedReq.organization;
        if (msg.relatedRequestId) existing.relatedRequestId = msg.relatedRequestId;
      }
    }

    // Đưa cả các yêu cầu mới có trạng thái đang tư vấn/chờ tiếp nhận vào danh sách hội thoại nếu chưa có tin nhắn
    for (const req of requests) {
      const convId = `conv_${req.id}`;
      if (!threadMap.has(convId)) {
        threadMap.set(convId, {
          conversationId: convId,
          customerId: req.contactEmail || req.contactPhone || req.id,
          customerName: req.contactName,
          customerOrg: req.organization,
          relatedRequestId: req.id,
          lastMessageText: 'Yêu cầu mới khởi tạo, sẵn sàng tư vấn',
          lastMessageAt: req.createdAt.split(' ')[1] || 'Hôm nay',
          messagesCount: 0
        });
      }
    }

    return Array.from(threadMap.values());
  };

  // Helper: Lọc tin nhắn của riêng một cuộc trò chuyện
  const getMessagesForConversation = (conversationId: string): ChatMessage[] => {
    return messages.filter(m => m.conversationId === conversationId);
  };

  // Reset dữ liệu về trạng thái ban đầu rỗng sạch
  const resetAllData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_REQUESTS);
      localStorage.removeItem(STORAGE_KEY_MESSAGES);
      localStorage.removeItem(STORAGE_KEY_COUNTER);
    } catch (e) {
      console.warn('Cannot clear localStorage', e);
    }
    setRequests([]);
    setMessages([]);
    setCurrentRole('guest');
  };

  // Nạp kịch bản mẫu (Gắn cờ isDemoScenario: true rõ ràng)
  const preloadScenario = (scenarioId: string) => {
    if (scenarioId === 'scen-an-nam') {
      const order = { ...PRELOADED_SCENARIO_ORDERS[0], isDemoScenario: true };
      setRequests(prev => {
        const filtered = prev.filter(r => r.id !== order.id);
        return [order, ...filtered];
      });
      setCurrentRole('customer');
    } else if (scenarioId === 'scen-sao-mai') {
      const order = { ...PRELOADED_SCENARIO_ORDERS[1], isDemoScenario: true };
      setRequests(prev => {
        const filtered = prev.filter(r => r.id !== order.id);
        return [order, ...filtered];
      });
      setCurrentRole('owner');
    } else if (scenarioId === 'scen-artisan') {
      const order = { ...PRELOADED_SCENARIO_ORDERS[0], isDemoScenario: true };
      setRequests(prev => {
        const filtered = prev.filter(r => r.id !== order.id);
        return [order, ...filtered];
      });
      setCurrentRole('artisan');
    }
  };

  return (
    <AppContext.Provider value={{
      currentRole,
      setCurrentRole,
      requests,
      messages,
      workshops,
      createRequest,
      dispatchToWorkshop,
      artisanRespond,
      ownerReviewAndSendProposal,
      customerApprove,
      artisanReportExecution,
      ownerSubmitQc,
      confirmHandover,
      proposePassportVersion,
      reviewPassportVersion,
      sendMessage,
      getConversationThreads,
      getMessagesForConversation,
      resetAllData,
      preloadScenario
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
