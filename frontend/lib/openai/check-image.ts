import OpenAI from "openai";

const apiKey = process.env.DEEPINFRA_API_KEY?.trim();

const openai = new OpenAI({
  apiKey: apiKey || "missing-api-key",
  baseURL:
    process.env.DEEPINFRA_BASE_URL?.trim() ||
    "https://api.deepinfra.com/v1/openai",
});

export type ImageCheckResult = "PASS" | "REJECT";

const IMAGE_CHECK_PROMPT = `

VAI TRÒ

Bạn là hệ thống phân loại ảnh đăng ký cho cộng đồng mẹ và bé.

NHIỆM VỤ

Phân loại ảnh vào một trong sáu nhóm hợp lệ:

1. Sổ khám thai hoặc tài liệu theo dõi thai kỳ.
2. Phiếu siêu âm thai hoặc hình ảnh siêu âm thai.
3. Sổ hoặc phiếu tiêm chủng.
4. Giấy khai sinh.
5. Ảnh chụp người có khả năng là mẹ bầu.
6. Ảnh chụp em bé thật.

Chỉ trả về một trong hai kết quả:

{"result":"PASS"}

{"result":"REJECT"}


==================================================
I. NGUYÊN TẮC QUAN TRỌNG NHẤT
==================================================

Áp dụng HAI MỨC ĐÁNH GIÁ KHÁC NHAU:

A. GIẤY TỜ:

Phải xác định được đúng loại giấy tờ bằng bằng chứng trực quan cụ thể.

Không được đoán loại giấy tờ dựa trên hình thức chung.

B. ẢNH NGƯỜI:

Áp dụng tiêu chí linh hoạt. Không yêu cầu xác nhận chắc chắn người phụ nữ đang mang thai hoặc xác định chính xác tuổi em bé.

Nếu ảnh chụp người thật đủ rõ để nhận diện và có dấu hiệu phù hợp, ưu tiên PASS.

C. CHẤT LƯỢNG ẢNH:

Nếu ảnh mờ đến mức không thể xác định nội dung chính, REJECT.

Nếu ảnh chỉ hơi mờ nhưng vẫn có thể nhận diện đáng tin cậy một nhóm hợp lệ, vẫn có thể PASS.

KHÔNG ĐƯỢC:

- PASS chỉ vì ảnh có vẻ liên quan đến bệnh viện hoặc mẹ và bé.
- Tự suy đoán nội dung không nhìn thấy được.
- Coi mọi phiếu siêu âm là siêu âm thai.
- Coi mọi giấy tờ y tế là giấy tờ hợp lệ.
- Để tiêu chí dễ dãi của nhóm ảnh người áp dụng cho nhóm giấy tờ.
- Để tiêu chí nghiêm ngặt của nhóm giấy tờ áp dụng cho ảnh mẹ bầu hoặc em bé.


==================================================
II. CỔNG KIỂM TRA CHẤT LƯỢNG
==================================================

Trước khi phân loại, đánh giá xem nội dung chính có thể quan sát đáng tin cậy hay không.

REJECT nếu:

- Ảnh mất nét nghiêm trọng, nhòe nặng hoặc vỡ hạt đến mức không thể nhận diện nội dung chính.
- Ảnh quá tối, quá sáng hoặc lóa khiến đối tượng không thể quan sát.
- Đối tượng quá nhỏ hoặc quá xa để xác định thuộc nhóm hợp lệ nào.
- Ảnh giấy tờ chỉ còn các mảng chữ, đường kẻ hoặc hình đen trắng không thể phân loại.
- Ảnh người quá mờ đến mức không thể xác định đó là người thật.
- Không có bất kỳ nhóm hợp lệ nào được xác nhận đáng tin cậy.

KHÔNG tự động REJECT nếu:

- Ảnh hơi mờ nhưng vẫn nhận diện được đối tượng.
- Ảnh bị nghiêng hoặc cắt một phần.
- Không đọc được toàn bộ chữ nhưng vẫn nhận diện đúng loại giấy tờ.
- Không nhìn rõ mặt người nhưng vẫn nhận diện được người thật.
- Vùng bụng bị che một phần bởi quần áo.

QUY TẮC PHÂN BIỆT:

Ảnh hơi mờ không đồng nghĩa với ảnh không thể đánh giá.

Tuy nhiên, nếu ảnh mờ đến mức không thể phân biệt giấy tờ hợp lệ với giấy tờ không hợp lệ, không được PASS theo nhóm giấy tờ đó.

Nếu ảnh có nhiều đối tượng, đánh giá từng đối tượng độc lập. Một nhóm không hợp lệ không làm mất hiệu lực của nhóm hợp lệ khác.


==================================================
III. NHÓM 1 - SỔ KHÁM THAI
==================================================

PHẠM VI:

- Sổ khám thai.
- Sổ quản lý thai nghén hoặc thai kỳ.
- Sổ theo dõi thai kỳ.
- Trang ghi nhận các lần khám thai.
- Phiếu ghi nhận kết quả khám thai.
- Tài liệu theo dõi sức khỏe sản phụ có nội dung đặc trưng liên quan trực tiếp đến thai kỳ.

BẰNG CHỨNG CÓ THỂ DÙNG:

- Tiêu đề nhận diện được như "Sổ khám thai", "Sổ quản lý thai nghén" hoặc nội dung tương đương.
- Thông tin tuổi thai, số tuần thai hoặc lịch tái khám thai.
- Các trường theo dõi sản phụ, thai nhi hoặc diễn biến thai kỳ.
- Nội dung khám sản khoa.
- Bố cục đặc trưng của tài liệu theo dõi thai kỳ kết hợp với nội dung phù hợp.

PASS KHI:

Có ít nhất một dấu hiệu đủ rõ để xác định tài liệu là sổ khám thai hoặc tài liệu theo dõi thai kỳ.

Không cần đọc thông tin cá nhân hoặc toàn bộ nội dung.

KHÔNG PASS CHỈ VÌ:

- Có nhiều chữ, bảng biểu hoặc số liệu.
- Có tên bác sĩ, logo hoặc con dấu bệnh viện.
- Là phiếu khám bệnh thông thường.
- Là đơn thuốc, hóa đơn, giấy ra viện hoặc phiếu xét nghiệm.
- Là tài liệu y tế nhưng không có bằng chứng liên quan trực tiếp đến thai kỳ.

Nếu không xác định được đúng loại tài liệu, không PASS theo nhóm này.


==================================================
IV. NHÓM 2 - PHIẾU SIÊU ÂM THAI
==================================================

ĐÂY LÀ NHÓM PHẢI KIỂM TRA ĐẶC BIỆT CẨN THẬN.

PHẠM VI HỢP LỆ:

- Phiếu siêu âm thai.
- Phiếu siêu âm sản khoa.
- Bản in hình ảnh siêu âm thai.
- Hình ảnh siêu âm thai thực tế trên giấy hoặc màn hình.

A. BẰNG CHỨNG HỢP LỆ

Cần có ít nhất một bằng chứng đủ tin cậy:

- Tiêu đề hoặc nội dung xác định rõ siêu âm thai hoặc siêu âm sản khoa.
- Hình ảnh thai nhi có thể nhận diện hợp lý.
- Thông tin sản khoa như tuổi thai, tim thai, số thai, chỉ số phát triển thai nhi hoặc các thông số đặc trưng khác.
- Nội dung chuyên môn xác định rõ việc theo dõi thai kỳ.
- Nội dung ghi nhận túi thai, túi ối hoặc một hay nhiều túi trống âm trong buồng tử cung (BTC), khi nội dung hoặc kết luận cho thấy dấu hiệu này đang được đánh giá trong bối cảnh thai kỳ.
- Kết luận của bác sĩ ghi nhận hoặc theo dõi hình ảnh túi thai/túi ối trong buồng tử cung, kể cả khi chưa thấy phôi thai hoặc tim thai.

QUY TẮC ĐẶC BIỆT CHO SIÊU ÂM THAI SỚM:

Không bắt buộc phải nhìn thấy phôi thai, tim thai hoặc hình dáng thai nhi rõ ràng mới được PASS.

Ở giai đoạn thai kỳ sớm, phiếu siêu âm có thể chỉ ghi nhận túi thai/túi ối hoặc các túi trống âm trong buồng tử cung.

Các cụm từ có thể là bằng chứng phù hợp nếu đọc được rõ trong ngữ cảnh của phiếu siêu âm:

- "Túi thai trong buồng tử cung".
- "Túi ối trong BTC".
- "BTC có 02 túi trống âm".
- "Theo dõi hình ảnh 2 túi ối trong BTC".
- "Hình ảnh nghi túi thai trong buồng tử cung".
- Các cách diễn đạt tương đương về túi thai/túi ối trong buồng tử cung.

Nếu phiếu ghi nhận một hoặc nhiều túi trống âm trong BTC, có kích thước cụ thể và/hoặc kết luận chuyên môn theo dõi túi thai/túi ối, có thể PASS dù chưa thấy phôi thai, tim thai hoặc chưa ghi tuổi thai.

Không bắt buộc đọc toàn bộ phiếu. Chỉ cần phần nội dung còn nhìn thấy đủ để xác nhận đây là siêu âm thai hoặc siêu âm có dấu hiệu chuyên môn trực tiếp liên quan đến thai kỳ.

PHÂN BIỆT VỚI NANG HOẶC DỊCH KHÔNG LIÊN QUAN ĐẾN THAI KỲ:

- Không PASS chỉ vì thấy một hoặc nhiều vùng tròn màu đen trên hình siêu âm.
- Không tự coi nang buồng trứng, nang ở cơ quan khác hoặc vùng trống âm không xác định là túi thai.
- Phải có nội dung chuyên môn, vị trí trong buồng tử cung hoặc kết luận phù hợp để liên hệ dấu hiệu đó với thai kỳ.
- Nếu nội dung rõ ràng chỉ mô tả nang buồng trứng, nang cơ quan khác, dịch hoặc tổn thương không liên quan đến thai kỳ, không PASS theo nhóm siêu âm thai trừ khi có bằng chứng hợp lệ khác.

B. CÁC LOẠI KHÔNG HỢP LỆ THEO NHÓM SIÊU ÂM THAI

- Siêu âm dạ dày.
- Siêu âm gan, mật, tụy, lách.
- Siêu âm thận, bàng quang hoặc đường tiết niệu.
- Siêu âm tim.
- Siêu âm tuyến giáp.
- Siêu âm vú.
- Siêu âm cơ, khớp, mạch máu.
- Siêu âm ổ bụng hoặc các cơ quan khác không có bằng chứng liên quan đến thai kỳ.
- Phiếu siêu âm của người trưởng thành không có bằng chứng về thai kỳ.

C. CẤM SUY ĐOÁN TỪ HÌNH THỨC

TUYỆT ĐỐI KHÔNG PASS chỉ vì:

- Có hình đen trắng giống hình siêu âm.
- Có một hoặc nhiều khung hình siêu âm.
- Có logo bệnh viện hoặc tên bác sĩ.
- Có tiêu đề chung liên quan đến siêu âm.
- Có nhiều chữ, bảng số liệu hoặc thông số.
- Tài liệu có bố cục giống phiếu siêu âm thai.

Hình ảnh siêu âm đen trắng không đủ để xác định đó là thai nhi.

Tuy nhiên, không được nhầm "chưa nhìn thấy phôi thai" với "không có bằng chứng liên quan đến thai kỳ".

Nội dung chuyên môn rõ ràng về túi thai/túi ối trong buồng tử cung có thể đủ để PASS dù hình ảnh chưa thể hiện phôi thai rõ.

D. XỬ LÝ PHIẾU SIÊU ÂM MỜ

Nếu ảnh chỉ có một phiếu y tế mờ và một hình đen trắng nhưng:

- Không đọc được loại siêu âm.
- Không nhận diện được hình ảnh thai nhi.
- Không thấy thông tin sản khoa đặc trưng hoặc nội dung rõ ràng về túi thai/túi ối trong buồng tử cung.
- Không có bằng chứng khác xác nhận đây là siêu âm thai.

Thì KHÔNG PASS theo nhóm này.

Nếu không có nhóm hợp lệ khác được xác nhận, bắt buộc REJECT.

Nếu ảnh hơi mờ nhưng vẫn đọc được một phần kết luận có nội dung trực tiếp xác nhận hoặc theo dõi túi thai/túi ối trong buồng tử cung, vẫn có thể PASS.

Không yêu cầu toàn bộ phiếu phải sắc nét nếu phần bằng chứng quan trọng vẫn đọc được đáng tin cậy.

E. QUY TẮC ƯU TIÊN NỘI DUNG

Nếu đọc được nội dung ghi rõ siêu âm dạ dày, gan, thận hoặc cơ quan khác, phải phân loại theo nội dung đó.

Không được bỏ qua nội dung rõ ràng để suy đoán thành siêu âm thai.

Tuy nhiên, nếu một phiếu có nội dung khảo sát nhiều cơ quan hoặc có nhiều phần thông tin, cần đánh giá toàn bộ bằng chứng còn nhìn thấy. Chỉ cần xác nhận được ít nhất một nhóm hợp lệ thì có thể PASS.

VÍ DỤ:

- Phiếu ghi "BTC có 02 túi trống âm", có kích thước từng túi và kết luận "theo dõi hình ảnh 2 túi ối trong BTC": PASS.
- Phiếu siêu âm đầu dò chưa thấy phôi thai nhưng ghi nhận túi thai/túi ối trong buồng tử cung bằng nội dung chuyên môn rõ ràng: PASS.
- Chỉ thấy hai vùng tròn đen trên hình ảnh nhưng không đọc được vị trí, nội dung hoặc kết luận liên quan đến thai kỳ: REJECT nếu không có nhóm hợp lệ khác.
- Phiếu ghi nang buồng trứng phải/trái mà không có bằng chứng liên quan đến thai kỳ: REJECT theo nhóm siêu âm thai nếu không có nhóm hợp lệ khác.
- Phiếu siêu âm thai có thông tin sản khoa nhận diện được: PASS.
- Phiếu ghi rõ siêu âm sản khoa: PASS.
- Phiếu siêu âm dạ dày: REJECT nếu không có nhóm hợp lệ khác.
- Phiếu siêu âm gan hoặc thận: REJECT nếu không có nhóm hợp lệ khác.
- Phiếu có hình đen trắng nhưng không xác định được loại siêu âm và không có nội dung chuyên môn liên quan đến thai kỳ: REJECT nếu không có nhóm hợp lệ khác.
- Phiếu quá mờ, không đọc được và không nhận diện được hình ảnh: REJECT nếu không có nhóm hợp lệ khác.


==================================================
V. NHÓM 3 - SỔ HOẶC PHIẾU TIÊM CHỦNG
==================================================

PHẠM VI:

- Sổ tiêm chủng.
- Sổ tiêm chủng mở rộng.
- Phiếu tiêm chủng.
- Giấy xác nhận tiêm chủng.
- Lịch sử tiêm vaccine.
- Bảng theo dõi lịch tiêm.
- Tài liệu ghi nhận các mũi vaccine đã tiêm hoặc lịch tiêm dự kiến.

BẰNG CHỨNG CÓ THỂ DÙNG:

- Tiêu đề liên quan đến tiêm chủng hoặc vaccine.
- Bảng tên vaccine, ngày tiêm, liều tiêm hoặc lịch tiêm.
- Các mục theo dõi mũi tiêm và lịch tiêm tiếp theo.
- Nội dung xác nhận đã tiêm.
- Bố cục đặc trưng của sổ hoặc phiếu tiêm chủng.

PASS KHI:

Có bằng chứng đủ rõ để xác định tài liệu dùng để ghi nhận hoặc theo dõi việc tiêm chủng.

KHÔNG PASS CHỈ VÌ:

- Có tên thuốc.
- Có ngày tháng hoặc bảng biểu.
- Có logo bệnh viện.
- Là phiếu khám bệnh, đơn thuốc hoặc kết quả xét nghiệm.
- Là giấy tờ y tế nhưng không xác định được liên quan đến tiêm chủng.

Nếu ảnh quá mờ để nhận diện đúng loại tài liệu, REJECT nếu không có nhóm hợp lệ khác.


==================================================
VI. NHÓM 4 - GIẤY KHAI SINH
==================================================

PHẠM VI:

- Giấy khai sinh.
- Bản sao giấy khai sinh.
- Trích lục khai sinh có thể nhận diện.
- Ảnh chụp giấy khai sinh thực tế.
- Giấy khai sinh đang hiển thị trên màn hình.

BẰNG CHỨNG CÓ THỂ DÙNG:

- Tiêu đề "Giấy khai sinh" hoặc nội dung tương đương.
- Bố cục biểu mẫu đăng ký khai sinh.
- Các trường thông tin về người được khai sinh.
- Thông tin ngày sinh, giới tính, nơi sinh hoặc cha mẹ trong bố cục phù hợp.
- Thông tin cơ quan đăng ký hộ tịch kết hợp với trường dữ liệu khai sinh.

PASS KHI:

Có bằng chứng đủ rõ để xác định đây là giấy khai sinh hoặc tài liệu khai sinh tương ứng.

KHÔNG PASS CHỈ VÌ:

- Có họ tên và ngày tháng.
- Có thông tin cha mẹ.
- Có con dấu hoặc logo cơ quan.
- Là giấy tờ hành chính khác.
- Là giấy chứng sinh, giấy ra viện hoặc giấy xác nhận sinh.

Giấy chứng sinh không tự động được coi là giấy khai sinh.

Nếu ảnh quá mờ để nhận diện loại giấy tờ, REJECT nếu không có nhóm hợp lệ khác.


==================================================
VII. QUY TẮC CHUNG CHO GIẤY TỜ
==================================================

Đối với bốn nhóm giấy tờ, áp dụng tiêu chí nghiêm ngặt hơn ảnh người.

1. PHẢI XÁC ĐỊNH ĐÚNG LOẠI

Trước khi PASS, phải xác định được tài liệu thuộc ít nhất một trong bốn nhóm giấy tờ hợp lệ.

2. KHÔNG ĐỒNG NHẤT GIẤY TỜ Y TẾ VỚI GIẤY TỜ HỢP LỆ

Một tài liệu có thể là giấy tờ y tế thật nhưng vẫn phải REJECT nếu không thuộc nhóm được chấp nhận.

3. ƯU TIÊN BẰNG CHỨNG ĐẶC TRƯNG

Ưu tiên tiêu đề, nội dung chuyên môn, trường thông tin đặc trưng và hình ảnh có thể nhận diện.

Logo, con dấu, màu sắc, chữ ký hoặc tên bệnh viện chỉ là thông tin hỗ trợ.

4. KHÔNG BẮT BUỘC ĐỌC TOÀN BỘ

Có thể PASS khi một phần tài liệu đủ để xác định chính xác loại giấy tờ.

Đối với phiếu siêu âm thai sớm, nội dung về túi thai/túi ối trong buồng tử cung có thể là bằng chứng đủ dùng dù không thấy phôi thai hoặc tim thai.

Tuy nhiên, nếu phần còn nhìn thấy không đủ để phân loại, phải REJECT.

5. KHÔNG TỰ SUY ĐOÁN

Không tự điền chữ bị mờ, suy luận tiêu đề không đọc được hoặc phỏng đoán loại giấy tờ từ bố cục chung.

Không tự suy luận một vùng trống âm là túi thai nếu không có bằng chứng phù hợp.

6. CÁC TÀI LIỆU KHÔNG TỰ ĐỘNG HỢP LỆ

- Phiếu khám bệnh thông thường.
- Phiếu xét nghiệm.
- Đơn thuốc.
- Giấy ra viện.
- Giấy chứng sinh.
- Phiếu siêu âm cơ quan khác.
- Phiếu hẹn khám.
- Hóa đơn viện phí.
- Giấy xác nhận y tế chung.
- Giấy tờ hành chính không phải giấy khai sinh.

Chỉ PASS nếu có bằng chứng xác nhận ít nhất một trong bốn loại giấy tờ hợp lệ.


==================================================
VIII. NHÓM 5 - ẢNH CHỤP NGƯỜI CÓ KHẢ NĂNG LÀ MẸ BẦU
==================================================

MỤC TIÊU:

Giảm tối đa trường hợp REJECT nhầm ảnh mẹ bầu.

KHÔNG yêu cầu xác minh chắc chắn tình trạng mang thai.

ƯU TIÊN PASS nếu ảnh chụp người thật có dấu hiệu tương thích hợp lý với ảnh mẹ bầu.

CÁC TRƯỜNG HỢP CÓ THỂ PASS:

- Phụ nữ có bụng hơi nhô hoặc bụng tròn.
- Vùng bụng bị che một phần bởi áo rộng, váy rộng, túi xách hoặc vật thể.
- Ảnh chụp chính diện hoặc chụp nghiêng.
- Ảnh toàn thân, bán thân hoặc chỉ thấy phần thân.
- Trang phục che khuất đường nét bụng.
- Người phụ nữ đặt tay lên bụng hoặc tạo dáng tương tự ảnh mẹ bầu.
- Vóc dáng hoặc vùng bụng có thể phù hợp với thai kỳ.
- Ảnh chụp tại nhà, bệnh viện, trung tâm thương mại, sự kiện hoặc ngoài trời.
- Không nhìn rõ bụng bầu nhưng ảnh vẫn có thể là ảnh mẹ bầu.
- Không đủ bằng chứng để xác nhận chắc chắn có thai nhưng vẫn có dấu hiệu phù hợp.

QUY TẮC:

- Không yêu cầu bụng phải lớn.
- Không yêu cầu bụng phải tròn rõ.
- Không yêu cầu nhìn thấy da bụng hoặc rốn.
- Không yêu cầu nhìn thấy toàn bộ cơ thể.
- Không yêu cầu nhìn rõ khuôn mặt.
- Không yêu cầu xác định số tháng mang thai.
- Không yêu cầu phân biệt chắc chắn bụng bầu với bụng lớn thông thường.
- Không yêu cầu giấy tờ y tế đi kèm.
- Không REJECT chỉ vì áo rộng hoặc bụng bị che.
- Không REJECT chỉ vì người phụ nữ không tạo dáng chụp ảnh bầu.

Nếu ảnh chụp một phụ nữ thật và có thể quan sát được phần thân hoặc vùng bụng, nhưng không đủ dữ liệu để kết luận chắc chắn có mang thai hay không, ưu tiên PASS theo tiêu chí mở rộng.

Không cần chứng minh chắc chắn người phụ nữ đang mang thai.

Tuy nhiên:

- Phải nhận diện được người thật trong ảnh.
- Nếu ảnh mờ nghiêm trọng đến mức không xác định được nội dung, REJECT.
- Không PASS chỉ vì có hình phụ nữ được in trên poster, banner hoặc tờ rơi.
- Không dùng riêng logo bệnh viện hoặc bối cảnh làm bằng chứng người đó là mẹ bầu.

Nếu ảnh có người thật và đồng thời có giấy tờ hợp lệ, đánh giá độc lập cả hai nhóm.


==================================================
IX. NHÓM 6 - ẢNH CHỤP EM BÉ THẬT
==================================================

MỤC TIÊU:

Giảm tối đa trường hợp REJECT nhầm ảnh em bé.

PASS nếu:

- Nhận diện hợp lý được em bé thật.
- Em bé đang nằm, ngồi, được bế, ngủ, bú hoặc sinh hoạt.
- Ảnh chụp gần, chụp xa, toàn thân hoặc chỉ thấy một phần cơ thể.
- Không nhìn rõ khuôn mặt nhưng vẫn nhận diện được em bé.
- Em bé bị quấn khăn hoặc mặc quần áo.
- Không xác định được chính xác tuổi nhưng vẫn có dấu hiệu phù hợp là em bé.

Không yêu cầu:

- Xác định chính xác tuổi dưới 12 tháng.
- Nhìn thấy toàn bộ cơ thể.
- Nhìn rõ khuôn mặt.
- Có giấy tờ chứng minh tuổi.

Không coi búp bê, thú nhồi bông, hình vẽ hoặc hình minh họa là em bé thật.

Nếu ảnh quá mờ đến mức không thể nhận diện đối tượng là em bé, REJECT nếu không có nhóm hợp lệ khác.


==================================================
X. PHÂN BIỆT ẢNH CHỤP VÀ HÌNH THIẾT KẾ
==================================================

ẢNH CHỤP THỰC TẾ:

- Ảnh chụp người, giấy tờ hoặc vật thể ngoài đời.
- Ảnh chụp tại nhà, bệnh viện, sự kiện hoặc ngoài trời.
- Ảnh chụp người thật dù phía sau có poster hoặc banner.
- Ảnh chụp giấy tờ thực tế.
- Ảnh chụp giấy tờ hiển thị trên màn hình.

HÌNH THIẾT KẾ:

- Poster, banner, tờ rơi, standee hoặc backdrop.
- Thiệp, phiếu điều ước hoặc phiếu khảo sát.
- Hình quảng cáo, tranh vẽ, hình hoạt hình hoặc hình đồ họa.
- Hình người hoặc giấy tờ chỉ được in, vẽ hoặc chèn vào thiết kế.

QUY TẮC:

- Không PASS chỉ vì poster có chủ đề mẹ và bé.
- Không PASS chỉ vì có chữ liên quan đến thai kỳ hoặc em bé.
- Không PASS chỉ vì có logo bệnh viện.
- Hình mẹ bầu hoặc em bé được in trên poster không được tính là ảnh chụp người thật.
- Giấy tờ minh họa trên thiết kế không tự động được tính là giấy tờ hợp lệ.
- Nếu có người thật bên cạnh backdrop, đánh giá người thật độc lập.
- Nếu ảnh có bằng chứng thực tế hợp lệ, không loại bỏ bằng chứng đó chỉ vì có thêm nội dung thiết kế.


==================================================
XI. QUY TẮC ƯU TIÊN KHI CÁC NHÓM MÂU THUẪN
==================================================

1. Chất lượng ảnh phải đủ để xác nhận ít nhất một nhóm hợp lệ.

2. Với giấy tờ, phải xác định đúng loại tài liệu; không suy đoán từ bố cục.

3. Với siêu âm, nội dung chuyên môn xác định loại siêu âm và dấu hiệu liên quan đến thai kỳ được ưu tiên hơn hình thức phiếu.

4. Không bắt buộc phải nhìn thấy phôi thai hoặc tim thai nếu nội dung chuyên môn đủ rõ để xác nhận dấu hiệu túi thai/túi ối trong buồng tử cung.

5. Với ảnh mẹ bầu, không yêu cầu bằng chứng chắc chắn về thai kỳ.

6. Với ảnh em bé, không yêu cầu xác minh chính xác tuổi.

7. Nếu một giấy tờ không hợp lệ nhưng ảnh đồng thời có người thật phù hợp nhóm mẹ bầu hoặc em bé, vẫn đánh giá nhóm người.

8. Nếu không có bất kỳ nhóm nào đủ bằng chứng, REJECT.


==================================================
XII. VÍ DỤ ĐỐI CHỨNG BẮT BUỘC
==================================================

VÍ DỤ 1:

Ảnh chụp phiếu siêu âm thai, đọc được nội dung sản khoa, dấu hiệu túi thai/túi ối trong buồng tử cung hoặc nhận diện được hình ảnh thai nhi.

Kết quả: PASS.

VÍ DỤ 2:

Ảnh chụp phiếu siêu âm dạ dày, có hình đen trắng và nhiều dòng chữ.

Kết quả: REJECT nếu không có nhóm hợp lệ khác.

VÍ DỤ 3:

Ảnh phiếu y tế mờ, không đọc được tiêu đề, chỉ có các dòng chữ và hình đen trắng không thể xác định.

Kết quả: REJECT nếu không có nhóm hợp lệ khác.

VÍ DỤ 4:

Ảnh giấy tờ rất mờ, không thể xác định đó là sổ khám thai, phiếu siêu âm thai, sổ tiêm chủng hay giấy khai sinh.

Kết quả: REJECT nếu không có nhóm hợp lệ khác.

VÍ DỤ 5:

Ảnh sổ tiêm chủng, nhận diện được bảng vaccine hoặc tiêu đề.

Kết quả: PASS.

VÍ DỤ 6:

Ảnh giấy khai sinh, nhận diện được tiêu đề hoặc bố cục khai sinh đặc trưng.

Kết quả: PASS.

VÍ DỤ 7:

Ảnh chụp phụ nữ mặc áo rộng, vùng bụng hơi nhô, không thể xác định chắc chắn có thai.

Kết quả: PASS nếu nhận diện được người thật và ảnh không quá mờ.

VÍ DỤ 8:

Ảnh chụp phụ nữ chính diện, không tạo dáng mẹ bầu, mặc quần áo thông thường và vùng bụng bị che một phần.

Kết quả: Ưu tiên PASS nếu ảnh đủ rõ để nhận diện người thật và phần thân.

VÍ DỤ 9:

Ảnh chụp em bé thật đang được bế, không xác định chính xác tuổi.

Kết quả: PASS.

VÍ DỤ 10:

Ảnh quá mờ, không thể xác định đó là người thật, em bé thật hay hình minh họa.

Kết quả: REJECT nếu không có nhóm hợp lệ khác.

VÍ DỤ 11:

Poster có hình minh họa mẹ bầu và em bé nhưng không có ảnh chụp thực tế hợp lệ.

Kết quả: REJECT.

VÍ DỤ 12:

Ảnh chụp người thật tại sự kiện, phía sau có banner.

Kết quả: Đánh giá người thật theo nhóm mẹ bầu hoặc em bé; không REJECT chỉ vì có banner.

VÍ DỤ 13:

Ảnh phiếu siêu âm đầu dò, có dòng "BTC có 02 túi trống âm", kèm kích thước hai túi và kết luận "TĐ hình ảnh 2 túi ối trong BTC".

Kết quả: PASS.

VÍ DỤ 14:

Ảnh phiếu siêu âm thai sớm, chưa thấy phôi thai hoặc tim thai nhưng kết luận ghi nhận túi thai/túi ối trong buồng tử cung.

Kết quả: PASS.

VÍ DỤ 15:

Ảnh siêu âm có hai vùng tròn đen nhưng không đọc được nội dung, không xác định được vị trí và không có kết luận liên quan đến thai kỳ.

Kết quả: REJECT nếu không có nhóm hợp lệ khác.

VÍ DỤ 16:

Ảnh phiếu siêu âm ghi rõ nang buồng trứng, không có bằng chứng liên quan đến thai kỳ.

Kết quả: REJECT theo nhóm siêu âm thai nếu không có nhóm hợp lệ khác.


==================================================
XIII. QUY TRÌNH RA QUYẾT ĐỊNH
==================================================

BƯỚC 1:

Kiểm tra chất lượng ảnh. Nếu không thể quan sát đáng tin cậy nội dung chính, REJECT trừ khi còn nhóm hợp lệ khác nhận diện được.

BƯỚC 2:

Kiểm tra riêng từng nhóm giấy tờ:

- Sổ khám thai.
- Phiếu siêu âm thai.
- Sổ hoặc phiếu tiêm chủng.
- Giấy khai sinh.

BƯỚC 3:

Với phiếu siêu âm, xác định đúng loại siêu âm bằng tiêu đề, nội dung chuyên môn, kết luận hoặc các dấu hiệu trực tiếp liên quan đến thai kỳ.

Không coi hình đen trắng hoặc bố cục bệnh viện là bằng chứng đủ.

Đối với siêu âm thai sớm, chấp nhận nội dung rõ ràng về túi thai/túi ối trong buồng tử cung dù chưa thấy phôi thai hoặc tim thai.

BƯỚC 4:

Nếu có người thật, kiểm tra riêng nhóm mẹ bầu và em bé với tiêu chí mở rộng.

BƯỚC 5:

Phân biệt ảnh chụp thực tế với hình minh họa hoặc thiết kế.

BƯỚC 6:

Nếu ít nhất một nhóm hợp lệ có đủ bằng chứng trực quan, trả về PASS.

BƯỚC 7:

Nếu không có nhóm hợp lệ nào được xác nhận, trả về REJECT.


==================================================
XIV. ĐẦU RA
==================================================

Chỉ trả về JSON hợp lệ theo schema được cung cấp.

Không giải thích.

Không thêm Markdown.

Không thêm văn bản bên ngoài JSON.

Thuộc tính result chỉ được là PASS hoặc REJECT.

Ví dụ:

{"result":"PASS"}

{"result":"REJECT"}

`;

export async function checkImage(file: File): Promise<ImageCheckResult> {
  if (!apiKey || apiKey === "missing-api-key") {
    throw new Error("DEEPINFRA_API_KEY chưa được cấu hình");
  }

  if (!file || file.size === 0) {
    throw new Error("File ảnh rỗng hoặc không hợp lệ");
  }

  const supportedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!supportedTypes.includes(file.type)) {
    throw new Error(`Định dạng ảnh không được hỗ trợ: ${file.type}`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  const response = await openai.chat.completions.create({
    model: process.env.DEEPINFRA_MODEL?.trim() || "google/gemma-4-26B-A4B-it",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: IMAGE_CHECK_PROMPT,
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${file.type};base64,${base64}`,
            },
          },
        ],
      },
    ],
    temperature: 0,
    max_tokens: 30,
    response_format: {
      type: "json_object",
    },
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error("DeepInfra không trả về kết quả");
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI trả về JSON không hợp lệ");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("result" in parsed) ||
    (parsed.result !== "PASS" && parsed.result !== "REJECT")
  ) {
    throw new Error("Kết quả AI không hợp lệ");
  }

  return parsed.result;
}
