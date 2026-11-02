import type { OrderRequest, WorkshopPartner, MatchResult, MatchProposal, MatchFilterReason, ServiceType } from '../types';

/**
 * Helper tính khoảng cách ngày từ mốc tham chiếu (Mặc định 25/10/2026 trong đề án)
 */
function parseDaysUntilTarget(targetDateStr: string, baseDateStr = '25/10/2026'): number | null {
  if (!targetDateStr) return null;
  const match = targetDateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (!match) return null;

  const targetD = parseInt(match[1], 10);
  const targetM = parseInt(match[2], 10) - 1;
  const targetY = parseInt(match[3], 10);
  const targetDate = new Date(targetY, targetM, targetD);

  const baseMatch = baseDateStr.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  const baseD = baseMatch ? parseInt(baseMatch[1], 10) : 25;
  const baseM = baseMatch ? parseInt(baseMatch[2], 10) - 1 : 9; // Oct is 9
  const baseY = baseMatch ? parseInt(baseMatch[3], 10) : 2026;
  const baseDate = new Date(baseY, baseM, baseD);

  const diffMs = targetDate.getTime() - baseDate.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : 0;
}

/**
 * Trích xuất danh sách kỹ thuật / yêu cầu đặc thù từ yêu cầu của khách
 */
function extractRequiredTechniques(request: OrderRequest): { mandatory: string[]; preferred: string[] } {
  const text = `${request.title} ${request.description} ${request.rawBrief || ''} ${request.structuredRequirement?.personalizationOrSpecialRequests || ''} ${request.giftsDetails?.personalizationNotes || ''} ${request.workshopDetails?.specialRequests || ''}`.toLowerCase();
  
  const mandatory: string[] = [];
  const preferred: string[] = [];

  // Yêu cầu bắt buộc về kỹ thuật/cá nhân hóa
  if (text.includes('logo') || text.includes('khắc logo') || text.includes('in logo')) {
    mandatory.push('khắc logo');
  }
  if (text.includes('hộp quà') || text.includes('lót lụa') || text.includes('hộp giấy bồi')) {
    preferred.push('đóng hộp quà');
  }
  if (text.includes('bàn xoay') || text.includes('vuốt gốm')) {
    mandatory.push('bàn xoay');
  }
  if (text.includes('thưởng trà')) {
    preferred.push('thưởng trà');
  }
  if (text.includes('kèm cặp') || text.includes('1:5')) {
    preferred.push('kèm cặp 1:5');
  }
  if (text.includes('nung sau') || text.includes('lưu nung')) {
    preferred.push('nung sau');
  }

  // Dòng men đặc thù
  if (text.includes('hỏa biến') || text.includes('hoa bien')) {
    mandatory.push('men hỏa biến');
  }
  if (text.includes('men rạn') || text.includes('men ran')) {
    mandatory.push('men rạn');
  }
  if (text.includes('men lam') || text.includes('men lam chàm')) {
    mandatory.push('men lam');
  }

  return { mandatory, preferred };
}

/**
 * ĐỘNG CƠ SMART MATCHING (ĐỢT 2B.02)
 * Minh bạch • Có thể giải trình • Không sử dụng AI ảo
 */
