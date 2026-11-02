import type { OrderRequest, PassportMilestone, UserRole } from '../types';

/**
 * ĐỘNG CƠ XÂY DỰNG TIMELINE TRỰC QUAN CHO CREATIVE PASSPORT (ĐỢT 2B.03)
 * Tự động đồng bộ với trạng thái và dữ liệu thực tế của OrderRequest
 * Không bịa mốc, không đánh dấu hoàn tất những mốc chưa phát sinh.
 */
export function buildPassportMilestones(request: OrderRequest, userRole: UserRole = 'customer'): PassportMilestone[] {
  const isWorkshop = request.serviceType === 'workshop';
  const milestones: PassportMilestone[] = [];

  // 1. Mốc 1: Khách xác nhận yêu cầu & Smart Brief
  milestones.push({
    id: 'm1_brief',
    stepIndex: 1,
    label: 'Khách xác nhận yêu cầu (Smart Brief)',
    status: 'completed',
    timestamp: request.createdAt,
    actorRole: 'Khách hàng',
    actorName: request.contactName,
    summary: `Yêu cầu ${isWorkshop ? 'workshop trải nghiệm' : 'quà tặng thủ công theo lô'} đã được đối chiếu thông số và xác nhận.`,
    documentRef: 'Smart Brief đã chuẩn hóa (rawBrief & structuredRequirement)'
  });

  // 2. Mốc 2: Điều phối xưởng
  let m2Status: PassportMilestone['status'] = 'pending';
  let m2Summary = 'Chờ Điều phối viên sàng lọc Smart Matching để phân công xưởng Bát Tràng.';
  if (request.dispatchedAt) {
    m2Status = 'completed';
    m2Summary = `Đã chuyển yêu cầu tới ${request.assignedWorkshopName || 'xưởng đối tác'} (${request.ownerDispatchNote || 'Thẩm định năng lực'}).`;
  } else if (request.status === 'cho_tiep_nhan' || request.status === 'dang_tu_van') {
    m2Status = 'in_progress';
    m2Summary = 'Điều phối viên đang xem xét thông số để đề xuất xưởng phù hợp.';
  }

  milestones.push({
    id: 'm2_dispatch',
    stepIndex: 2,
    label: 'Owner tiếp nhận & Phân công xưởng',
    status: m2Status,
    timestamp: request.dispatchedAt,
    actorRole: 'Điều phối viên',
    actorName: 'Điều phối viên MADE IN VIETNAM LAB',
    summary: m2Summary,
    documentRef: request.dispatchedAt ? 'Phiếu phân công xưởng Bát Tràng' : undefined
  });

  // 3. Mốc 3: Xưởng phản hồi khả thi & báo giá xưởng
  let m3Status: PassportMilestone['status'] = 'pending';
  let m3Summary = 'Chờ xưởng đối chiếu lịch lò nung hoặc lịch nghệ nhân.';
  if (request.artisanResponse) {
    if (request.artisanResponse.decision === 'confirmed') {
      m3Status = 'completed';
      m3Summary = userRole === 'artisan'
        ? `Xưởng xác nhận khả thi: Báo giá xưởng ${request.artisanResponse.proposedPrice} • Lịch: ${request.artisanResponse.proposedSchedule}.`
        : `Xưởng xác nhận năng lực khả thi • Lịch: ${request.artisanResponse.proposedSchedule}.`;
    } else {
      m3Status = 'failed';
      m3Summary = `Xưởng từ chối: ${request.artisanResponse.rejectionReason || 'Kín lịch'}. Chờ điều phối xưởng khác.`;
    }
  } else if (request.status === 'da_chuyen_xuong') {
    m3Status = 'in_progress';
    m3Summary = `Xưởng (${request.assignedWorkshopName}) đang kiểm tra khả năng đáp ứng.`;
  }

  milestones.push({
    id: 'm3_artisan',
    stepIndex: 3,
    label: 'Xưởng phản hồi khả thi',
    status: m3Status,
    timestamp: request.artisanResponse?.respondedAt,
    actorRole: 'Xưởng thủ công',
    actorName: request.assignedWorkshopName || 'Nghệ nhân Bát Tràng',
    summary: m3Summary,
    documentRef: request.artisanResponse?.decision === 'confirmed' ? 'Biên bản thẩm định khả thi & Báo giá xưởng' : undefined
  });

  // 4. Mốc 4: Khách phê duyệt phương án & báo giá (Mốc 2 Đề án)
  let m4Status: PassportMilestone['status'] = 'pending';
  let m4Summary = 'Chờ thẩm định hoàn tất để xây dựng phương án bóc tách chi phí.';
  if (request.clientApproval?.approved) {
    m4Status = 'completed';
    m4Summary = userRole === 'artisan'
      ? `Khách hàng đã phê duyệt phiên bản thiết kế ${request.clientApproval.approvedDesignVersion}.`
      : `Khách hàng đã phê duyệt phiên bản ${request.clientApproval.approvedDesignVersion}${request.ownerProposal ? ` (Tổng chi phí: ${request.ownerProposal.clientTotalPrice})` : ''}.`;
  } else if (request.status === 'cho_khach_duyet') {
    m4Status = 'in_progress';
    m4Summary = userRole === 'artisan'
      ? 'Phương án kỹ thuật đã chuẩn bị xong, đang chờ khách hàng phê duyệt.'
      : `Phương án & Báo giá trọn gói (${request.ownerProposal?.clientTotalPrice || 'Đang lập'}) đã gửi, chờ khách duyệt.`;
  } else if (request.status === 'cho_owner_kiem_tra') {
    m4Status = 'in_progress';
    m4Summary = 'Xưởng đã xác nhận; Điều phối viên đang bóc tách chi phí để gửi khách.';
  }

  milestones.push({
    id: 'm4_client_approval',
    stepIndex: 4,
    label: 'Khách phê duyệt báo giá & Phương án',
    status: m4Status,
    timestamp: request.clientApproval?.approvedAt || (request.status === 'cho_khach_duyet' ? request.ownerProposal?.designOrProgramVersion : undefined),
    actorRole: 'Khách hàng',
    actorName: request.clientApproval?.approvedBy || request.contactName,
    summary: m4Summary,
    documentRef: request.clientApproval?.approved ? `Phiên bản phê duyệt: ${request.clientApproval.approvedDesignVersion}` : undefined
  });

  // 5. Mốc 5: Xưởng thực hiện & Báo cáo hoàn tất
  let m5Status: PassportMilestone['status'] = 'pending';
  let m5Summary = isWorkshop ? 'Chưa bắt đầu chuẩn bị tổ chức workshop.' : 'Chưa bắt đầu chế tác mẻ gốm.';
  if (request.artisanExecutionReport) {
    m5Status = 'completed';
    m5Summary = isWorkshop
      ? `Buổi workshop đã tổ chức thành công (${request.artisanExecutionReport.reportNotes}).`
      : `Xưởng đã hoàn thành mẻ nung và đóng gói (${request.artisanExecutionReport.reportNotes}).`;
  } else if (request.status === 'dang_thuc_hien' || request.status === 'can_xu_ly_qc') {
    m5Status = 'in_progress';
    m5Summary = isWorkshop
      ? 'Xưởng đang chuẩn bị không gian tiếp đón, đất sét và bàn xoay.'
      : 'Xưởng đang tiến hành tạo hình, vẽ men mộc và nung chín.';
  }

  milestones.push({
    id: 'm5_execution',
    stepIndex: 5,
    label: isWorkshop ? 'Tổ chức buổi trải nghiệm workshop' : 'Xưởng chế tác & Báo cáo hoàn tất',
    status: m5Status,
    timestamp: request.artisanExecutionReport?.reportedAt,
    actorRole: 'Xưởng thủ công',
    actorName: request.assignedWorkshopName || 'Nghệ nhân Bát Tràng',
    summary: m5Summary,
    documentRef: request.artisanExecutionReport ? 'Báo cáo hoàn tất thực hiện của xưởng' : undefined
  });

  // 6. Mốc 6: Owner kiểm tra chất lượng (QC)
  let m6Status: PassportMilestone['status'] = 'pending';
  let m6Summary = 'Chờ xưởng hoàn thành công việc để tiến hành kiểm tra chất lượng.';
  if (request.qcRecord) {
    if (request.qcRecord.result === 'dat') {
      m6Status = 'completed';
      m6Summary = `QC Đạt tiêu chuẩn hồ sơ đã duyệt. Căn cứ: ${request.qcRecord.notes}`;
    } else {
      m6Status = 'failed';
      m6Summary = `QC Chưa đạt yêu cầu: ${request.qcRecord.notes}. Yêu cầu xưởng xử lý bổ sung.`;
    }
  } else if (request.status === 'cho_owner_qc') {
    m6Status = 'in_progress';
    m6Summary = 'Xưởng đã báo xong; Điều phối viên đang kiểm tra chất lượng tại chỗ.';
  }

  milestones.push({
    id: 'm6_qc',
    stepIndex: 6,
    label: 'Kiểm tra chất lượng (QC)',
    status: m6Status,
    timestamp: request.qcRecord?.inspectedAt,
    actorRole: 'Điều phối viên',
    actorName: request.qcRecord?.inspectorName || 'Chuyên viên QC MADE IN VIETNAM LAB',
    summary: m6Summary,
    documentRef: request.qcRecord ? `Biên bản QC (${request.qcRecord.result === 'dat' ? 'ĐẠT' : 'CẦN XỬ LÝ'})` : undefined
  });

  // 7. Mốc 7: Bàn giao & Nghiệm thu hoàn tất (Mốc 3 Đề án)
  let m7Status: PassportMilestone['status'] = 'pending';
  let m7Summary = 'Chờ kiểm định chất lượng đạt chuẩn để tiến hành bàn giao.';
  if (request.handoverRecord && request.status === 'hoan_thanh') {
    m7Status = 'completed';
    m7Summary = isWorkshop
      ? `Buổi trải nghiệm đã hoàn tất trọn vẹn. Xác nhận bởi: ${request.handoverRecord.confirmedBy}.`
      : `Đã bàn giao sản phẩm hoàn tất. Căn cứ: ${request.handoverRecord.documentBasis}.`;
  } else if (request.status === 'cho_khach_nghiem_thu') {
    m7Status = 'in_progress';
    m7Summary = isWorkshop
      ? 'QC đạt chuẩn; Chờ khách hàng xác nhận hoàn tất buổi trải nghiệm.'
      : 'Sản phẩm đã kiểm định QC đạt chuẩn; Chờ xác nhận bàn giao nhận hàng.';
  }

  milestones.push({
    id: 'm7_handover',
    stepIndex: 7,
    label: isWorkshop ? 'Xác nhận hoàn tất trải nghiệm' : 'Xác nhận bàn giao & Hoàn tất đơn',
    status: m7Status,
    timestamp: request.handoverRecord?.confirmedAt,
    actorRole: 'Khách hàng',
    actorName: request.handoverRecord?.confirmedBy || request.contactName,
    summary: m7Summary,
    documentRef: request.handoverRecord ? (request.handoverRecord.method === 'client_online' ? 'Xác nhận trực tuyến qua Customer Portal' : `Chứng từ: ${request.handoverRecord.documentBasis}`) : undefined
  });

  return milestones;
}
