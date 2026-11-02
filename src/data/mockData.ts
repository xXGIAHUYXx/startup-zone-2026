import type { WorkshopPartner, OrderRequest } from '../types';

export const BAT_TRANG_WORKSHOPS: WorkshopPartner[] = [
  {
    id: 'ws-an-nhien',
    name: 'Xưởng Gốm Hỏa Biến An Nhiên',
    artisanLeader: 'Thợ gốm Nguyễn Văn Lâm',
    generation: 'Nghề gốm gia truyền Bát Tràng',
    villageArea: 'Khu xưởng làng nghề Giang Cao, Bát Tràng, Hà Nội',
    specialty: ['Gốm men hoả biến sắc xanh biển & hổ phách', 'Cốc uống nước nghệ thuật', 'Bình dáng giọt nước'],
    kilnType: 'Lò nung gas 1260°C - 1280°C',
    capacityMonth: 'Quy mô nhận mẻ: 100 - 300 sản phẩm / mẻ lò',
    workshopHostCapacity: 15,
    avatar: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=400&q=80',
    rating: 4.9,
    completedOrdersCount: 0,
    availableSlotNext: 'Thứ Ba tuần tới',
    // Đợt 2B.02: Smart Matching Parameters
    serviceCapabilities: ['gifts', 'workshop'],
    supportedTechniques: ['men hỏa biến', 'khắc logo', 'đóng hộp quà', 'cốc nghệ thuật', 'vuốt gốm'],
    minCapacityWorkshop: 5,
    maxCapacityWorkshop: 15,
    minCapacityGifts: 10,
    maxCapacityGifts: 200,
    leadTimeDaysGifts: 10,
    availableDays: ['Thứ Ba', 'Thứ Năm', 'Thứ Bảy'],
    indicativeBudgetRange: {
      workshopMinPerPerson: 300000,
      giftsMinPerUnit: 250000,
      displayNotice: 'Khoảng 250.000 – 350.000 VNĐ / bộ (tham khảo minh họa, xưởng sẽ báo giá chính xác)'
    },
    operationalNotes: 'Xưởng chuyên sâu men hỏa biến cao cấp. Không gian tiếp đón workshop tối đa 15 người. Nhận mẻ quà tặng từ 10 đến 200 sản phẩm.',
    isDemonstrative: true
  },
  {
    id: 'ws-thang-long',
    name: 'Xưởng Men Rạn Thăng Long',
    artisanLeader: 'Thợ gốm Phạm Tuấn',
    generation: 'Kỹ thuật men rạn truyền thống Bát Tràng',
    villageArea: 'Khu vực Bát Tràng cổ ven sông Hồng, Hà Nội',
    specialty: ['Men rạn ngà chỉ đen', 'Khắc chìm hoa văn truyền thống', 'Bộ đồ trà gốm mộc'],
    kilnType: 'Lò nung cách nhiệt đối lưu kiểm soát số',
    capacityMonth: 'Quy mô nhận mẻ: 80 - 200 sản phẩm / tháng',
    workshopHostCapacity: 20,
    avatar: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=400&q=80',
    rating: 4.85,
    completedOrdersCount: 0,
    availableSlotNext: 'Cuối tuần này',
    // Đợt 2B.02: Smart Matching Parameters
    serviceCapabilities: ['gifts', 'workshop'],
    supportedTechniques: ['men rạn', 'khắc logo', 'khắc chìm hoa văn', 'bộ đồ trà', 'đóng hộp quà'],
    minCapacityWorkshop: 8,
    maxCapacityWorkshop: 20,
    minCapacityGifts: 10,
    maxCapacityGifts: 150,
    leadTimeDaysGifts: 14,
    availableDays: ['Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'],
    indicativeBudgetRange: {
      workshopMinPerPerson: 350000,
      giftsMinPerUnit: 350000,
      displayNotice: 'Khoảng 350.000 – 450.000 VNĐ / bộ (dòng men rạn thủ công yêu cầu thời gian tôi men)'
    },
    operationalNotes: 'Chuyên dòng men rạn cổ Bát Tràng và khắc chìm logo/dấu ấn. Sức chứa workshop tiếp đón đến 20 người. Thời gian nung và tôi rạn tối thiểu 14 ngày.',
    isDemonstrative: true
  },
  {
    id: 'ws-song-hong',
    name: 'Không Gian Trải Nghiệm Gốm Mộc Sông Hồng',
    artisanLeader: 'Thợ gốm Lê Hưng',
    generation: 'Tạo hình bàn xoay & hướng dẫn workshop',
    villageArea: 'Xóm 1 Bát Tràng, Gia Lâm, Hà Nội',
    specialty: ['Trải nghiệm vuốt gốm bàn xoay thủ công', 'Vẽ men mộc tự nhiên', 'Workshop gắn kết nhóm 10 - 20 người'],
    kilnType: 'Lò nung phụ trợ tác phẩm workshop',
    capacityMonth: 'Tiếp nhận 4 - 8 nhóm workshop / tháng',
    workshopHostCapacity: 25,
    avatar: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=400&q=80',
    rating: 4.95,
    completedOrdersCount: 0,
    availableSlotNext: 'Linh hoạt theo lịch hẹn đoàn',
    // Đợt 2B.02: Smart Matching Parameters (CHỈ LÀM WORKSHOP)
    serviceCapabilities: ['workshop'],
    supportedTechniques: ['bàn xoay', 'vuốt gốm', 'thưởng trà', 'kèm cặp 1:5', 'vẽ men', 'nung sau'],
    minCapacityWorkshop: 5,
    maxCapacityWorkshop: 25,
    minCapacityGifts: 0,
    maxCapacityGifts: 0,
    leadTimeDaysGifts: 0,
    availableDays: ['Thứ Bảy', 'Chủ Nhật', 'Ngày trong tuần theo hẹn'],
    indicativeBudgetRange: {
      workshopMinPerPerson: 300000,
      displayNotice: 'Khoảng 300.000 – 400.000 VNĐ / người (bao gồm bàn xoay, nghệ nhân kèm cặp và thưởng trà)'
    },
    operationalNotes: 'Xưởng chuyên sâu tổ chức trải nghiệm văn hóa và workshop bàn xoay gốm (đến 25 người). Tuyệt đối không nhận đơn hàng sản xuất quà tặng theo lô.',
    isDemonstrative: true
  },
  {
    id: 'ws-lam-vien',
    name: 'Tổ Hợp Chế Tác Gốm Men Lam Lam Viên',
    artisanLeader: 'Thợ gốm Trần Hà',
    generation: 'Dòng men lam chàm cổ điển',
    villageArea: 'Khu phố gốm Bát Tràng mới, Hà Nội',
    specialty: ['Men lam chàm vẽ tay phong cảnh', 'Ly tách gốm quà tặng', 'Hộp quà lót lụa thủ công'],
    kilnType: 'Lò nung gas kiểm soát nhiệt độ',
    capacityMonth: 'Quy mô nhận mẻ: 150 - 350 sản phẩm / tháng',
    workshopHostCapacity: 15,
    avatar: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?auto=format&fit=crop&w=400&q=80',
    rating: 4.8,
    completedOrdersCount: 0,
    availableSlotNext: 'Thứ Năm hàng tuần',
    // Đợt 2B.02: Smart Matching Parameters
    serviceCapabilities: ['gifts', 'workshop'],
    supportedTechniques: ['men lam', 'vẽ tay', 'ấm chén', 'khắc logo', 'in logo', 'hộp quà lót lụa', 'vẽ men'],
    minCapacityWorkshop: 5,
    maxCapacityWorkshop: 15,
    minCapacityGifts: 15,
    maxCapacityGifts: 300,
    leadTimeDaysGifts: 12,
    availableDays: ['Thứ Năm', 'Thứ Bảy', 'Chủ Nhật'],
    indicativeBudgetRange: {
      workshopMinPerPerson: 320000,
      giftsMinPerUnit: 280000,
      displayNotice: 'Khoảng 280.000 – 380.000 VNĐ / bộ (tùy thuộc mức độ chi tiết vẽ tay phong cảnh)'
    },
    operationalNotes: 'Chuyên dòng men lam chàm truyền thống, vẽ tay họa tiết và đóng hộp quà lụa. Workshop tối đa 15 người.',
    isDemonstrative: true
  },
  {
    id: 'ws-phuong-dong',
    name: 'Xưởng Quà Tặng Đồ Sứ Mỹ Nghệ Phương Đông',
    artisanLeader: 'Thợ gốm Vũ Quang',
    generation: 'Sản xuất quà tặng gốm sứ doanh nghiệp',
    villageArea: 'Khu công nghiệp vừa và nhỏ làng nghề Bát Tràng, Hà Nội',
    specialty: ['Bộ ấm chén in logo số lượng lớn', 'Men ngọc và men trắng sứ', 'Hộp quà cao cấp định hình'],
    kilnType: 'Cụm lò con thoi công suất lớn',
    capacityMonth: 'Quy mô nhận mẻ: 300 - 1000 sản phẩm / tháng',
    workshopHostCapacity: 0,
    avatar: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=400&q=80',
    rating: 4.75,
    completedOrdersCount: 0,
    availableSlotNext: 'Linh hoạt mọi ngày trong tuần',
    // Đợt 2B.02: Smart Matching Parameters (CHỈ LÀM QUÀ TẶNG LÔ LỚN)
    serviceCapabilities: ['gifts'],
    supportedTechniques: ['in logo', 'khắc logo', 'men ngọc', 'ấm chén', 'hộp quà lót lụa', 'sản xuất lô lớn'],
    minCapacityWorkshop: 0,
    maxCapacityWorkshop: 0,
    minCapacityGifts: 30,
    maxCapacityGifts: 500,
    leadTimeDaysGifts: 7,
    availableDays: ['Toàn bộ các ngày trong tuần'],
    indicativeBudgetRange: {
      giftsMinPerUnit: 180000,
      displayNotice: 'Khoảng 180.000 – 260.000 VNĐ / bộ (tối ưu chi phí cho lô từ 30 bộ trở lên)'
    },
    operationalNotes: 'Chuyên sản xuất quà tặng doanh nghiệp theo lô lớn (tối thiểu 30 bộ). Không có không gian tổ chức workshop trải nghiệm.',
    isDemonstrative: true
  }
];

