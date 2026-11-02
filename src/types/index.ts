export type UserRole = 'guest' | 'customer' | 'owner' | 'artisan';

export type ServiceType = 'workshop' | 'gifts';

export type ConfirmationStep = 1 | 2 | 3;

export type OrderRequestStatus = 
  | 'cho_tiep_nhan'         // Lần 1: Khách vừa gửi yêu cầu, Owner chuẩn bị tiếp nhận & tư vấn
  | 'dang_tu_van'          // Owner đang trao đổi với khách để làm rõ brief
  | 'da_chuyen_xuong'        // Owner đã chuyển yêu cầu sang xưởng Bát Tràng
  | 'cho_owner_kiem_tra'     // Xưởng đã phản hồi giá & điều kiện, Owner đang thẩm định phương án
  | 'cho_khach_duyet'       // Owner đã bóc tách chi phí & gửi phương án hoàn chỉnh cho khách duyệt
  | 'dang_thuc_hien'        // Khách đã duyệt (Lần 2 xong). Xưởng đang tổ chức workshop / chế tác quà tặng
  | 'cho_owner_qc'          // Xưởng báo xong công việc -> Chờ Owner kiểm tra chất lượng (QC)
  | 'cho_khach_nghiem_thu'  // Owner QC đạt chuẩn -> Chờ xác nhận nhận hàng hoặc hoàn tất dịch vụ
  | 'hoan_thanh'            // Lần 3 xong: Đã nghiệm thu QC & khách xác nhận nhận hàng/dịch vụ hoàn tất
  // Trạng thái ngoại lệ
  | 'can_xu_ly_qc'          // QC chưa đạt, xưởng cần hiệu chỉnh bổ sung
  | 'can_bo_sung'           // Cần bổ sung thông tin
  | 'xuong_tu_choi'         // Xưởng từ chối, Owner cần điều phối sang xưởng khác
  | 'yeu_cau_chinh_sua'     // Khách yêu cầu điều chỉnh lại phương án
  | 'da_huy';               // Đã hủy

export interface WorkshopPartner {
  id: string;
  name: string;
  artisanLeader: string;
  generation: string;
  villageArea: string;
  specialty: string[];
  kilnType: string;
  capacityMonth: string;
  workshopHostCapacity: number;
  avatar: string;
  rating: number;
  completedOrdersCount: number;
  availableSlotNext: string;

  // Đợt 2B.02: Thông số phục vụ Smart Matching (Gắn nhãn minh họa)
  serviceCapabilities?: ServiceType[];
  supportedTechniques?: string[];
  minCapacityWorkshop?: number;
  maxCapacityWorkshop?: number;
  minCapacityGifts?: number;
  maxCapacityGifts?: number;
  leadTimeDaysGifts?: number;
  availableDays?: string[];
  indicativeBudgetRange?: {
    workshopMinPerPerson?: number;
    giftsMinPerUnit?: number;
    displayNotice: string;
  };
  operationalNotes?: string;
  isDemonstrative?: boolean; // Luôn true: Xưởng minh họa – Không đại diện cho đối tác đã xác minh
}

// Đợt 2B.02: Kiểu dữ liệu Smart Matching
export type MatchStatus = 'phu_hop_so_bo' | 'can_xac_minh_them' | 'khong_dap_ung';

export interface MatchFilterReason {
  criterion: string;
  passed: boolean;
  detail: string;
}

export interface MatchProposal {
  workshopId: string;
  workshop: WorkshopPartner;
  status: MatchStatus;
  statusLabel: string;
  matchScore: number; // 0 - 100, minh bạch, giải thích được
  reasons: string[];
  matchedCapabilities: string[];
  unconfirmedConditions: string[];
  indicativePriceNote: string;
  filterBreakdown: MatchFilterReason[];
}

export interface MatchResult {
  orderId: string;
  serviceType: ServiceType;
  requiredScale: number;
  scaleUnit: string;
  requiredDate: string;
  requiredTechniques: string[];
  topRecommendations: MatchProposal[]; // Tối đa 3 phương án đề xuất
  ineligibleWorkshops: {
    workshopId: string;
    workshopName: string;
    rejectionReasons: string[];
  }[];
  emptyExplanation?: string;
  ownerRecommendationTip?: string;
}

