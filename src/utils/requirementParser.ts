import type { ServiceType } from '../types';

export interface ParsedRequirementDraft {
  rawBrief: string;
  detectedServiceType: ServiceType;
  serviceConfidence: 'high' | 'medium' | 'low';
  serviceReasoning: string;

  // Thông số có cấu trúc
  scaleOrQuantity: number | null;
  scaleUnit: 'người' | 'bộ' | 'sản phẩm';
  productOrTopic: string;
  budgetEstimated: string;
  targetTimeline: string;
  personalizationOrSpecialRequests: string;

  // Thông tin liên hệ nếu nhận diện được
  contactName?: string;
  organization?: string;
  contactPhone?: string;
  contactEmail?: string;

  // Cảnh báo & Thiếu sót (Không tự bịa dữ liệu)
  missingFields: { field: string; label: string; tip: string; isCritical: boolean }[];
  conflicts: string[];
  ambiguities: string[];

  // Cam kết xưởng
  workshopCommitmentNotice: string;
}

/**
 * Bộ phân tích quy tắc (Rule-based Requirement Structuring Engine)
 * Chuyển mô tả ngôn ngữ tự nhiên thành bản yêu cầu có cấu trúc,
 * đánh dấu rõ ràng các trường còn thiếu hoặc mâu thuẫn để khách hàng kiểm tra.
 */