// Khởi tạo trạng thái ban đầu: HOÀN TOÀN TRỐNG ĐƠN HÀNG (Mục IV)
export const INITIAL_ORDERS: OrderRequest[] = [];

// Dữ liệu kịch bản mẫu nạp nhanh đúng chuẩn kế hoạch đề án (Workshop 20 người: 10tr/7tr/3tr; Quà tặng 20 sp: 8tr/6tr/2tr)
export const PRELOADED_SCENARIO_ORDERS: OrderRequest[] = [
  {
    id: 'YC-2601',
    serviceType: 'gifts',
    title: '20 Bộ ly gốm men hoả biến cho lễ tri ân nội bộ',
    contactName: 'Trần Minh Hoàng',
    organization: 'Công ty Công nghệ An Nam',
    contactPhone: '0912 345 678',
    contactEmail: 'hoang.tran@annamtech.vn',
    description: 'Chế tác 20 bộ ly sứ men hoả biến màu xanh biển kèm hộp quà giấy bồi trang nhã cho dịp kỷ niệm thành lập.',
    budget: '8.000.000 VNĐ',
    targetDate: '15/11/2026',
    giftsDetails: {
      quantity: 20,
      productType: 'Bộ ly sứ men hoả biến cao cấp',
      personalizationNotes: 'Khắc chìm dấu ấn An Nam Tech ở đế gốm',
      deliveryDate: '15/11/2026'
    },
    createdAt: '25/10/2026 09:30',
    status: 'cho_khach_duyet',
    currentStep: 2,
    assignedWorkshopId: 'ws-an-nhien',
    assignedWorkshopName: 'Xưởng Gốm Hỏa Biến An Nhiên',
    ownerDispatchNote: 'Xưởng xem xét công suất lò nung đầu tháng 11 cho lô 20 bộ ly men hỏa biến kèm hộp quà nhé.',
    dispatchedAt: '25/10/2026 10:00',
    artisanResponse: {
      decision: 'confirmed',
      proposedPrice: '6.000.000 VNĐ (300.000 VNĐ / bộ hoàn thiện)',
      proposedSchedule: 'Hoàn thành mẻ nung 10/11/2026, bàn giao 12/11/2026',
      technicalNotes: 'Đã bố trí chỗ trong lò gas, kiểm soát nhiệt 1280°C để đạt sắc xanh chuẩn.',
      respondedAt: '25/10/2026 10:45'
    },
    ownerProposal: {
      workshopPrice: '6.000.000 VNĐ',
      coordinationFee: '2.000.000 VNĐ',
      clientTotalPrice: '8.000.000 VNĐ (400.000 VNĐ / bộ trọn gói)',
      proposedSchedule: 'Bàn giao hoàn thiện ngày 12/11/2026 (trước hạn 3 ngày)',
      designOrProgramVersion: 'VER-GIFT-HB20-v1',
      termsAndConditions: 'Bảo hành kiểm định 1 đổi 1 lỗi nứt men; bao bì hộp giấy bồi lót lụa cao cấp.',
      reviewedAt: '25/10/2026 11:15'
    },
    creativePassport: {
      passportId: 'PASSPORT-YC-2601',
      orderId: 'YC-2601',
      createdAt: '25/10/2026 09:30',
      serviceType: 'gifts',
      title: '20 Bộ ly gốm men hoả biến cho lễ tri ân nội bộ',
      clientName: 'Trần Minh Hoàng',
      clientOrg: 'Công ty Công nghệ An Nam',
      requirementSummary: '20 bộ ly sứ men hoả biến xanh biển khắc laser đáy ly, hộp giấy bồi.',
      targetDate: '15/11/2026',
      workshopName: 'Xưởng Gốm Hỏa Biến An Nhiên',
      artisanLeader: 'Thợ gốm Nguyễn Văn Lâm',
      approvedDesignVersion: 'VER-GIFT-HB20-v1 (Đang chờ khách duyệt)',
      approvedScope: 'Lô 20 sản phẩm theo mẫu men hỏa biến đã phê duyệt',
      executionStatus: 'Chờ khách phê duyệt điều kiện để xưởng vào đất tạo hình',
      qcStatus: 'chua_co_du_lieu',
      handoverStatus: 'Đang ở giai đoạn thẩm định & phê duyệt phương án',
      versions: [
        {
          versionId: 'V1',
          createdAt: '25/10/2026 09:30',
          proposedBy: 'Khách hàng',
          changeSummary: 'Khởi tạo yêu cầu ban đầu từ Smart Brief (20 bộ ly sứ men hỏa biến)',
          details: {
            scaleOrQuantity: 20,
            targetTimeline: '15/11/2026',
            budgetEstimated: '8.000.000 VNĐ',
            productOrTopic: 'Bộ ly sứ men hỏa biến',
            specialRequests: 'Khắc logo An Nam Tech, hộp giấy bồi lót lụa'
          },
          status: 'approved',
          approvedBy: 'Trần Minh Hoàng',
          approvedAt: '25/10/2026 09:30',
          reviewNotes: 'Khách hàng đã xác nhận hồ sơ kỹ thuật ban đầu'
        }
      ],
      activeVersionId: 'V1'
    },
    internalId: 'internal-scen-2601',
    isDemoScenario: true
  },
  {
    id: 'YC-2602',
    serviceType: 'workshop',
    title: 'Workshop trải nghiệm làm gốm Bát Tràng cho đoàn 20 người',
    contactName: 'Nguyễn Bích Ngọc',
    organization: 'Dược phẩm Sao Mai',
    contactPhone: '0988 765 432',
    contactEmail: 'bichngoc@saomaipharma.vn',
    description: 'Workshop trải nghiệm vuốt gốm thủ công trên bàn xoay và thưởng trà Bát Tràng cho đoàn 20 người dịp gắn kết nội bộ.',
    budget: '10.000.000 VNĐ',
    targetDate: '08/11/2026',
    workshopDetails: {
      participantsCount: 20,
      plannedDate: 'Sáng Thứ Bảy 08/11/2026 (08:30 - 11:30)',
      specialRequests: 'Kèm cặp kỹ thuật vuốt gốm 1:5, hướng dẫn nung và giao sản phẩm lưu niệm sau buổi trải nghiệm.'
    },
    createdAt: '25/10/2026 14:00',
    status: 'cho_tiep_nhan',
    currentStep: 1,
    creativePassport: {
      passportId: 'PASSPORT-YC-2602',
      orderId: 'YC-2602',
      createdAt: '25/10/2026 14:00',
      serviceType: 'workshop',
      title: 'Workshop trải nghiệm làm gốm Bát Tràng cho đoàn 20 người',
      clientName: 'Nguyễn Bích Ngọc',
      clientOrg: 'Dược phẩm Sao Mai',
      requirementSummary: 'Workshop gắn kết 20 người, vuốt gốm bàn xoay, thưởng trà nghệ nhân.',
      targetDate: '08/11/2026',
      workshopName: 'Đang chờ điều phối viên liên hệ xưởng phù hợp',
      approvedDesignVersion: 'Chưa xác lập (Chờ thẩm định phương án)',
      executionStatus: 'Yêu cầu mới tiếp nhận, đang chuẩn bị tư vấn',
      qcStatus: 'chua_co_du_lieu',
      handoverStatus: 'Đang ở giai đoạn xác nhận nhu cầu',
      versions: [
        {
          versionId: 'V1',
          createdAt: '25/10/2026 14:00',
          proposedBy: 'Khách hàng',
          changeSummary: 'Khởi tạo yêu cầu ban đầu từ Smart Brief (Workshop 20 người)',
          details: {
            scaleOrQuantity: 20,
            targetTimeline: '08/11/2026',
            budgetEstimated: '10.000.000 VNĐ',
            productOrTopic: 'Workshop bàn xoay & thưởng trà',
            specialRequests: 'Kèm cặp 1:5, thưởng trà Bát Tràng'
          },
          status: 'approved',
          approvedBy: 'Nguyễn Bích Ngọc',
          approvedAt: '25/10/2026 14:00',
          reviewNotes: 'Khách hàng đã xác nhận hồ sơ kỹ thuật ban đầu'
        }
      ],
      activeVersionId: 'V1'
    },
    internalId: 'internal-scen-2602',
    isDemoScenario: true
  }
];

export const DEMO_WORKSHOPS = BAT_TRANG_WORKSHOPS;