// Đợt 2B.03: Quản lý phiên bản & Tiến trình Creative Passport
export interface CreativePassportVersion {
  versionId: string; // 'V1', 'V2', 'V3'
  createdAt: string;
  proposedBy: string; // 'Khách hàng' | 'Điều phối viên' | 'Xưởng thủ công'
  changeSummary: string; // Mô tả thay đổi
  details: {
    scaleOrQuantity?: number;
    targetTimeline?: string;
    budgetEstimated?: string;
    productOrTopic?: string;
    specialRequests?: string;
  };
  status: 'draft' | 'pending_review' | 'approved' | 'superseded';
  approvedBy?: string;
  approvedAt?: string;
  reviewNotes?: string;
}

export interface PassportMilestone {
  id: string; // 'm1_brief' | 'm2_dispatch' | 'm3_artisan' | 'm4_client_approval' | 'm5_execution' | 'm6_qc' | 'm7_handover'
  stepIndex: number;
  label: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
  timestamp?: string;
  actorRole: 'Khách hàng' | 'Điều phối viên' | 'Xưởng thủ công';
  actorName?: string;
  summary: string;
  documentRef?: string;
}

export interface CreativePassportRecord {
  passportId: string;
  orderId: string;
  createdAt: string;
  serviceType: ServiceType;
  title: string;
  clientName: string;
  clientOrg?: string;

  // Đợt 2B.03: Quản lý phiên bản V1 - V2 - V3
  versions?: CreativePassportVersion[];
  activeVersionId?: string;

  // Lần 1: Yêu cầu đã xác nhận & Chuẩn hóa (Đợt 2B.01)
  rawBrief?: string; // Mô tả gốc bằng ngôn ngữ tự nhiên
  structuredRequirement?: StructuredRequirementRecord; // Bản yêu cầu đã chuẩn hóa và được khách xác nhận
  requirementSummary: string;
  targetDate: string;

  // Điều phối xưởng
  dispatchedAt?: string;
  dispatchNote?: string;
  workshopName?: string;
  artisanLeader?: string;

  // Phản hồi từ xưởng
  artisanProposedPrice?: string;
  artisanProposedSchedule?: string;
  artisanTechnicalNotes?: string;
  artisanRespondedAt?: string;

  // Lần 2: Phương án & Thiết kế đã duyệt
  approvedDesignVersion?: string;
  approvedScope?: string;
  approvedDate?: string;
  approverName?: string;
  clientTotalPrice?: string;
  coordinationFee?: string; // Bảo mật: Không hiển thị cho vai trò thợ gốm (Artisan)

  // Tiến độ thực hiện & Báo cáo xưởng
  executionStatus?: string;
  executionNotes?: string;
  executionCompletedAt?: string;
  postFiringFollowup?: string;

  // Lần 3: Nghiệm thu QC & Bàn giao
  qcStatus?: 'chua_co_du_lieu' | 'dang_kiem_tra' | 'dat_chuan' | 'can_xu_ly';
  qcCheckedBy?: string;
  qcCheckedAt?: string;
  qcNotes?: string;
  handoverConfirmedBy?: string;
  handoverBasis?: string;
  handoverStatus?: string;
  completedDate?: string;
  handoverNotes?: string;
}

export interface OwnerProposal {
  workshopPrice: string;       // Giá xưởng đề xuất
  coordinationFee: string;     // Phí điều phối / dịch vụ MADE IN VIETNAM LAB
  clientTotalPrice: string;    // Tổng giá khách hàng thanh toán
  proposedSchedule: string;    // Lịch trình thực hiện cụ thể
  designOrProgramVersion: string; // Mã phiên bản thiết kế / chương trình
  termsAndConditions: string;  // Điều kiện & cam kết chất lượng
  reviewedAt: string;
}

export interface ArtisanResponse {
  decision: 'confirmed' | 'rejected';
  proposedPrice?: string;      // Giá xưởng đề xuất
  proposedSchedule?: string;   // Lịch xưởng có thể đáp ứng
  technicalNotes?: string;     // Ghi chú kỹ thuật, công suất, độ co ngót men
  rejectionReason?: string;    // Lý do nếu từ chối
  respondedAt?: string;
}

export interface ArtisanExecutionReport {
  reportedAt: string;
  reportNotes: string;
  workshopActualParticipants?: number;
  postFiringFollowup?: string; // Thành phẩm nung/giao sau cho workshop
  completedItemsCount?: number; // Số lượng quà tặng hoàn thành
}