export function runSmartMatching(
  request: OrderRequest,
  workshops: WorkshopPartner[]
): MatchResult {
  const serviceType: ServiceType = request.structuredRequirement?.serviceType || request.serviceType;
  
  // Trích xuất quy mô / số lượng
  let requiredScale = 0;
  if (request.structuredRequirement && request.structuredRequirement.scaleOrQuantity) {
    requiredScale = request.structuredRequirement.scaleOrQuantity;
  } else if (serviceType === 'workshop') {
    requiredScale = request.workshopDetails?.participantsCount || 0;
  } else {
    requiredScale = request.giftsDetails?.quantity || 0;
  }

  const scaleUnit = serviceType === 'workshop' ? 'người' : 'sản phẩm/bộ';
  const requiredDate = request.structuredRequirement?.targetTimeline || request.targetDate || '';
  const daysUntilTarget = parseDaysUntilTarget(requiredDate);
  const { mandatory: mandatoryTechniques, preferred: preferredTechniques } = extractRequiredTechniques(request);
  const allRequiredTechniques = Array.from(new Set([...mandatoryTechniques, ...preferredTechniques]));

  const eligibleProposals: MatchProposal[] = [];
  const ineligibleWorkshops: { workshopId: string; workshopName: string; rejectionReasons: string[] }[] = [];

  for (const ws of workshops) {
    const filterBreakdown: MatchFilterReason[] = [];
    const rejectionReasons: string[] = [];

    // --- HARD FILTER 1: LOẠI HÌNH DỊCH VỤ ---
    const supportedServices = ws.serviceCapabilities || (ws.workshopHostCapacity > 0 ? ['workshop', 'gifts'] : ['gifts']);
    const servicePassed = supportedServices.includes(serviceType);
    if (!servicePassed) {
      const reason = `Xưởng không cung cấp dịch vụ ${serviceType === 'workshop' ? 'Workshop trải nghiệm' : 'Quà tặng sản xuất theo lô'}`;
      rejectionReasons.push(reason);
      filterBreakdown.push({
        criterion: 'Loại hình dịch vụ',
        passed: false,
        detail: reason
      });
    } else {
      filterBreakdown.push({
        criterion: 'Loại hình dịch vụ',
        passed: true,
        detail: `Hỗ trợ tốt dịch vụ ${serviceType === 'workshop' ? 'Workshop' : 'Quà tặng theo lô'}`
      });
    }

    // --- HARD FILTER 2: CÔNG SUẤT / QUY MÔ ---
    let capacityPassed = true;
    if (requiredScale > 0) {
      if (serviceType === 'workshop') {
        const maxWs = ws.maxCapacityWorkshop ?? ws.workshopHostCapacity ?? 15;
        const minWs = ws.minCapacityWorkshop ?? 1;
        if (requiredScale > maxWs) {
          capacityPassed = false;
          const reason = `Quy mô đoàn (${requiredScale} người) vượt quá sức chứa tối đa của không gian xưởng (${maxWs} người)`;
          rejectionReasons.push(reason);
          filterBreakdown.push({ criterion: 'Sức chứa workshop', passed: false, detail: reason });
        } else if (requiredScale < minWs) {
          capacityPassed = false;
          const reason = `Quy mô đoàn (${requiredScale} người) chưa đạt số người tối thiểu để tổ chức (${minWs} người)`;
          rejectionReasons.push(reason);
          filterBreakdown.push({ criterion: 'Sức chứa workshop', passed: false, detail: reason });
        } else {
          filterBreakdown.push({
            criterion: 'Sức chứa workshop',
            passed: true,
            detail: `Đáp ứng quy mô ${requiredScale} người (giới hạn tiếp đón: ${minWs} - ${maxWs} người)`
          });
        }
      } else {
        // Quà tặng
        const maxGifts = ws.maxCapacityGifts ?? 300;
        const minGifts = ws.minCapacityGifts ?? 10;
        if (requiredScale > maxGifts) {
          capacityPassed = false;
          const reason = `Số lượng đặt (${requiredScale} sản phẩm) vượt quá công suất mẻ lò của xưởng (${maxGifts} sản phẩm/mẻ)`;
          rejectionReasons.push(reason);
          filterBreakdown.push({ criterion: 'Công suất quà tặng', passed: false, detail: reason });
        } else if (requiredScale < minGifts) {
          capacityPassed = false;
          const reason = `Số lượng đặt (${requiredScale} sản phẩm) dưới mức tối thiểu để vào mẻ lò riêng (${minGifts} sản phẩm)`;
          rejectionReasons.push(reason);
          filterBreakdown.push({ criterion: 'Công suất quà tặng', passed: false, detail: reason });
        } else {
          filterBreakdown.push({
            criterion: 'Công suất quà tặng',
            passed: true,
            detail: `Đáp ứng lô ${requiredScale} sản phẩm (khoảng nhận: ${minGifts} - ${maxGifts} sản phẩm)`
          });
        }
      }
    }

    // --- HARD FILTER 3: KỸ THUẬT BẮT BUỘC (MANDATORY TECHNIQUES) ---
    let techniquesPassed = true;
    const wsTechniques = (ws.supportedTechniques || []).map(t => t.toLowerCase());
    const wsSpecialty = (ws.specialty || []).join(' ').toLowerCase();

    for (const mandatoryTech of mandatoryTechniques) {
      const hasTech = wsTechniques.some(t => t.includes(mandatoryTech) || mandatoryTech.includes(t)) ||
                      wsSpecialty.includes(mandatoryTech);
      if (!hasTech) {
        techniquesPassed = false;
        const reason = `Xưởng không hỗ trợ kỹ thuật bắt buộc: "${mandatoryTech}"`;
        rejectionReasons.push(reason);
        filterBreakdown.push({ criterion: `Kỹ thuật ${mandatoryTech}`, passed: false, detail: reason });
      }
    }

    if (mandatoryTechniques.length > 0 && techniquesPassed) {
      filterBreakdown.push({
        criterion: 'Kỹ thuật bắt buộc',
        passed: true,
        detail: `Hỗ trợ đầy đủ: ${mandatoryTechniques.join(', ')}`
      });
    }

    // --- HARD FILTER 4: THỜI GIAN / LEAD TIME (CHO QUÀ TẶNG) ---
    let leadTimePassed = true;
    if (serviceType === 'gifts' && daysUntilTarget !== null && ws.leadTimeDaysGifts && ws.leadTimeDaysGifts > 0) {
      if (daysUntilTarget < ws.leadTimeDaysGifts) {
        leadTimePassed = false;
        const reason = `Thời hạn bàn giao (${daysUntilTarget} ngày) ngắn hơn chu kỳ tạo hình & nung men tối thiểu của xưởng (${ws.leadTimeDaysGifts} ngày)`;
        rejectionReasons.push(reason);
        filterBreakdown.push({ criterion: 'Tiến độ mẻ lò', passed: false, detail: reason });
      } else {
        filterBreakdown.push({
          criterion: 'Tiến độ mẻ lò',
          passed: true,
          detail: `Thời gian đệm đủ an toàn (${daysUntilTarget} ngày so với chu kỳ mẻ ${ws.leadTimeDaysGifts} ngày)`
        });
      }
    }

    // --- ĐÁNH GIÁ ĐỦ ĐIỀU KIỆN VƯỢT QUA HARD FILTERS ---
    const isEligible = servicePassed && capacityPassed && techniquesPassed && leadTimePassed;

    if (!isEligible) {
      ineligibleWorkshops.push({
        workshopId: ws.id,
        workshopName: ws.name,
        rejectionReasons
      });
      continue;
    }

    // --- XẾP HẠNG (RANKING) CHO CÁC XƯỞNG ĐÃ VƯỢT QUA HARD FILTERS ---
    // Điểm số minh bạch 0 - 100
    let matchScore = 50; // Điểm nền tảng khi đã vượt qua toàn bộ hard filter
    const reasons: string[] = [];
    const matchedCapabilities: string[] = [];
    const unconfirmedConditions: string[] = [];

    // 1. Phù hợp chuyên môn & dòng men (+20 điểm)
    const topicText = `${request.title} ${request.description}`.toLowerCase();
    const isSpecialtyExact = ws.specialty.some(s => {
      const sLower = s.toLowerCase();
      return (sLower.includes('hỏa biến') && topicText.includes('hỏa biến')) ||
             (sLower.includes('men rạn') && topicText.includes('rạn')) ||
             (sLower.includes('men lam') && topicText.includes('lam')) ||
             (sLower.includes('bàn xoay') && topicText.includes('bàn xoay'));
    });

    if (isSpecialtyExact) {
      matchScore += 20;
      reasons.push(`Chuyên sâu đúng thế mạnh di sản: ${ws.specialty[0]}`);
      matchedCapabilities.push('Dòng men & tạo hình chuyên sâu');
    } else {
      reasons.push(`Năng lực chế tác gốm Bát Tràng đáp ứng tốt yêu cầu chung`);
    }

    // 2. Tối ưu công suất tiếp nhận (+15 điểm)
    if (serviceType === 'workshop') {
      const maxWs = ws.maxCapacityWorkshop || 20;
      const ratio = requiredScale / maxWs;
      if (ratio >= 0.7 && ratio <= 1.0) {
        matchScore += 15;
        reasons.push(`Quy mô ${requiredScale} người vừa vặn với không gian tiếp đón (${maxWs} người), tối ưu chất lượng tương tác`);
      } else {
        matchScore += 8;
        reasons.push(`Sức chứa tối đa ${maxWs} người đủ đáp ứng đoàn`);
      }
    } else {
      const maxG = ws.maxCapacityGifts || 200;
      const ratio = requiredScale / maxG;
      if (ratio >= 0.1 && ratio <= 0.8) {
        matchScore += 15;
        reasons.push(`Lô ${requiredScale} sản phẩm nằm trong dải công suất vận hành mẻ nung hiệu quả nhất (${ws.minCapacityGifts} - ${maxG} sản phẩm)`);
      } else {
        matchScore += 8;
        reasons.push(`Công suất xưởng đáp ứng tốt số lượng yêu cầu`);
      }
    }

    // 3. Khớp các kỹ thuật bổ sung (Preferred) (+10 điểm)
    let preferredMatchedCount = 0;
    for (const pref of preferredTechniques) {
      if (wsTechniques.some(t => t.includes(pref)) || wsSpecialty.includes(pref)) {
        preferredMatchedCount++;
        matchedCapabilities.push(`Hỗ trợ ${pref}`);
      }
    }
    if (preferredMatchedCount > 0) {
      matchScore += Math.min(10, preferredMatchedCount * 5);
      reasons.push(`Đáp ứng các tiêu chí trải nghiệm/hoàn thiện: ${matchedCapabilities.join(', ')}`);
    }

    // 4. Độ đệm tiến độ thời gian (+5 điểm)
    if (daysUntilTarget !== null && ws.leadTimeDaysGifts) {
      const buffer = daysUntilTarget - ws.leadTimeDaysGifts;
      if (buffer >= 5) {
        matchScore += 5;
        reasons.push(`Biên độ thời gian chuẩn bị rất an toàn (dư ${buffer} ngày so với mốc bàn giao)`);
      }
    }

    // --- ĐIỀU KIỆN CẦN XÁC MINH THÊM (UNCONFIRMED CONDITIONS) ---
    if (serviceType === 'workshop') {
      unconfirmedConditions.push(`Cần nghệ nhân ${ws.artisanLeader} xác nhận còn chỗ trống vào khung giờ ${requiredDate || 'ngày tổ chức'}`);
      unconfirmedConditions.push('Cần chốt danh sách chia nhóm bàn xoay và bố trí không gian thưởng trà');
    } else {
      unconfirmedConditions.push('Cần xưởng kiểm tra phôi đất nung và lịch xếp mẻ lò tháng này');
      if (mandatoryTechniques.includes('khắc logo')) {
        unconfirmedConditions.push('Cần file vector logo của khách để xưởng kiểm tra độ sắc nét khắc chìm');
      }
      unconfirmedConditions.push('Cần xác nhận báo giá chính thức từ xưởng (phụ thuộc quy cách hộp và độ dày men)');
    }

    // Phân loại trạng thái
    // Nếu có điểm từ 75 trở lên và không có rủi ro lịch hẹn -> Phù hợp sơ bộ
    // Ngược lại -> Cần xác minh thêm
    const status: MatchProposal['status'] = matchScore >= 75 ? 'phu_hop_so_bo' : 'can_xac_minh_them';
    const statusLabel = status === 'phu_hop_so_bo' ? 'Phù hợp sơ bộ' : 'Cần xác minh thêm';

    // Giá tham khảo minh họa (Non-binding)
    const indicativePriceNote = ws.indicativeBudgetRange?.displayNotice || 
      'Cần xác nhận báo giá (Chưa có báo giá tham khảo minh họa; xưởng sẽ gửi phương án bóc tách tại Mốc 2)';

    eligibleProposals.push({
      workshopId: ws.id,
      workshop: ws,
      status,
      statusLabel,
      matchScore: Math.min(98, matchScore), // Không bao giờ đặt 100% tuyệt đối
      reasons,
      matchedCapabilities,
      unconfirmedConditions,
      indicativePriceNote,
      filterBreakdown
    });
  }

  // Sắp xếp các xưởng đủ điều kiện theo điểm số giảm dần
  eligibleProposals.sort((a, b) => b.matchScore - a.matchScore);

  // Tối đa 3 phương án đề xuất
  const topRecommendations = eligibleProposals.slice(0, 3);

  // Xử lý trường hợp không có xưởng nào phù hợp (Empty State)
  let emptyExplanation: string | undefined = undefined;
  let ownerRecommendationTip: string | undefined = undefined;

  if (topRecommendations.length === 0) {
    if (serviceType === 'workshop' && requiredScale > 25) {
      emptyExplanation = `Hiện tại trong mạng lưới xưởng minh họa, quy mô lớn nhất tiếp đón workshop là 25 người. Yêu cầu của khách là ${requiredScale} người, vượt quá giới hạn sức chứa đơn lẻ của mọi xưởng.`;
      ownerRecommendationTip = 'Gợi ý cho Điều phối viên: Trao đổi với khách hàng để tách đoàn thành 2 ca workshop kế tiếp nhau, hoặc tổ chức tại không gian liên kết rộng hơn.';
    } else if (serviceType === 'gifts' && daysUntilTarget !== null && daysUntilTarget < 7) {
      emptyExplanation = `Thời hạn bàn giao khách yêu cầu quá gấp (${daysUntilTarget} ngày). Các xưởng thủ công Bát Tràng cần tối thiểu 7 - 14 ngày cho chu kỳ phơi mộc, tráng men và nung lò đạt chuẩn 1280°C.`;
      ownerRecommendationTip = 'Gợi ý cho Điều phối viên: Tư vấn khách chọn dòng sản phẩm phôi sẵn có tại xưởng để khắc logo nhanh, hoặc thương lượng dời hạn thêm 5 - 7 ngày.';
    } else {
      emptyExplanation = `Không có xưởng nào đáp ứng đồng thời các tiêu chí ràng buộc về dịch vụ (${serviceType === 'workshop' ? 'Workshop' : 'Quà tặng'}), quy mô (${requiredScale} ${scaleUnit}) và kỹ thuật bắt buộc.`;
      ownerRecommendationTip = 'Gợi ý cho Điều phối viên: Kiểm tra lại các yêu cầu kỹ thuật đặc thù hoặc liên hệ trực tiếp với nghệ nhân để trao đổi giải pháp cá biệt.';
    }
  }

  return {
    orderId: request.id,
    serviceType,
    requiredScale,
    scaleUnit,
    requiredDate,
    requiredTechniques: allRequiredTechniques,
    topRecommendations,
    ineligibleWorkshops,
    emptyExplanation,
    ownerRecommendationTip
  };
}
