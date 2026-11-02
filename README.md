# MADE IN VIETNAM LAB — INTERACTIVE PROTOTYPE (PHIÊN BẢN ĐỢT 2A HOÀN THIỆN)
**Startup Zone 2026 • Nền Tảng Điều Phối Thủ Công Gốm Sứ Bát Tràng**

> **Tầm nhìn:** Kết nối nhu cầu trải nghiệm văn hóa và quà tặng doanh nghiệp với các xưởng gốm thủ công Bát Tràng (Hà Nội).  
> **Nguyên tắc cốt lõi:** Mô hình điều phối Asset-Light, bóc tách minh bạch giữa chi phí chế tác xưởng và phí dịch vụ điều phối của nền tảng; tôn trọng và phát huy vai trò độc lập của nghệ nhân; không sở hữu lò nung hay xưởng sản xuất.  
> **Design System & Typography:** Kế thừa hệ thống melsou typography với Font Tiêu đề **`Lora`** và Font Nội dung/UI **`Plus Jakarta Sans`**; bảng màu Di sản: Terracotta (`#C85A32`), Forest Green (`#1E3A2F`), Warm Ivory (`#FDFBF7`).

---

## 1. Khởi Chạy Localhost

```bash
cd D:\STARTUP_ZONE_2026\MADE_IN_VIETNAM_LAB\Prototype

# Cài đặt phụ thuộc (nếu chưa có)
npm install

# Khởi chạy máy chủ phát triển
npm run dev
```

Truy cập hệ thống tại: **`http://localhost:5173/`**

---

## 2. Chu Trình Nghiệp Vụ "Một Hồ Sơ — Ba Lần Xác Nhận"

Hệ thống hoạt động trên một nguồn dữ liệu đồng bộ duy nhất giữa 3 vai trò: **Khách hàng (Customer)**, **Chủ nền tảng / Điều phối viên (Owner)**, và **Xưởng thủ công Bát Tràng (Artisan)** thông qua chu trình chuẩn:

### Lần 1 — Xác Nhận Nhu Cầu (Confirm Need)
- **Thao tác:** Khách hàng chọn dịch vụ (*Cultural Creation Experience* hoặc *Cultural Gifts*), điền thông số và kiểm tra lại thông tin (Review Step) trước khi chính thức gửi.
- **Hệ thống:** Khởi tạo tức thì hồ sơ giao dịch số hóa **Creative Passport** kèm mã yêu cầu định danh duy nhất (Monotonic Counter `YC-26xx` và internal UUID). Trạng thái chuyển sang `Chờ tiếp nhận`.

### Lần 2 — Thẩm Định Khả Năng & Phê Duyệt Phương Án (Confirm Feasibility & Approval)
- **Bước 2.1 (Điều phối xưởng):** Owner tiếp nhận yêu cầu và điều phối sang xưởng Bát Tràng có chuyên môn phù hợp trong mạng lưới đối tác. Trạng thái: `Đã chuyển xưởng`.
- **Bước 2.2 (Xưởng phản hồi):** Đại diện xưởng thẩm định năng lực lò nung/lịch tiếp đón, đề xuất mức giá xưởng và cam kết kỹ thuật (hoặc từ chối có lý do cụ thể). Trạng thái: `Xưởng phản hồi • Cần duyệt`.
- **Bước 2.3 (Owner bóc tách chi phí):** Owner kiểm tra phương án xưởng, bóc tách giá xưởng vs. phí điều phối MADE IN VIETNAM LAB, tính tổng giá thanh toán và gửi phương án hoàn chỉnh cho khách. Trạng thái: `Chờ khách duyệt`.
- **Bước 2.4 (Khách phê duyệt):** Khách hàng đối chiếu mẫu thiết kế/chương trình và tích chọn xác nhận đồng ý điều kiện. Sau khi bấm duyệt, đơn chính thức chuyển sang trạng thái `Đang thực hiện`.

### Lần 3 — Nghiệm Thu Chất Lượng & Bàn Giao Hoàn Tất (Confirm Completion & Handover)
- **Bước 3.1 (Xưởng báo cáo):** Xưởng hoàn thành buổi workshop hoặc mẻ nung thành phẩm và gửi báo cáo thực hiện. Trạng thái: `Xưởng báo xong • Chờ QC` (nghiêm cấm nhảy cóc sang hoàn thành).
- **Bước 3.2 (Owner QC):** Owner kiểm tra chất lượng thực tế và ghi nhận kết quả:
  - Nếu `Đạt chuẩn`: Chuyển sang trạng thái `QC Đạt • Chờ bàn giao`.
  - Nếu `Chưa đạt`: Chuyển sang trạng thái `QC chưa đạt • Cần xử lý` để xưởng khắc phục.
- **Bước 3.3 (Khách xác nhận bàn giao):** Khách hàng xác nhận trực tuyến hoặc Owner ghi nhận theo chứng từ/biên bản ngoài hệ thống (ghi rõ người ký nhận, thời điểm và số biên bản).
  - *Điều kiện kỹ thuật tiên quyết:* Chỉ cho phép hoàn tất khi kết quả QC đạt chuẩn (`result === 'dat'`).
  - Sau khi xác nhận, đơn chuyển sang trạng thái `Đã hoàn thành` và hoàn tất chu trình Một hồ sơ — Ba lần xác nhận.

---

## 3. Kiến Trúc Kỹ Thuật & Cải Tiến Sau Source Code Audit Đợt 2A