export interface QcRecord {
  inspectorName: string;
  inspectedAt: string;
  result: 'dat' | 'can_xu_ly';
  notes: string; // Ghi chú hoặc căn cứ kiểm tra chất lượng
}

export interface HandoverRecord {
  confirmedBy: string; // Người xác nhận (khách hàng hoặc đại diện)
  confirmedAt: string;
  method: 'client_online' | 'external_document';
  documentBasis?: string; // Căn cứ chứng từ / biên bản giao nhận bên ngoài
  notes: string;
  postFiringFollowupStatus?: string; // Riêng cho workshop: tình trạng thành phẩm sau nung
}

export interface ClientApproval {
  approved: boolean;
  approvedAt: string;
  approvedBy: string;
  approvedDesignVersion: string;
  confirmedSampleOrSpecs: string; // Khách xác nhận đúng mẫu thiết kế/thông số
  notes?: string;
}

export interface StructuredRequirementRecord {
  rawBrief: string; // Mô tả gốc bằng ngôn ngữ tự nhiên
  analyzedAt: string;
  confirmedAt: string;
  confirmedBy: string;
  serviceType: ServiceType;
  scaleOrQuantity: number;
  scaleUnit: string; // 'người' | 'bộ' | 'sản phẩm'
  productOrTopic: string;
  budgetEstimated: string;
  targetTimeline: string;
  personalizationOrSpecialRequests: string;
  missingFieldsIdentified: string[]; // Các trường còn thiếu cần bổ sung
  conflictsIdentified: string[];      // Cảnh báo mâu thuẫn cần làm rõ
  clientConfirmed: boolean;
  notes?: string;
  // Nguyên tắc: Không tự động cam kết khả năng, giá hoặc lịch trước khi xưởng thẩm định
  workshopCommitmentNotice: string;
}

export interface OrderRequest {
  id: string;
  serviceType: ServiceType;
  title: string;
  
  // Đợt 2B.01: Lưu trữ cả mô tả gốc và bản yêu cầu có cấu trúc đã xác nhận
  rawBrief?: string;
  structuredRequirement?: StructuredRequirementRecord;

  // Thông tin liên hệ từ khách hàng
  contactName: string;
  organization?: string;
  contactPhone: string;
  contactEmail: string;
  description: string;
  budget: string;
  targetDate: string;

  // Chi tiết đặc thù theo từng dòng dịch vụ
  workshopDetails?: {
    participantsCount: number;
    plannedDate: string;
    specialRequests?: string;
  };
  giftsDetails?: {
    quantity: number;
    productType: string;
    personalizationNotes?: string;
    deliveryDate: string;
  };

  createdAt: string;
  status: OrderRequestStatus;
  currentStep: ConfirmationStep;

  // Điều phối xưởng bởi Owner
  assignedWorkshopId?: string;
  assignedWorkshopName?: string;
  ownerDispatchNote?: string;
  dispatchedAt?: string;

  // Phản hồi từ xưởng
  artisanResponse?: ArtisanResponse;

  // Phương án bóc tách chi phí của Owner chuyển cho khách
  ownerProposal?: OwnerProposal;

  // Phê duyệt từ khách hàng (Lần 2)
  clientApproval?: ClientApproval;

  // Báo cáo thực hiện của xưởng
  artisanExecutionReport?: ArtisanExecutionReport;

  // Kết quả kiểm tra chất lượng của Owner (Lần 3 - Phần A)
  qcRecord?: QcRecord;

  // Xác nhận nhận hàng hoặc hoàn tất dịch vụ (Lần 3 - Phần B)
  handoverRecord?: HandoverRecord;

  // Hồ sơ giao dịch và sáng tạo (Khởi tạo ngay từ khi gửi đơn)
  creativePassport: CreativePassportRecord;

  // Metadata nhận diện
  internalId?: string;
  isDemoScenario?: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderRole: 'customer' | 'owner';
  senderName: string;
  customerId: string;
  customerName: string;
  content: string;
  createdAt: string;
  relatedRequestId?: string;
}

export interface ConversationThread {
  conversationId: string;
  customerId: string;
  customerName: string;
  customerOrg?: string;
  relatedRequestId?: string;
  lastMessageText: string;
  lastMessageAt: string;
  messagesCount: number;
}

export interface MetricSummary {
  label: string;
  value: string;
  subtext: string;
  badge?: string;
}