export function analyzeRequirementBrief(
  brief: string, 
  explicitServiceHint?: ServiceType
): ParsedRequirementDraft {
  const text = brief.trim();
  const lower = text.toLowerCase();

  // 1. Phân tích loại dịch vụ (Workshop vs Gifts)
  let workshopScore = 0;
  let giftsScore = 0;

  const workshopKeywords = [
    'workshop', 'trải nghiệm', 'vuốt gốm', 'bàn xoay', 'học làm gốm', 
    'tổ chức làm gốm', 'kèm cặp', 'thưởng trà', 'đoàn', 'team building', 
    'nhân sự', 'nhân viên', 'thành viên', 'tập thể'
  ];

  const giftsKeywords = [
    'quà tặng', 'quà lưu niệm', 'bộ ly', 'bộ cốc', 'ấm chén', 'bình gốm', 
    'khắc logo', 'in logo', 'khắc tên', 'hộp quà', 'lô', 'mẻ', 'sản xuất', 
    'đặt làm', 'tri ân', 'đối tác', 'khách hàng', 'chiếc', 'bộ gốm'
  ];

  workshopKeywords.forEach(kw => {
    if (lower.includes(kw)) workshopScore++;
  });

  giftsKeywords.forEach(kw => {
    if (lower.includes(kw)) giftsScore++;
  });

  const conflicts: string[] = [];
  const ambiguities: string[] = [];
  const missingFields: { field: string; label: string; tip: string; isCritical: boolean }[] = [];

  let detectedServiceType: ServiceType = explicitServiceHint || 'gifts';
  let serviceConfidence: 'high' | 'medium' | 'low' = 'medium';
  let serviceReasoning = '';

  // Phát hiện mâu thuẫn dịch vụ
  if (workshopScore >= 2 && giftsScore >= 2) {
    conflicts.push('Mô tả chứa từ khóa của cả hai dịch vụ (Workshop trải nghiệm và Quà tặng sản xuất theo lô). Vui lòng xác định rõ dịch vụ chính.');
    detectedServiceType = explicitServiceHint || (workshopScore >= giftsScore ? 'workshop' : 'gifts');
    serviceConfidence = 'low';
    serviceReasoning = 'Phát hiện cả nhu cầu workshop và quà tặng; cần khách hàng xác nhận lại.';
  } else if (workshopScore > giftsScore) {
    detectedServiceType = 'workshop';
    serviceConfidence = workshopScore >= 2 ? 'high' : 'medium';
    serviceReasoning = 'Nhận diện các từ khóa đặc trưng về hoạt động trải nghiệm thực hành và bàn xoay gốm Bát Tràng.';
  } else if (giftsScore > workshopScore) {
    detectedServiceType = 'gifts';
    serviceConfidence = giftsScore >= 2 ? 'high' : 'medium';
    serviceReasoning = 'Nhận diện các từ khóa về chế tác quà tặng thủ công, sản phẩm đóng hộp hoặc khắc dấu ấn thương hiệu.';
  } else {
    detectedServiceType = explicitServiceHint || 'gifts';
    serviceConfidence = 'low';
    serviceReasoning = 'Chưa đủ từ khóa rõ ràng; hệ thống tạm chọn theo ngữ cảnh ban đầu.';
    ambiguities.push('Loại hình dịch vụ chưa được nêu rõ ràng; vui lòng chọn chính xác dòng dịch vụ bạn cần.');
  }

  // 2. Nhận diện số lượng / quy mô
  let scaleOrQuantity: number | null = null;
  let scaleUnit: 'người' | 'bộ' | 'sản phẩm' = detectedServiceType === 'workshop' ? 'người' : 'bộ';

  // Kiểm tra mô tả dạng khoảng (Range: e.g., 15-20 người, 20 đến 30 bộ)
  const rangeMatch = lower.match(/(\d+)\s*(?:-|–|đến|\.\.\.)\s*(\d+)\s*(người|thành viên|bạn|nhân viên|khách|bộ|chiếc|cái|ly|cốc|món|sản phẩm)?/);
  if (rangeMatch) {
    const num1 = parseInt(rangeMatch[1], 10);
    const num2 = parseInt(rangeMatch[2], 10);
    scaleOrQuantity = num2; // Lấy ngưỡng trên tạm thời
    ambiguities.push(`Số lượng được mô tả dạng khoảng từ ${num1} đến ${num2}. Hệ thống tạm lấy ${num2}, vui lòng xác nhận con số chính xác.`);
  } else {
    // Nhận diện số lượng cụ thể
    if (detectedServiceType === 'workshop') {
      const matchWs = lower.match(/(\d+)\s*(?:người|thành viên|bạn|nhân sự|nhân viên|khách|chỗ|bàn xoay)/);
      if (matchWs) {
        scaleOrQuantity = parseInt(matchWs[1], 10);
        scaleUnit = 'người';
      }
    } else {
      const matchGifts = lower.match(/(\d+)\s*(?:bộ|chiếc|cái|ly|cốc|món|phần|set|hộp|sản phẩm)/);
      if (matchGifts) {
        scaleOrQuantity = parseInt(matchGifts[1], 10);
        scaleUnit = lower.includes('ly') || lower.includes('cốc') || lower.includes('bộ') ? 'bộ' : 'sản phẩm';
      }
    }

    // Fallback: Tìm con số độc lập đứng trước hoặc sau từ chỉ số lượng
    if (scaleOrQuantity === null) {
      const matchGeneral = lower.match(/(?:khoảng|tầm|số lượng|đoàn|quy mô)\s*[:\s]*(\d+)/) || lower.match(/(\d+)\s*(?:suất|phần)/);
      if (matchGeneral) {
        scaleOrQuantity = parseInt(matchGeneral[1], 10);
      }
    }
  }

  // Nếu hoàn toàn không tìm thấy số lượng: Đánh dấu thiếu (KHÔNG BỊA SỐ)
  if (scaleOrQuantity === null || isNaN(scaleOrQuantity) || scaleOrQuantity <= 0) {
    scaleOrQuantity = null;
    missingFields.push({
      field: 'quantity',
      label: detectedServiceType === 'workshop' ? 'Số lượng người tham gia' : 'Số lượng sản phẩm/bộ quà tặng',
      tip: 'Mô tả chưa có số lượng cụ thể. Lò nung và không gian xưởng cần con số này để đối chiếu công suất.',
      isCritical: true
    });
  }

  // 3. Nhận diện thời gian / Hạn mong muốn
  let targetTimeline = '';
  // Format DD/MM/YYYY
  const dateMatch = text.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{4})\b/);
  // Format "ngày X tháng Y năm Z" hoặc "ngày X tháng Y"
  const textDateMatch = lower.match(/ngày\s*(\d{1,2})\s*tháng\s*(\d{1,2})(?:\s*năm\s*(\d{4}))?/);

  if (dateMatch) {
    targetTimeline = dateMatch[1].replace(/[\-\.]/g, '/');
  } else if (textDateMatch) {
    const d = textDateMatch[1].padStart(2, '0');
    const m = textDateMatch[2].padStart(2, '0');
    const y = textDateMatch[3] || '2026';
    targetTimeline = `${d}/${m}/${y}`;
  } else {
    // Relative keywords
    if (lower.includes('đầu tháng 11')) targetTimeline = 'Đầu tháng 11/2026 (Cần chốt ngày cụ thể)';
    else if (lower.includes('giữa tháng 11')) targetTimeline = '15/11/2026 (Dự kiến)';
    else if (lower.includes('cuối tháng 11')) targetTimeline = '28/11/2026 (Dự kiến)';
    else if (lower.includes('tháng 11')) targetTimeline = 'Tháng 11/2026 (Cần bổ sung ngày)';
    else if (lower.includes('tháng 12')) targetTimeline = 'Tháng 12/2026 (Cần bổ sung ngày)';
  }

  if (!targetTimeline) {
    missingFields.push({
      field: 'targetDate',
      label: detectedServiceType === 'workshop' ? 'Ngày tổ chức workshop' : 'Hạn bàn giao quà tặng',
      tip: 'Chưa nhận diện được ngày dự kiến. Xưởng cần lịch cụ thể để chuẩn bị mẻ lò hoặc nghệ nhân.',
      isCritical: true
    });
  }

  // 4. Nhận diện ngân sách
  let budgetEstimated = '';
  // Pattern: "10 triệu", "8.000.000", "8 - 10 tr"
  const budgetRangeMatch = lower.match(/(\d+[\.,]?\d*)\s*(?:-|–|đến)\s*(\d+[\.,]?\d*)\s*(?:triệu|tr|trieu)/);
  const budgetMatch = lower.match(/(?:ngân sách|chi phí|tầm|khoảng|kinh phí|tài chính)\s*(?:khoảng|tầm|dự kiến)?\s*[:\s]*(\d+[\.,]?\d*)\s*(triệu|tr|trieu|nghìn|ngan|k|đ|vnđ|vnd)?/) 
    || lower.match(/(\d+[\.,]?\d*)\s*(triệu|tr|trieu)\s*(?:đồng|đ|vnđ)?/);

  if (budgetRangeMatch) {
    budgetEstimated = `${budgetRangeMatch[1]} - ${budgetRangeMatch[2]} triệu VNĐ`;
  } else if (budgetMatch) {
    const val = budgetMatch[1];
    const unit = budgetMatch[2] || '';
    if (unit.includes('triệu') || unit.includes('tr') || unit.includes('trieu')) {
      budgetEstimated = `${val}.000.000 VNĐ`;
    } else if (val.length >= 6) {
      budgetEstimated = `${parseInt(val.replace(/[^0-9]/g, ''), 10).toLocaleString('vi-VN')} VNĐ`;
    } else {
      budgetEstimated = `${val} ${unit}`.trim();
    }
  }

  if (!budgetEstimated) {
    budgetEstimated = '';
    missingFields.push({
      field: 'budget',
      label: 'Ngân sách dự kiến',
      tip: 'Chưa có thông tin ngân sách; sẽ được làm rõ trong bước trao đổi với điều phối viên.',
      isCritical: false
    });
  }

  // 5. Nhận diện chủ đề workshop hoặc dòng sản phẩm quà tặng
  let productOrTopic = '';
  if (detectedServiceType === 'workshop') {
    if (lower.includes('bàn xoay') && lower.includes('thưởng trà')) {
      productOrTopic = 'Workshop trải nghiệm vuốt gốm bàn xoay & Thưởng trà nghệ nhân Bát Tràng';
    } else if (lower.includes('vẽ men') || lower.includes('vẽ gốm')) {
      productOrTopic = 'Workshop vẽ hoa văn trên gốm mộc Bát Tràng';
    } else {
      productOrTopic = 'Workshop trải nghiệm làm gốm thủ công Bát Tràng';
    }
  } else {
    if (lower.includes('hỏa biến') || lower.includes('hoa bien')) {
      productOrTopic = 'Bộ ly gốm men hỏa biến sắc xanh biển cao cấp';
    } else if (lower.includes('men lam') || lower.includes('ấm chén') || lower.includes('am chen')) {
      productOrTopic = 'Bộ ấm chén gốm men lam Bát Tràng';
    } else if (lower.includes('men rạn') || lower.includes('men ran')) {
      productOrTopic = 'Bộ đồ trà gốm men rạn cổ Bát Tràng';
    } else {
      productOrTopic = 'Quà tặng gốm sứ thủ công Bát Tràng theo yêu cầu';
    }
  }

  // 6. Nhận diện yêu cầu cá nhân hóa / lưu ý đặc thù
  const specialList: string[] = [];
  if (lower.includes('logo')) {
    specialList.push('Khắc/In chìm logo thương hiệu theo quy chuẩn');
  }
  if (lower.includes('khắc tên') || lower.includes('dấu ấn')) {
    specialList.push('Khắc dấu ấn cá nhân hóa');
  }
  if (lower.includes('hộp quà') || lower.includes('hộp giấy bồi') || lower.includes('lót lụa')) {
    specialList.push('Đóng gói hộp quà giấy bồi cao cấp lót lụa');
  }
  if (lower.includes('kèm cặp') || lower.includes('1:5') || lower.includes('hướng dẫn')) {
    specialList.push('Nghệ nhân kèm cặp kỹ thuật vuốt gốm 1:5');
  }
  if (lower.includes('thưởng trà') || lower.includes('trà bát tràng')) {
    specialList.push('Bao gồm không gian thưởng trà Bát Tràng');
  }
  if (lower.includes('giao sau') || lower.includes('lưu nung')) {
    specialList.push('Hỗ trợ nung mẻ chín và đóng gói giao thành phẩm sau buổi workshop');
  }

  const personalizationOrSpecialRequests = specialList.length > 0 
    ? specialList.join('; ') 
    : 'Không có yêu cầu đặc thù bổ sung (sẽ làm rõ khi tư vấn)';

  // 7. Nhận diện thông tin tổ chức/liên hệ nếu có trong brief
  let organization = '';
  const orgMatch = text.match(/(?:công ty|doanh nghiệp|viện|tổ chức|tập đoàn)\s+([^,\.\n]{3,40})/i);
  if (orgMatch) {
    organization = orgMatch[0].trim();
  }

  let contactPhone = '';
  const phoneMatch = text.match(/\b(0\d{9,10})\b/);
  if (phoneMatch) {
    contactPhone = phoneMatch[1];
  }

  let contactEmail = '';
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  if (emailMatch) {
    contactEmail = emailMatch[0];
  }

  return {
    rawBrief: text,
    detectedServiceType,
    serviceConfidence,
    serviceReasoning,
    scaleOrQuantity,
    scaleUnit,
    productOrTopic,
    budgetEstimated,
    targetTimeline,
    personalizationOrSpecialRequests,
    organization: organization || undefined,
    contactPhone: contactPhone || undefined,
    contactEmail: contactEmail || undefined,
    missingFields,
    conflicts,
    ambiguities,
    workshopCommitmentNotice: 'Bản thông số yêu cầu sau khi khách xác nhận sẽ được gửi tới các xưởng Bát Tràng trong mạng lưới đối tác để thẩm định công suất lò nung và lịch hẹn thực tế. Hệ thống không tự động cam kết giá hay lịch trước khi có phản hồi chính thức từ xưởng.'
  };
}