### A. Transition Guards Trong Quản Lý Trạng Thái (`AppContext.tsx`)
Mọi thao tác cập nhật dữ liệu đều được bảo vệ bằng các điều kiện chuyển trạng thái nghiêm ngặt:
- Chặn thao tác nghiệp vụ trên các đơn đã `hoan_thanh` hoặc `da_huy`.
- Chỉ cho phép dispatch khi đơn ở trạng thái `cho_tiep_nhan`, `dang_tu_van`, hoặc `xuong_tu_choi`.
- Chỉ nhận phản hồi xưởng khi đơn đang ở trạng thái `da_chuyen_xuong`.
- Chỉ gửi báo giá cho khách khi xưởng đã đồng ý (`decision === 'confirmed'`) và trạng thái là `cho_owner_kiem_tra`.
- Chỉ cho phép khách duyệt khi đơn đang ở trạng thái `cho_khach_duyet` và có đầy đủ phương án bóc tách.
- Chỉ xưởng mới có thể gửi báo cáo hoàn thành khi đơn đang `dang_thuc_hien`.
- Chỉ thực hiện QC khi đơn có báo cáo thực hiện từ xưởng (`cho_owner_qc` hoặc `can_xu_ly_qc`).
- **Chặn hoàn tất bàn giao nếu kết quả QC không phải là `dat`**.

### B. Cơ Chế Sinh Mã Đơn Hàng Đơn Điệu & Không Trùng Lặp
- Sử dụng biến đếm `mivl_order_counter_v2a` trong `localStorage` kết hợp thuật toán kiểm tra tập hợp mã hiện hữu `existingIds` để đảm bảo mã người dùng `YC-26xx` tăng tuần tự và không bao giờ bị trùng.
- Mỗi đơn hàng được cấp thêm một định danh nội bộ duy nhất `internalId` (`mivl_{timestamp}_{random}`).
- Các nút gửi biểu mẫu được trang bị cờ `isSubmitting` chống nhấp đúp (double-click prevention).

### C. Tính Toán Giá & Phí Linh Hoạt (Dynamic Pricing)
- Xóa bỏ hoàn toàn các giá trị cố định giả định.
- Hệ thống trích xuất giá thực tế do xưởng đề xuất (`artisanResponse.proposedPrice`), cho phép Owner nhập phí điều phối, tự động cộng tổng chi phí gửi khách hàng theo công thức số học và định dạng chuẩn tiền tệ Việt Nam (`xx.xxx.xxx VNĐ`).
- Kiểm tra tính hợp lệ: `Giá xưởng > 0` và `Tổng giá gửi khách > Giá xưởng`.

### D. Phân Lập Cuộc Trò Chuyện (Chat Isolation)
- Cấu trúc `ChatMessage` bao gồm `conversationId`, `customerId`, `customerName`, và `relatedRequestId`.
- Khách hàng tại mỗi đơn hàng chỉ xem được luồng tin nhắn trao đổi của chính đơn hàng đó (`conv_YC-xxxx`).
- Trên Owner Dashboard, hệ thống tổng hợp danh sách các luồng hội thoại (`ConversationThread`) theo từng khách hàng, cho phép chọn luồng và phản hồi chính xác đến từng khách hàng riêng biệt.

### E. Dữ Liệu Khởi Tạo Sạch & Kịch Bản Mẫu An Toàn
- Khi khởi động lần đầu hoặc sau khi bấm "Đặt lại toàn bộ dữ liệu", danh sách đơn hàng và tin nhắn hoàn toàn **RỖNG (Empty State)**.
- Khi người trải nghiệm bấm nạp kịch bản mẫu từ menu điều hướng (Role Switcher), hệ thống hiển thị hộp thoại xác nhận rõ ràng, gắn cờ `isDemoScenario: true` trên đơn mẫu và phân tách với dữ liệu tự tạo.
- Toàn bộ các ô nhập liệu QC, biên bản bàn giao và báo cáo thực hiện đều được đưa về chuỗi rỗng kèm placeholder gợi ý trung tính, loại bỏ hoàn toàn các văn bản khẳng định gán sẵn.

---

## 4. Phạm Vi Thử Nghiệm & Giới Hạn Kỹ Thuật (Technical Scope & Boundaries)

Interactive Prototype được thiết kế để Ban Giám khảo và các bên liên quan trải nghiệm trực quan luồng vận hành của đề án Startup Zone 2026. Để bảo đảm tính tinh gọn và tập trung vào trải nghiệm người dùng, các giới hạn kỹ thuật dưới đây được áp dụng có chủ đích:

1. **Bộ nhớ cục bộ (Single-Browser localStorage):**
   - Dữ liệu đơn hàng, tin nhắn và hồ sơ được lưu trữ trong `localStorage` của trình duyệt đang mở.
   - Trải nghiệm 3 vai trò được thực hiện thông qua công cụ chuyển đổi vai trò (Role Switcher) trong cùng một trình duyệt, không yêu cầu hệ thống tài khoản đa phiên (Multi-tenant JWT / Session Auth) hoặc cơ sở dữ liệu đám mây (Supabase / Firebase).
2. **Không kết nối thanh toán thật:**
   - Hệ thống mô phỏng việc chốt điều kiện, bóc tách chi phí và ghi nhận chứng từ thanh toán/bàn giao, không tích hợp cổng thanh toán trực tuyến thực tế.
3. **Phân định lộ trình phát triển (Roadmap Boundaries):**
   - **Đợt 2A (Hiện tại):** Hoàn thiện quy trình cốt lõi giữa 3 vai trò Khách hàng — Owner — Xưởng thủ công với dữ liệu đồng bộ, transition guards chặt chẽ và hồ sơ Creative Passport.
   - **Đợt 2B (Kế hoạch tiếp theo):** Tích hợp công cụ hỗ trợ chuẩn hóa brief bằng AI, thuật toán xếp hạng phân bổ xưởng đối tác tự động và quản lý phiên bản thiết kế nâng cao.