// 4 Kịch bản mẫu để Ban Giám Khảo & Người dùng kiểm thử nhanh Module 2B.01
export const PRESET_TEST_BRIEFS = [
  {
    id: 'test-ws-full',
    title: '1. Workshop Đầy Đủ Thông Số',
    tag: 'Đầy đủ',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    brief: 'Công ty Dược phẩm Sao Mai muốn tổ chức một buổi workshop làm gốm Bát Tràng cho đoàn 20 người vào sáng Thứ Bảy ngày 08/11/2026. Ngân sách dự kiến khoảng 10 triệu đồng. Yêu cầu xưởng chuẩn bị đủ bàn xoay độc lập, có nghệ nhân kèm cặp kỹ thuật 1:5, kết hợp thưởng trà và hỗ trợ nung giao sản phẩm kỷ niệm sau buổi trải nghiệm.'
  },
  {
    id: 'test-gift-personalized',
    title: '2. Quà Tặng Có Cá Nhân Hóa',
    tag: 'Cá nhân hóa',
    badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
    brief: 'Công ty Công nghệ An Nam cần đặt làm 20 bộ ly sứ men hỏa biến màu xanh biển làm quà tặng tri ân nhân viên và đối tác. Yêu cầu khắc chìm logo An Nam Tech ở đáy ly gốm và đóng gói trong hộp quà giấy bồi lót lụa. Ngân sách khoảng 8 triệu đồng, cần nhận hàng trước ngày 15/11/2026.'
  },
  {
    id: 'test-missing-info',
    title: '3. Yêu Cầu Thiếu Thông Số (Cần bổ sung)',
    tag: 'Thiếu thông tin',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    brief: 'Chúng tôi muốn đặt quà tặng gốm sứ thủ công Bát Tràng mang bản sắc truyền thống cho sự kiện sắp tới của công ty, nhưng hiện chưa chốt được số lượng cụ thể và ngày tổ chức chính xác.'
  },
  {
    id: 'test-conflicting-info',
    title: '4. Yêu Cầu Chứa Thông Tin Mâu Thuẫn',
    tag: 'Mâu thuẫn',
    badgeClass: 'bg-red-100 text-red-900 border-red-300',
    brief: 'Công ty muốn tổ chức buổi workshop vuốt gốm trải nghiệm cho nhóm 15 nhân sự vào cuối tuần, đồng thời muốn đặt làm 50 bộ ấm chén men lam quà tặng xuất xưởng ngay cùng ngày đó.'
  }
];
